import {
  Background,
  Controls,
  MiniMap,
  NodeResizer,
  NodeToolbar,
  Panel,
  ReactFlow,
  SelectionMode,
  Handle,
  Position,
} from "@xyflow/react";
import React, { useEffect, useCallback, useState, use } from "react";
import VersionTimelineModal from "./Timeline";
import "@xyflow/react/dist/style.css";
import CustomNode from "../Node/CustomNode";
import useBoardStore from "../../../../store/store";
import { nodeTypes, panOnDrag } from "../../data";
import ToolMenu from "../LayoutComponents/ToolMenu";
import NodesSheet from "../LayoutComponents/NodesSheet";
import NodePalette from "../LayoutComponents/PropertiesMenu";
import { NodeContextMenu } from "../Node/NodeContextMenu";
import { useNodeOperations } from "../../NodeOperations";
import EdgeConditionEditor from "./EdgeConditionEditor";
import ConnectionTest from "./ConnectionTest";
import LoadingAnimation from "../../../../components/LoadingAnimation";
import { useLocation, useNavigate } from "react-router-dom";

// CSS to remove all possible borders and outlines
const flowStyles = `
  .react-flow {
    outline: none !important;
    border: none !important;
  }
  .react-flow:focus {
    outline: none !important;
    border: none !important;
  }
  .react-flow__renderer {
    outline: none !important;
    border: none !important;
  }
  .react-flow__container {
    outline: none !important;
    border: none !important;
  }
  .react-flow__pane {
    outline: none !important;
    border: none !important;
  }
  .react-flow__viewport {
    outline: none !important;
    border: none !important;
  }
  
  /* Selected node styling */
  .react-flow__node.selected {
    box-shadow: 0 0 0 2px #3b82f6 !important;
  }
  
  /* Custom selected node styling */
  .custom-node-selected {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
    transform: scale(1.02) !important;
    transition: all 0.2s ease-in-out !important;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = flowStyles;
  if (!document.head.querySelector("style[data-reactflow-border-fix]")) {
    styleElement.setAttribute("data-reactflow-border-fix", "true");
    document.head.appendChild(styleElement);
  }
}

const FlowBoard = ({ projectId, walletAddress, versionTrigger }) => {
  const {
    getCurrentProject,
    setCurrentProject,
    getNodes,
    getEdges,
    onNodesChange,
    onEdgesChange,
    createProject,
    onConnect,
    updateNodeProperties,
  } = useBoardStore();

  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const [versions, setVersions] = useState([]);

  useEffect(() => {
    fetchVersions();
  }, [versionTrigger]);

  useEffect(() => {
    if (location.pathname.endsWith("/create")) {
      // Create a new project with default or custom data
      const newProjectId = createProject({
        name: "Untitled Project",
        description: "A new workflow project",
        nodes: [],
        edges: [],
      });
      setCurrentProject(newProjectId);
      navigate(`/project/${newProjectId}`);
    }
  }, [location.pathname]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVersions = async () => {
    projectId = currentProject?.id || projectId;
    if (!walletAddress || !projectId) {
      alert("Wallet address and project ID are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/save?walletId=${encodeURIComponent(
          walletAddress
        )}&projectId=${encodeURIComponent(projectId)}`
      );
      const data = await response.json();

      if (data.success) {
        setVersions(data.versions || []);
        setIsModalOpen(true);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Failed to load versions:", err);
      alert("Failed to load versions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVersions([]);
  };

  const {
    selectedNode,
    handleNodeClick,
    duplicateSelectedNode,
    deleteSelectedNode,
    resetNodeToDefaults,
    clearSelection,
  } = useNodeOperations();

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showEdgeEditor, setShowEdgeEditor] = useState(false);
  const currentProject = getCurrentProject();

  // Set current project when component mounts or projectId changes
  useEffect(() => {
    if (projectId && projectId !== currentProject?.id) {
      setCurrentProject(projectId);
    }
  }, [projectId, currentProject?.id, setCurrentProject]);

  // Handle node click for selection
  const onNodeClick = useCallback(
    (event, node) => {
      event.stopPropagation();
      handleNodeClick(event, node);
    },
    [handleNodeClick]
  );

  // Handle edge double-click for condition editing
  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setShowEdgeEditor(true);
  }, []);

  // Handle connection validation
  const isValidConnection = useCallback((connection) => {
    // Allow all connections for now - can add validation logic later
    console.log("Validating connection:", connection);
    return true;
  }, []);

  // Handle connection start
  const onConnectStart = useCallback(
    (event, { nodeId, handleId, handleType }) => {
      console.log("Connection started:", { nodeId, handleId, handleType });
    },
    []
  );

  // Handle connection end
  const onConnectEnd = useCallback((event) => {
    console.log("Connection ended");
  }, []);

  // Handle right-click context menu
  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();

      // Select the node when right-clicked
      if (selectedNode !== node.id) {
        handleNodeClick(event, node);
      }

      // Calculate position for context menu
      const pane = event.currentTarget.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;

      setContextMenu({
        nodeId: node.id,
        x: x < pane.width - 200 ? x : x - 200,
        y: y < pane.height - 150 ? y : y - 150,
      });
    },
    [selectedNode, handleNodeClick]
  );

  // Handle pane click to clear selection and context menu
  const onPaneClick = useCallback(() => {
    clearSelection();
    setContextMenu(null);
  }, [clearSelection]);

  // Handle context menu actions
  const handleContextMenuAction = useCallback(
    (action, nodeId) => {
      switch (action) {
        case "duplicate":
          duplicateSelectedNode(nodeId);
          break;
        case "delete":
          deleteSelectedNode(nodeId);
          break;
        case "reset":
          resetNodeToDefaults(nodeId);
          break;
      }
      setContextMenu(null);
    },
    [duplicateSelectedNode, deleteSelectedNode, resetNodeToDefaults]
  );

  // Enhanced node types with selection support
  const enhancedNodeTypes = {
    ...nodeTypes,
    custom: (props) => (
      <div className={selectedNode === props.id ? "custom-node-selected" : ""}>
        <CustomNode
          {...props}
          selected={selectedNode === props.id}
          data={{
            ...props.data,
            onUpdateProperties: updateNodeProperties,
          }}
        />
      </div>
    ),
  };

  // Show loading or error state if no project is available
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#0a0a0a]">
        <div className="text-center text-white">
          <div className="text-lg font-semibold mb-2">
            {projectId ? "Loading project..." : "No project selected"}
          </div>
          <div className="text-sm text-gray-400">
            {projectId
              ? "Please wait while we load your project"
              : "Please select a project from the dashboard"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a]">
      {isModalOpen && (
        <VersionTimelineModal versions={versions} onClose={handleCloseModal} />
      )}
      <div
        className="w-full h-full relative"
        style={{
          position: "relative",
          outline: "none",
          border: "none",
          top: "-1px",
          left: "-1px",
        }}
      >
        <ReactFlow
          nodes={getNodes()}
          edges={getEdges()}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          isValidConnection={isValidConnection}
          nodeTypes={enhancedNodeTypes}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onPaneClick={onPaneClick}
          panOnScroll
          selectionOnDrag
          panOnDrag={panOnDrag}
          selectionMode={SelectionMode.Partial}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          style={{
            border: "none",
            outline: "none",
            boxShadow: "none",
            width: "100%",
            height: "100%",
          }}
          minZoom={0.05}
          maxZoom={4}
          defaultZoom={0.8}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          snapToGrid={true}
          snapGrid={[15, 15]}
          connectionLineType="smoothstep"
          connectionLineStyle={{ stroke: "#666666", strokeWidth: 2 }}
          connectionMode="loose"
          connectOnClick={false}
          deleteKeyCode={null}
          nodeOrigin={[0.5, 0.5]}
        >
          <Background
            variant="dots"
            color="#404040"
            gap={20}
            size={1.5}
            style={{
              backgroundColor: "#0a0a0a",
            }}
          />

          <MiniMap
            nodeStrokeColor={(node) =>
              selectedNode === node.id ? "#3b82f6" : "#ffffff"
            }
            nodeColor={(node) =>
              selectedNode === node.id ? "#1e40af" : "#262626"
            }
            nodeStrokeWidth={2}
            zoomable
            pannable
            position="bottom-left"
            maskColor="rgba(10, 10, 10, 0.8)"
            style={{
              backgroundColor: "#171717",
              border: "1px dotted #404040",
              borderRadius: "24px",
            }}
          />

          <Controls
            position="bottom-right"
            style={{
              backgroundColor: "#171717",
              borderRadius: "12px",
              border: "1px solid #404040",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              color: "#ffffff",
              padding: "8px",
            }}
          />

          {/* Project Info Panel */}
          <Panel
            position="top-left"
            className="bg-[#171717] border border-[#404040] rounded-lg p-3 text-white text-xs"
          >
            <div className="flex flex-col gap-1">
              <div className="font-semibold">{currentProject.name}</div>
              <div className="text-gray-400">
                {getNodes().length} nodes • {getEdges().length} connections
              </div>
              <div className="text-gray-500">
                Status:{" "}
                <span className="capitalize">{currentProject.status}</span>
              </div>
              {selectedNode && (
                <div className="text-blue-400 mt-1">
                  Selected: {selectedNode}
                </div>
              )}
              <button
                onClick={fetchVersions}
                disabled={loading}
                className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-700 w-full text-left hover:text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Load Previous Version"}
              </button>
            </div>
          </Panel>
          {loader && <LoadingAnimation />}
          {/* Layout Components */}
          <NodesSheet />
          <Panel position="bottom-center">
            <ToolMenu setLoader={setLoader} />
          </Panel>
          <NodeToolbar />
          <NodeResizer />
          <NodePalette />
        </ReactFlow>

        {/* Context Menu */}
        {contextMenu && (
          <NodeContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            nodeId={contextMenu.nodeId}
            onAction={handleContextMenuAction}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Edge Condition Editor */}
        {showEdgeEditor && selectedEdge && (
          <EdgeConditionEditor
            edge={selectedEdge}
            onClose={() => {
              setShowEdgeEditor(false);
              setSelectedEdge(null);
            }}
          />
        )}

        {/* Debug Component - Remove in production */}
        {process.env.NODE_ENV === "development" && <ConnectionTest />}
      </div>
    </div>
  );
};

export default FlowBoard;
