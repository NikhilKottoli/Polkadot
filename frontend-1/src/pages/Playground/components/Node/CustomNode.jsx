// filepath: /home/sahil/Desktop/Polkadot/frontend/src/pages/Playground/components/Node/CustomNode.jsx
import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { useBoardStore } from "../../store/boardStore";

const CustomNode = ({ data, id }) => {
  const [hoveredHandle, setHoveredHandle] = useState(null);
  const { updateNodeProperties, addConnection } = useBoardStore();

  const handleAddConnection = (handleId, handleType) => {
    addConnection(id, handleId, handleType);
  };

  const renderPropertyValue = (property) => {
    switch (property.type) {
      case "string":
        return property.value;
      case "number":
        return property.value.toString();
      case "boolean":
        return property.value ? "True" : "False";
      default:
        return "";
    }
  };

  return (
    <div className="relative group">
      {data.handles.inputs.map((handle, index) => (
        <div key={`input-${handle.id}`} className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id={handle.id}
            className="w-4 h-4 border-2 transition-all duration-200 z-10"
            onMouseEnter={() => setHoveredHandle(`input-${handle.id}`)}
            onMouseLeave={() => setHoveredHandle(null)}
          />
          {hoveredHandle === `input-${handle.id}` && (
            <button
              className="absolute -left-8 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-all duration-200 z-20"
              onClick={() => handleAddConnection(handle.id, "input")}
            >
              <Plus size={12} className="text-white" />
            </button>
          )}
        </div>
      ))}

      <div className="border mb-4" style={{ borderColor: "#404040" }}></div>

      <div className="p-5">
        {Object.entries(data.properties).map(([key, property]) => (
          <div key={key} className="flex justify-between items-center text-sm">
            <span className="capitalize font-medium" style={{ color: "#999999" }}>
              {property.label || key}:
            </span>
            <span className="font-mono text-xs px-2 py-1 rounded" style={{ color: "#cccccc" }}>
              {renderPropertyValue(property)}
            </span>
          </div>
        ))}
      </div>

      {data.handles.outputs.map((handle, index) => (
        <div key={`output-${handle.id}`} className="relative">
          <Handle
            type="source"
            position={Position.Right}
            id={handle.id}
            className="w-4 h-4 border-2 transition-all duration-200 z-10"
            onMouseEnter={() => setHoveredHandle(`output-${handle.id}`)}
            onMouseLeave={() => setHoveredHandle(null)}
          />
          {hoveredHandle === `output-${handle.id}` && (
            <button
              className="absolute -right-8 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-all duration-200 z-20"
              onClick={() => handleAddConnection(handle.id, "output")}
            >
              <Plus size={12} className="text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomNode;