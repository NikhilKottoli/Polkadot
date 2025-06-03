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
import React, { useEffect } from "react";
import "@xyflow/react/dist/style.css";
import CustomNode from "../Node/CustomNode";
import useBoardStore from "../../store";
import { nodeTypes, panOnDrag } from "../../data";
import ToolMenu from "../LayoutComponents/ToolMenu";
import NodesSheet from "../LayoutComponents/NodesSheet";
import NodePalette from "../LayoutComponents/PropertiesMenu";
import TopBar from "../LayoutComponents/TopBar";

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

const FlowBoard = ({ projectId }) => {
  const {
    getCurrentProject,
    setCurrentProject,
    getNodes,
    getEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useBoardStore();

  const currentProject = getCurrentProject();

  // Set current project when component mounts or projectId changes
  useEffect(() => {
    if (projectId && projectId !== currentProject?.id) {
      setCurrentProject(projectId);
    }
  }, [projectId, currentProject?.id, setCurrentProject]);

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
      {/* Top Bar */}

      {/* Flow Board Container */}
      <div
        className="w-full h-full relative"
        style={{
          position: "relative",

          outline: "none",
          border: "none",
          top: "-10px",
          left: "-10px",
        }}
      >
        <ReactFlow
          nodes={getNodes()}
          edges={getEdges()}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
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
          minZoom={0.1}
          maxZoom={2}
          snapToGrid={true}
          snapGrid={[15, 15]}
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
            nodeStrokeColor={() => "#ffffff"}
            nodeColor={() => "#262626"}
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
            </div>
          </Panel>

          {/* Layout Components */}
          <NodesSheet />
          <Panel position="bottom-center">
            <ToolMenu />
          </Panel>
          <NodeToolbar />
          <NodeResizer />
          {/* <NodePalette /> */}
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowBoard;
