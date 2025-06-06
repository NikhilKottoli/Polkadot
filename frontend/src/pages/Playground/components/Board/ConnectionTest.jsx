import React, { useEffect, useState } from "react";
import useBoardStore from "../../../../store/store";
import {
  Minimize2,
  Maximize2,
  Eye,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const ConnectionTest = () => {
  const { getNodes, getEdges, onConnect, exportFlowchart, getCurrentProject } =
    useBoardStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const nodes = getNodes();
  const edges = getEdges();
  const currentProject = getCurrentProject();

  useEffect(() => {
    console.log("=== CONNECTION TEST DEBUG ===");
    console.log("Current Project:", currentProject?.id);
    console.log("Nodes:", nodes);
    console.log("Edges:", edges);
    console.log("onConnect function:", typeof onConnect);

    // Test export function
    if (exportFlowchart) {
      const flowData = exportFlowchart();
      console.log("Exported Flow Data:", flowData);
    }
  }, [nodes, edges, currentProject, onConnect, exportFlowchart]);

  const testConnection = () => {
    if (nodes.length >= 2) {
      const testParams = {
        source: nodes[0].id,
        target: nodes[1].id,
        sourceHandle: null,
        targetHandle: null,
      };

      console.log("Testing connection with params:", testParams);
      onConnect(testParams);
    } else {
      console.log("Need at least 2 nodes to test connection");
    }
  };

  const logCompleteFlowchartState = () => {
    console.log("=== COMPLETE FLOWCHART STATE ===");

    const flowData = exportFlowchart();

    // Create comprehensive JSON output
    const completeState = {
      project: {
        id: currentProject?.id,
        name: currentProject?.name,
        status: currentProject?.status,
        lastUpdated: currentProject?.updatedAt,
      },
      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        hasLoops: flowData?.hasLoops || false,
        executionOrder: flowData?.executionOrder || [],
      },
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        nodeType: node.data?.nodeType,
        label: node.data?.label,
        category: node.data?.category,
        position: node.position,
        sequence: node.sequence,
        properties: node.data?.properties || {},
        handles: {
          inputs: node.data?.handles?.inputs || [],
          outputs: node.data?.handles?.outputs || [],
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: edge.animated,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        data: edge.data || {},
      })),
      flowchartExport: flowData,
      logicNodes: nodes
        .filter(
          (node) =>
            node.data?.nodeType?.includes("logic") ||
            node.data?.nodeType?.includes("dao_voting")
        )
        .map((node) => {
          const outgoingEdges = edges.filter((edge) => edge.source === node.id);
          return {
            id: node.id,
            nodeType: node.data?.nodeType,
            label: node.data?.label,
            properties: node.data?.properties || {},
            outgoingEdges: outgoingEdges.map((edge) => ({
              target: edge.target,
              label: edge.label,
              targetNodeLabel: nodes.find((n) => n.id === edge.target)?.data
                ?.label,
            })),
          };
        }),
    };

    // Log as pretty-printed JSON
    console.log("📊 COMPLETE FLOWCHART JSON:");
    console.log(JSON.stringify(completeState, null, 2));

    // Also log individual sections for easier debugging
    console.log("🔗 Nodes Summary:", completeState.nodes);
    console.log("🔄 Edges Summary:", completeState.edges);
    console.log("🧠 Logic Nodes:", completeState.logicNodes);
    console.log("⚡ Exported Flow Data:", flowData);

    return completeState;
  };

  const formatPropertyValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Show Connection Debug"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50 border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-sm">Connection Debug</h4>
        <div className="flex gap-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-white"
            title="Toggle Details"
          >
            {showDetails ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white"
            title="Minimize"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs">
          <div>
            Project:{" "}
            <span className="text-blue-400">
              {currentProject?.id || "None"}
            </span>
          </div>
          <div>
            Nodes: <span className="text-green-400">{nodes.length}</span>
          </div>
          <div>
            Edges: <span className="text-yellow-400">{edges.length}</span>
          </div>
          <div>
            onConnect:{" "}
            <span className="text-purple-400">{typeof onConnect}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={testConnection}
            disabled={nodes.length < 2}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Connection
          </button>

          <button
            onClick={logCompleteFlowchartState}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs flex items-center gap-1"
            title="Log complete flowchart state to console"
          >
            <Eye size={12} />
            Log State
          </button>
        </div>

        {showDetails && (
          <>
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs font-semibold mb-1">Recent Edges:</div>
              {edges.slice(-3).map((edge) => (
                <div key={edge.id} className="text-green-400 text-xs mb-1">
                  <div>
                    {edge.source} → {edge.target}
                  </div>
                  <div className="text-gray-400 ml-2">
                    Label: {edge.label || "none"}
                  </div>
                  {edge.data && (
                    <div className="text-gray-400 ml-2">
                      Data: {edge.data.sourceType} → {edge.data.targetType}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs font-semibold mb-1">Logic Nodes:</div>
              {nodes
                .filter(
                  (node) =>
                    node.data?.nodeType?.includes("logic") ||
                    node.data?.nodeType?.includes("dao")
                )
                .map((node) => (
                  <div key={node.id} className="text-purple-400 text-xs mb-1">
                    <div>{node.data?.label}</div>
                    <div className="text-gray-400 ml-2">
                      Type: {node.data?.nodeType}
                    </div>
                    {node.data?.properties &&
                      Object.keys(node.data.properties).length > 0 && (
                        <div className="text-gray-400 ml-2">
                          Props:{" "}
                          {Object.entries(node.data.properties)
                            .map(
                              ([key, value]) =>
                                `${key}=${
                                  typeof value === "object" ? "[obj]" : value
                                }`
                            )
                            .join(", ")}
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionTest;
