// store/boardStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { getAllWorkflows } from "./components/Examples/examples";

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
          status: "draft", // draft, deployed, recent
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

      // Project Management
      setCurrentProject: (projectId) => {
        set({ currentProject: projectId });
      },

      setSelectedTab: (tab) => {
        set({ selectedTab: tab });
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

      // Getters
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

      // Node/Edge Operations for Current Project
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

        const newEdge = {
          ...params,
          id: `edge_${params.source}_${params.target}_${Date.now()}`,
          animated: true,
          style: { stroke: "#666666", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed", color: "#666666" },
        };

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
      },

      // Node operations
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
        const { currentProject, projects } = get();
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
    }),
    {
      name: "board-store",
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
        selectedTab: state.selectedTab,
      }),
    }
  )
);

export default useBoardStore;
