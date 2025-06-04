import React from "react";
import { useNodeOperations } from "../../NodeOperations";
import useBoardStore from "../../../../store/store";
import {
  Copy,
  Trash2,
  RotateCcw,
  Zap,
  ArrowRight,
  ArrowLeft,
  Settings,
  Info,
} from "lucide-react";

const NodePalette = () => {
  const {
    selectedNode,
    duplicateSelectedNode,
    deleteSelectedNode,
    resetNodeToDefaults,
    updateNodeProperties,
    updateNodeLabel,
    updateNodeStatus,
    clearSelection,
  } = useNodeOperations();

  const { getNodes, getEdges } = useBoardStore();

  // Don't render if no node is selected
  if (!selectedNode) {
    return null;
  }

  const nodes = getNodes();
  const edges = getEdges();
  const currentNode = nodes.find((node) => node.id === selectedNode);

  if (!currentNode) {
    return null;
  }

  // Get connected nodes
  const connectedEdges = edges.filter(
    (edge) => edge.source === selectedNode || edge.target === selectedNode
  );

  const inputConnections = connectedEdges
    .filter((edge) => edge.target === selectedNode)
    .map((edge) => nodes.find((node) => node.id === edge.source))
    .filter(Boolean);

  const outputConnections = connectedEdges
    .filter((edge) => edge.source === selectedNode)
    .map((edge) => nodes.find((node) => node.id === edge.target))
    .filter(Boolean);

  const handlePropertyChange = (key, value) => {
    const updatedProperties = {
      ...currentNode.data.properties,
      [key]: value,
    };
    updateNodeProperties(selectedNode, updatedProperties);
  };

  const handleLabelChange = (newLabel) => {
    updateNodeLabel(selectedNode, newLabel);
  };

  const handleStatusChange = (newStatus) => {
    updateNodeStatus(selectedNode, newStatus);
  };

  const renderPropertyField = (key, value) => {
    const fieldType = typeof value;

    switch (fieldType) {
      case "boolean":
        return (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">{key}</label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handlePropertyChange(key, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
        );

      case "number":
        return (
          <div>
            <label className="block text-sm text-gray-300 mb-1">{key}</label>
            <input
              type="number"
              value={value}
              onChange={(e) =>
                handlePropertyChange(key, parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm text-gray-300 mb-1">{key}</label>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
    }
  };

  return (
    <div className="w-[400px] h-[98%] p-4 absolute right-[-20px] top-[-18px] z-[200] bottom-[10px]">
      <div className="w-full h-full  border border-white/10 bg-[#171717]/90 backdrop-blur-md shadow-lg  flex flex-col overflow-y-scroll">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentNode.data.nodeIcon}</span>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Node Properties
                </h3>
                <p className="text-gray-400 text-sm">
                  {currentNode.data.category}
                </p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Info size={16} />
              Basic Information
            </h4>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Label</label>
              <input
                type="text"
                value={currentNode.data.label || ""}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={currentNode.data.description || ""}
                onChange={(e) =>
                  handlePropertyChange("description", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Status</label>
              <select
                value={currentNode.data.status || "pending"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="error">Error</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          {/* Properties */}
          {Object.keys(currentNode.data.properties || {}).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Settings size={16} />
                Properties
              </h4>
              <div className="space-y-3">
                {Object.entries(currentNode.data.properties || {}).map(
                  ([key, value]) => (
                    <div key={key}>{renderPropertyField(key, value)}</div>
                  )
                )}
              </div>

              {/* Add new property */}
              <button
                onClick={() => {
                  const newKey = prompt("Enter property name:");
                  if (newKey && !currentNode.data.properties[newKey]) {
                    handlePropertyChange(newKey, "");
                  }
                }}
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-md text-white text-sm transition-colors"
              >
                + Add Property
              </button>
            </div>
          )}

          {/* Connections */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Zap size={16} />
              Connections ({connectedEdges.length})
            </h4>

            {inputConnections.length > 0 && (
              <div>
                <h5 className="text-gray-300 text-sm mb-2 flex items-center gap-1">
                  <ArrowLeft size={14} />
                  Inputs ({inputConnections.length})
                </h5>
                <div className="space-y-1">
                  {inputConnections.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md"
                    >
                      <span className="text-lg">{node.data.nodeIcon}</span>
                      <span className="text-white text-sm">
                        {node.data.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {outputConnections.length > 0 && (
              <div>
                <h5 className="text-gray-300 text-sm mb-2 flex items-center gap-1">
                  <ArrowRight size={14} />
                  Outputs ({outputConnections.length})
                </h5>
                <div className="space-y-1">
                  {outputConnections.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md"
                    >
                      <span className="text-lg">{node.data.nodeIcon}</span>
                      <span className="text-white text-sm">
                        {node.data.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {connectedEdges.length === 0 && (
              <p className="text-gray-500 text-sm">No connections</p>
            )}
          </div>

          {/* Node Details */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white font-mono text-xs">
                  {currentNode.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{currentNode.data.nodeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="text-white">
                  ({Math.round(currentNode.position.x)},{" "}
                  {Math.round(currentNode.position.y)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => duplicateSelectedNode(selectedNode)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              <Copy size={14} />
              Duplicate
            </button>
            <button
              onClick={() => resetNodeToDefaults(selectedNode)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this node?")) {
                deleteSelectedNode(selectedNode);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
          >
            <Trash2 size={14} />
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
