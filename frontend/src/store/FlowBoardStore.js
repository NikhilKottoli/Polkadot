import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { getAllWorkflows } from "../pages/Playground/components/Examples/examples";
import html2canvas from "html2canvas";

const defaultBoards = getAllWorkflows();

const useBoardStore = create(
  persist(
    (set, get) => ({
      // Projects (Boards)
      projects: Object.keys(defaultBoards).reduce((acc, key) => {
        acc[key] = {
          id: key,
          name:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1"),
          description: `${key} workflow project`,
          status: "draft",
          thumbnail: "herobg.png",
          nodes: defaultBoards[key],
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return acc;
      }, {}),
      currentProject: null,
      selectedTab: "all",
      selectedNode: null,

      // Project Management
      setCurrentProject: (projectId) => {
        set({ currentProject: projectId });
      },

      setSelectedTab: (tab) => {
        set({ selectedTab: tab });
      },

      setSelectedNode: (nodeId) => {
        set({ selectedNode: nodeId });
      },

      createProject: (projectData) => {
        const { projects } = get();
        const projectId = `project_${Date.now()}`;
        const newProject = {
          id: projectId,
          name: projectData.name || "New Project",
          description: projectData.description || "New workflow project",
          status: "draft",
          thumbnail: projectData.thumbnail || "herobg.png",
          nodes: projectData.nodes || [],
          edges: projectData.edges || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          projects: {
            ...projects,
            [projectId]: newProject,
          },
        });

        return projectId;
      },

      updateProject: (projectId, updates) => {
        const { projects } = get();
        if (!projects[projectId]) return;

        set({
          projects: {
            ...projects,
            [projectId]: {
              ...projects[projectId],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      deleteProject: (projectId) => {
        const { projects, currentProject } = get();
        const { [projectId]: deleted, ...remainingProjects } = projects;

        // Clear cached thumbnail
        get().clearThumbnailCache(projectId);

        set({
          projects: remainingProjects,
          currentProject: currentProject === projectId ? null : currentProject,
        });
      },

      duplicateProject: (projectId, newName) => {
        const { projects } = get();
        const originalProject = projects[projectId];

        if (originalProject) {
          const newProjectId = `project_${Date.now()}`;
          const duplicatedProject = {
            ...originalProject,
            id: newProjectId,
            name: newName || `${originalProject.name} (Copy)`,
            status: "draft",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            projects: {
              ...projects,
              [newProjectId]: duplicatedProject,
            },
          });

          return newProjectId;
        }
      },

      // Enhanced Screenshot and Caching Methods
      saveProjectThumbnail: async (projectId, screenshotElement) => {
        try {
          // Check if element is provided, if not it's already base64 data
          let thumbnailDataUrl;

          if (typeof screenshotElement === "string") {
            // Already base64 data from TopBar component
            thumbnailDataUrl = screenshotElement;
          } else {
            // DOM element - capture with html2canvas
            const canvas = await html2canvas(screenshotElement, {
              backgroundColor: "#1a1a1a",
              scale: 0.5,
              width: 400,
              height: 300,
              useCORS: true,
              allowTaint: true,
              logging: false,
              ignoreElements: (element) => {
                return (
                  element.classList.contains("react-flow__controls") ||
                  element.classList.contains("react-flow__minimap") ||
                  element.tagName === "BUTTON"
                );
              },
            });

            thumbnailDataUrl = canvas.toDataURL("image/png", 0.8);
          }

          // Store in localStorage with size management
          const cacheKey = `thumbnail_${projectId}`;
          try {
            // Check localStorage space before storing
            const currentSize = new Blob([thumbnailDataUrl]).size;
            if (currentSize > 1024 * 1024) {
              // 1MB limit per thumbnail
              console.warn("Thumbnail too large, compressing...");
              // Create smaller version
              const tempCanvas = document.createElement("canvas");
              const ctx = tempCanvas.getContext("2d");
              const img = new Image();

              await new Promise((resolve) => {
                img.onload = () => {
                  tempCanvas.width = 300;
                  tempCanvas.height = 200;
                  ctx.drawImage(img, 0, 0, 300, 200);
                  thumbnailDataUrl = tempCanvas.toDataURL("image/jpeg", 0.6);
                  resolve();
                };
                img.src = thumbnailDataUrl;
              });
            }

            localStorage.setItem(cacheKey, thumbnailDataUrl);
            console.log("Thumbnail cached successfully");
          } catch (storageError) {
            console.warn("localStorage full, clearing old thumbnails");
            // Clear old thumbnails if storage is full
            get().clearOldThumbnailCache(projectId);
            // Try storing again
            try {
              localStorage.setItem(cacheKey, thumbnailDataUrl);
            } catch (retryError) {
              console.error(
                "Failed to store thumbnail after cleanup:",
                retryError
              );
            }
          }

          // Update project with thumbnail
          const { projects } = get();
          if (projects[projectId]) {
            set({
              projects: {
                ...projects,
                [projectId]: {
                  ...projects[projectId],
                  thumbnail: thumbnailDataUrl,
                  thumbnailUpdatedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              },
            });
          }

          return thumbnailDataUrl;
        } catch (error) {
          console.error("Failed to save thumbnail:", error);
          return null;
        }
      },

      getCachedThumbnail: (projectId) => {
        if (typeof window === "undefined") return null;

        const cacheKey = `thumbnail_${projectId}`;
        const cached = localStorage.getItem(cacheKey);

        // Validate cached thumbnail
        if (cached && cached.startsWith("data:image/")) {
          return cached;
        }

        // Return project thumbnail as fallback
        const { projects } = get();
        return projects[projectId]?.thumbnail || "herobg.png";
      },

      clearThumbnailCache: (projectId) => {
        if (typeof window === "undefined") return;

        const cacheKey = `thumbnail_${projectId}`;
        localStorage.removeItem(cacheKey);
      },

      clearOldThumbnailCache: (excludeProjectId) => {
        if (typeof window === "undefined") return;

        const { projects } = get();
        const activeProjectIds = Object.keys(projects);

        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("thumbnail_")) {
            const projectId = key.replace("thumbnail_", "");
            // Remove thumbnails for deleted projects or old ones
            if (
              !activeProjectIds.includes(projectId) &&
              projectId !== excludeProjectId
            ) {
              localStorage.removeItem(key);
            }
          }
        });
      },

      clearAllThumbnailCache: () => {
        if (typeof window === "undefined") return;

        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("thumbnail_")) {
            localStorage.removeItem(key);
          }
        });
      },

      // Preload thumbnails for better performance
      preloadThumbnails: async () => {
        const { projects } = get();
        const projectList = Object.values(projects);

        for (const project of projectList) {
          const cached = get().getCachedThumbnail(project.id);
          if (!cached || cached === "herobg.png") {
            // Generate thumbnail if missing
            console.log(`Generating thumbnail for project: ${project.name}`);
            // This would be called when the project is opened
          }
        }
      },

      // Rest of your existing methods remain the same...
      getCurrentProject: () => {
        const { projects, currentProject } = get();
        return projects[currentProject] || null;
      },

      getFilteredProjects: () => {
        const { projects, selectedTab } = get();
        const projectList = Object.values(projects);

        switch (selectedTab) {
          case "deployed":
            return projectList.filter((p) => p.status === "deployed");
          case "recent":
            return projectList
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .slice(0, 10);
          case "draft":
            return projectList.filter((p) => p.status === "draft");
          default:
            return projectList;
        }
      },

      getProjectStats: () => {
        const { projects } = get();
        const projectList = Object.values(projects);

        return {
          total: projectList.length,
          deployed: projectList.filter((p) => p.status === "deployed").length,
          draft: projectList.filter((p) => p.status === "draft").length,
          recent: projectList.filter((p) => {
            const daysDiff =
              (new Date() - new Date(p.updatedAt)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
          }).length,
        };
      },

      // Node/Edge Operations (keeping your existing implementation)
      getNodes: () => {
        const { projects, currentProject } = get();
        return projects[currentProject]?.nodes || [];
      },

      getEdges: () => {
        const { projects, currentProject } = get();
        return projects[currentProject]?.edges || [];
      },

      onNodesChange: (changes) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: applyNodeChanges(changes, projects[currentProject].nodes),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      onEdgesChange: (changes) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              edges: applyEdgeChanges(changes, projects[currentProject].edges),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      onConnect: (params) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        // Get source and target nodes
        const sourceNode = projects[currentProject].nodes.find(n => n.id === params.source);
        const targetNode = projects[currentProject].nodes.find(n => n.id === params.target);

        // Determine edge label based on node types
        let label = 'default';
        if (sourceNode?.data?.nodeType?.includes('logic')) {
          // For logic nodes, determine if this is a true/false branch
          const outgoingEdges = projects[currentProject].edges.filter(e => e.source === params.source);
          label = outgoingEdges.length === 0 ? 'true' : 'false';
        }

        const newEdge = {
          ...params,
          id: `edge_${params.source}_${params.target}_${Date.now()}`,
          animated: true,
          style: { stroke: "#666666", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed", color: "#666666" },
          label,
          data: {
            sourceType: sourceNode?.data?.nodeType,
            targetType: targetNode?.data?.nodeType,
            dataFlow: {
              from: sourceNode?.data?.properties?.output || {},
              to: targetNode?.data?.properties?.input || {},
            },
          },
        };

        // Update execution order if needed
        const sourceSequence = sourceNode?.sequence || 0;
        const targetSequence = targetNode?.sequence || 0;
        
        if (targetSequence <= sourceSequence) {
          // Update target node's sequence to be after source
          const updatedNodes = projects[currentProject].nodes.map(node => {
            if (node.id === params.target) {
              return {
                ...node,
                sequence: sourceSequence + 1,
              };
            }
            return node;
          });

          set({
            projects: {
              ...projects,
              [currentProject]: {
                ...projects[currentProject],
                nodes: updatedNodes,
                edges: addEdge(newEdge, projects[currentProject].edges),
                updatedAt: new Date().toISOString(),
              },
            },
          });
        } else {
          set({
            projects: {
              ...projects,
              [currentProject]: {
                ...projects[currentProject],
                edges: addEdge(newEdge, projects[currentProject].edges),
                updatedAt: new Date().toISOString(),
              },
            },
          });
        }
      },

      // Node operations (keeping your existing implementation)
      addNode: (node) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        const newNode = {
          ...node,
          id: node.id || `node_${Date.now()}`,
        };

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: [...projects[currentProject].nodes, newNode],
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      deleteNode: (nodeId) => {
        const { currentProject, projects, selectedNode } = get();
        if (!projects[currentProject]) return;

        const nodes = projects[currentProject].nodes.filter(
          (n) => n.id !== nodeId
        );
        const edges = projects[currentProject].edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes,
              edges,
              updatedAt: new Date().toISOString(),
            },
          },
          selectedNode: selectedNode === nodeId ? null : selectedNode,
        });
      },

      updateNode: (nodeId, updates) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: projects[currentProject].nodes.map((node) =>
                node.id === nodeId
                  ? {
                      ...node,
                      ...updates,
                      data: { ...node.data, ...updates.data },
                    }
                  : node
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      updateNodeProperties: (nodeId, properties) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: projects[currentProject].nodes.map((node) =>
                node.id === nodeId
                  ? {
                      ...node,
                      data: { 
                        ...node.data, 
                        properties: {
                          ...node.data.properties,
                          ...properties
                        }
                      },
                    }
                  : node
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      duplicateNode: (nodeId) => {
        const { projects, currentProject } = get();
        if (!projects[currentProject]) return;

        const originalNode = projects[currentProject].nodes.find(
          (n) => n.id === nodeId
        );
        if (!originalNode) return;

        const newNodeId = `node_${Date.now()}`;
        const duplicatedNode = {
          ...originalNode,
          id: newNodeId,
          position: {
            x: originalNode.position.x + 50,
            y: originalNode.position.y + 50,
          },
          data: {
            ...originalNode.data,
            label: `${originalNode.data.label} (Copy)`,
          },
        };

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: [...projects[currentProject].nodes, duplicatedNode],
              updatedAt: new Date().toISOString(),
            },
          },
        });

        return newNodeId;
      },

      // Helper function to detect cycles in the graph
      detectCycles: (nodes, edges) => {
        const visited = new Set();
        const recursionStack = new Set();

        const dfs = (nodeId) => {
          visited.add(nodeId);
          recursionStack.add(nodeId);

          const outgoingEdges = edges.filter(edge => edge.source === nodeId);
          for (const edge of outgoingEdges) {
            if (!visited.has(edge.target)) {
              if (dfs(edge.target)) return true;
            } else if (recursionStack.has(edge.target)) {
              return true;
            }
          }

          recursionStack.delete(nodeId);
          return false;
        };

        for (const node of nodes) {
          if (!visited.has(node.id)) {
            if (dfs(node.id)) return true;
          }
        }
        return false;
      },

      // Helper function to perform topological sort
      topologicalSort: (nodes, edges) => {
        const visited = new Set();
        const temp = new Set();
        const order = [];

        const visit = (nodeId) => {
          if (temp.has(nodeId)) return; // Cycle detected
          if (visited.has(nodeId)) return;

          temp.add(nodeId);
          const outgoingEdges = edges.filter(edge => edge.source === nodeId);
          for (const edge of outgoingEdges) {
            visit(edge.target);
          }
          temp.delete(nodeId);
          visited.add(nodeId);
          order.unshift(nodeId);
        };

        for (const node of nodes) {
          if (!visited.has(node.id)) {
            visit(node.id);
          }
        }

        return order;
      },

      // Enhanced export function with support for loops and parallel flows
      exportFlowchart: () => {
        const { projects, currentProject } = get();
        if (!projects[currentProject]) return null;

        const nodes = projects[currentProject].nodes;
        const edges = projects[currentProject].edges;

        // Helper to find outgoing edges for a node
        const getOutgoingEdges = (nodeId) => edges.filter(edge => edge.source === nodeId);
        
        // Helper to find incoming edges for a node
        const getIncomingEdges = (nodeId) => edges.filter(edge => edge.target === nodeId);
        
        // Helper to find root nodes (nodes with no incoming edges)
        const findRootNodes = () => nodes.filter(node => getIncomingEdges(node.id).length === 0);
        
        // Helper to build a node's next/branches structure
        const buildNodeNext = (nodeId) => {
          const outgoingEdges = getOutgoingEdges(nodeId);
          if (outgoingEdges.length === 0) return null;
          
          const node = nodes.find(n => n.id === nodeId);
          const isLogicNode = node?.data?.nodeType?.includes('logic');
          const isParallelNode = node?.data?.nodeType?.includes('parallel');
          
          if (isLogicNode) {
            // Logic node with true/false branches
            const branches = {};
            outgoingEdges.forEach(edge => {
              branches[edge.label] = {
                target: edge.target,
                dataFlow: edge.data?.dataFlow || {},
              };
            });
            return { branches };
          } else if (isParallelNode) {
            // Parallel execution
            return {
              parallel: outgoingEdges.map(edge => ({
                target: edge.target,
                dataFlow: edge.data?.dataFlow || {},
              })),
            };
          } else if (outgoingEdges.length > 1) {
            // Multiple outputs without specific logic
            return {
              next: outgoingEdges.map(edge => ({
                target: edge.target,
                label: edge.label,
                dataFlow: edge.data?.dataFlow || {},
              })),
            };
          } else {
            // Linear flow
            return {
              next: {
                target: outgoingEdges[0].target,
                dataFlow: outgoingEdges[0].data?.dataFlow || {},
              },
            };
          }
        };
        
        // Check for cycles (loops)
        const hasLoops = get().detectCycles(nodes, edges);
        
        // Get execution order
        const executionOrder = get().topologicalSort(nodes, edges);
        
        // Build the result structure
        const result = {
          nodes: [],
          hasLoops,
          executionOrder,
        };
        
        // Process each node
        const processNode = (nodeId, visited = new Set()) => {
          if (visited.has(nodeId)) return; // Avoid cycles
          visited.add(nodeId);
          
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return;
          
          const nodeData = {
            id: node.id,
            type: node.type,
            nodeType: node.data.nodeType,
            properties: node.data.properties,
            sequence: node.sequence,
            ...buildNodeNext(nodeId),
          };
          
          result.nodes.push(nodeData);
          
          // Recursively process next nodes
          const outgoingEdges = getOutgoingEdges(nodeId);
          outgoingEdges.forEach(edge => {
            processNode(edge.target, visited);
          });
        };
        
        // Start from root nodes
        const rootNodes = findRootNodes();
        rootNodes.forEach(root => processNode(root.id));
        
        return result;
      },

      // Update execution order
      updateExecutionOrder: (newOrder) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        const updatedNodes = projects[currentProject].nodes.map((node, index) => ({
          ...node,
          sequence: newOrder.indexOf(node.id) >= 0 ? newOrder.indexOf(node.id) : index,
        }));

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: updatedNodes,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // Load AI-generated flowchart
      loadAIFlowchart: (flowchartData) => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        console.log('📊 Loading AI-generated flowchart:', flowchartData);

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: flowchartData.nodes || [],
              edges: flowchartData.edges || [],
              updatedAt: new Date().toISOString(),
            },
          },
        });

        return true;
      },

      // Clear current flowchart
      clearFlowchart: () => {
        const { currentProject, projects } = get();
        if (!projects[currentProject]) return;

        set({
          projects: {
            ...projects,
            [currentProject]: {
              ...projects[currentProject],
              nodes: [],
              edges: [],
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },
    }),
    {
      name: "board-store",
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
        selectedTab: state.selectedTab,
        selectedNode: state.selectedNode,
      }),
    }
  )
);

export default useBoardStore;
