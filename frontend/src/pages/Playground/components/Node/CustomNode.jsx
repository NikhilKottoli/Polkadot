import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  Coins,
  Flame,
  Key,
  Link2,
  Settings,
  Wallet,
  Zap,
  Plus,
  AlertCircle,
} from "lucide-react";
import { getNodeTypeById } from "./NodeTypes";

const CustomNode = ({ data, id }) => {
  const [hoveredHandle, setHoveredHandle] = useState(null);

  // Get node type configuration
  const nodeTypeConfig = getNodeTypeById(data.nodeType) || {};

  // Category configurations with enhanced styling
  const categoryConfig = {
    trigger: {
      icon: Zap,
      accent: "hover:border-purple-500/50",
      iconBg: "bg-purple-500/30",
      iconColor: "text-white",
      pattern: "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]",
      shape: "rounded-xl",
      borderColor: "border-purple-500/20",
    },
    action: {
      icon: Settings,
      accent: "hover:border-blue-500/50",
      iconBg: "bg-blue-500/30",
      iconColor: "text-white",
      pattern: "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]",
      shape: "rounded-xl",
      borderColor: "border-blue-500/20",
    },
    logic: {
      icon: Brain,
      accent: "hover:border-green-500/50",
      iconBg: "bg-green-500/30",
      iconColor: "text-white",
      pattern: "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]",
      shape: "rounded-lg",
      borderColor: "border-green-500/20",
    },
    bridge: {
      icon: Link2,
      accent: "hover:border-orange-500/50",
      iconBg: "bg-orange-500/30",
      iconColor: "text-white",
      pattern: "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]",
      shape: "rounded-xl",
      borderColor: "border-orange-500/20",
    },
    wallet: {
      icon: Wallet,
      accent: "hover:border-indigo-500/50",
      iconBg: "bg-indigo-500/30",
      iconColor: "text-white",
      pattern: "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]",
      shape: "rounded-xl",
      borderColor: "border-indigo-500/20",
    },
    ai: {
      icon: Bot,
      accent: "hover:border-pink-500/50",
      iconBg: "bg-pink-500/30",
      iconColor: "text-white",
      pattern: "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]",
      shape: "rounded-xl",
      borderColor: "border-pink-500/20",
    },
  };

  const nodeIconMap = {
    "🪙": Coins,
    "💥": Flame,
    "🧠": Brain,
    "🔗": Link2,
    "🔐": Key,
    "🧾": AlertCircle,
    "💰": Wallet,
    "🗳️": Settings,
    "✅": Settings,
    "🔄": ArrowRight,
    "🛠️": Settings,
    "📊": Settings,
    "🧍": Settings,
    "🎲": Settings,
    "🕒": Settings,
    "🌐": Link2,
    "📧": Settings,
    "📩": Settings,
    "🛎️": Settings,
    "🌦️": Settings,
    "📈": Settings,
    "🧪": Flame,
    "🏦": Settings,
    "📤": ArrowRight,
    "📥": ArrowLeft,
    "🧮": Brain,
    "🧩": Settings,
    "⏳": Settings,
    "🔁": Settings,
    "🌉": Link2,
    "📡": Settings,
    "🖇️": Link2,
    "📳": Wallet,
    "📲": Wallet,
  };

  // Get configuration
  const config = categoryConfig[data.category] || categoryConfig["logic"];
  const IconComponent =
    nodeIconMap[nodeTypeConfig.icon || data.nodeIcon] || config.icon;

  // Get handles from node type configuration
  const handles = nodeTypeConfig.handles || { inputs: [], outputs: [] };

  // Calculate handle position - FIXED FORMULA
  const getHandlePosition = (index, totalHandles) => {
    if (totalHandles === 1) {
      return "50%";
    }
    // Distribute handles evenly around center
    const spacing = 40; // Adjust spacing as needed
    return `${50 + (index - (totalHandles - 1) / 2) * spacing}%`;
  };

  // Get properties with defaults
  const getPropertiesWithDefaults = () => {
    const typeProperties = nodeTypeConfig.properties || {};
    const currentProperties = data.properties || {};

    const mergedProperties = {};
    Object.keys(typeProperties).forEach((key) => {
      const typeProp = typeProperties[key];
      mergedProperties[key] = {
        ...typeProp,
        value:
          currentProperties[key] !== undefined
            ? currentProperties[key]
            : typeProp.default,
      };
    });

    return mergedProperties;
  };

  const properties = getPropertiesWithDefaults();

  // Handle add button click
  const handleAddConnection = (handleId, handleType) => {
    if (data.onAddConnection) {
      data.onAddConnection(id, handleId, handleType);
    }
  };

  // Render property value based on type
  const renderPropertyValue = (property) => {
    switch (property.type) {
      case "boolean":
        return property.value ? "true" : "false";
      case "select":
        return property.value || property.default;
      case "object":
        return JSON.stringify(property.value || property.default);
      case "text":
        return (
          String(property.value || property.default).substring(0, 30) +
          (String(property.value || property.default).length > 30 ? "..." : "")
        );
      default:
        return String(property.value || property.default);
    }
  };

  return (
    <div className="relative group">
      {/* Input Handles - FIXED POSITIONING */}
      {handles.inputs &&
        handles.inputs.map((handle, index) => {
          const handleTop = getHandlePosition(index, handles.inputs.length);

          return (
            <div key={`input-${handle.id}`} className="relative">
              <Handle
                type="target"
                position={Position.Left}
                id={handle.id}
                className="w-6 h-6 border-3 transition-all duration-300 z-10 hover:scale-110"
                style={{
                  backgroundColor: "#3b82f6",
                  borderColor: "#1d4ed8",
                  borderWidth: "3px",
                  boxShadow:
                    "0 4px 12px rgba(59, 130, 246, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  top: handleTop,
                  transform: "translateY(-50%)",
                  cursor: "crosshair",
                  opacity: "1",
                }}
                onMouseEnter={() => setHoveredHandle(`input-${handle.id}`)}
                onMouseLeave={() => setHoveredHandle(null)}
              />

              {/* Always visible handle indicator */}
              <div
                className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"
                style={{
                  left: "8px",
                  top: handleTop,
                  transform: "translateY(-50%)",
                  boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)",
                }}
              />

              {/* Enhanced Handle Label */}
              <div
                className={`absolute -left-24 text-xs px-3 py-2 rounded-lg transition-all duration-300 pointer-events-none ${
                  hoveredHandle === `input-${handle.id}`
                    ? "opacity-100 scale-100"
                    : "opacity-70 scale-95"
                }`}
                style={{
                  color: "#e5e7eb",
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  top: handleTop,
                  transform: "translateY(-50%)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                <ArrowRight size={12} className="inline mr-2 text-blue-400" />
                {handle.label}
              </div>

              {/* Enhanced Add Connection Button */}
              <button
                className={`absolute -left-10 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full flex items-center justify-center transition-all duration-300 z-20 shadow-lg hover:shadow-xl hover:scale-110 ${
                  hoveredHandle === `input-${handle.id}`
                    ? "opacity-100"
                    : "opacity-0"
                }`}
                style={{
                  top: handleTop,
                  transform: "translateY(-50%)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                }}
                onClick={() => handleAddConnection(handle.id, "input")}
              >
                <Plus size={14} className="text-white drop-shadow-sm" />
              </button>
            </div>
          );
        })}

      {/* Main Node Container */}
      <div
        className={`
        relative min-w-72 max-w-80 ${config.pattern}
        border ${config.borderColor} ${config.accent} rounded-[20px] 
        hover:shadow-xl
        transform  transition-all duration-300 ease-out
        backdrop-blur-sm  
        overflow-hidden
      `}
      >
        <div className="absolute -top-0 -right-0 flex justify-end items-start">
          <div
            className={`text-xs font-bold text-white uppercase mb-1 p-2 py-1 ${config.iconBg} rounded-bl-lg inline`}
          >
            {data.category || "Node"}
          </div>
          <div
            className={`${config.iconBg} ${config.shape} p-3 flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-tl-[0] rounded-br-[0]`}
          >
            <IconComponent size={24} className={config.iconColor} />
          </div>
        </div>

        {/* Header Section */}
        <div
          className="flex items-start gap-4 p-5 pb-3"
          style={{ backgroundColor: "#262626" }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg leading-tight mb-1">
              {nodeTypeConfig.label || data.label || "Custom Node"}
            </div>
            {(nodeTypeConfig.description || data.description) && (
              <div
                className="text-sm opacity-90 leading-relaxed  max-w-[200px]"
                style={{ color: "#cccccc" }}
              >
                {nodeTypeConfig.description || data.description}
              </div>
            )}

            {/* Subcategory Badge */}
            {nodeTypeConfig.subcategory && (
              <div className="mt-2">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#999999",
                  }}
                >
                  {nodeTypeConfig.subcategory.replace("_", " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border mb-4" style={{ borderColor: "#404040" }}></div>

        {/* Properties Section */}
        <div className="p-5">
          {Object.keys(properties).length > 0 && (
            <div className="space-y-3">
              <div
                className="text-xs font-bold uppercase tracking-wider "
                style={{ color: "#999999" }}
              >
                Configuration
              </div>
              <div
                className="border rounded-lg p-3 space-y-2"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderColor: "#404040",
                }}
              >
                {Object.entries(properties).map(([key, property]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center text-sm"
                  >
                    <span
                      className="capitalize font-medium"
                      style={{ color: "#999999" }}
                    >
                      {property.label || key}:
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-1 rounded ${
                        property.readonly ? "bg-gray-800" : ""
                      }`}
                      style={{
                        color: property.readonly ? "#666666" : "#cccccc",
                        backgroundColor: property.readonly
                          ? "#111111"
                          : "#171717",
                      }}
                    >
                      {renderPropertyValue(property)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Node Type Info */}
          {nodeTypeConfig.id && (
            <div
              className="mt-4 pt-3 border-t"
              style={{ borderColor: "#404040" }}
            >
              <div className="text-xs" style={{ color: "#666666" }}>
                Node Type:{" "}
                <span className="font-mono">{nodeTypeConfig.id}</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* Output Handles - FIXED POSITIONING */}
      {handles.outputs &&
        handles.outputs.map((handle, index) => {
          const handleTop = getHandlePosition(index, handles.outputs.length);

          return (
            <div key={`output-${handle.id}`} className="relative">
              <Handle
                type="source"
                position={Position.Right}
                id={handle.id}
                className="w-6 h-6 border-3 transition-all duration-300 z-10 hover:scale-110"
                style={{
                  backgroundColor: "#10b981",
                  borderColor: "#059669",
                  borderWidth: "3px",
                  width: "16px",
                  height: "16px",
                  boxShadow:
                    "0 4px 12px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  top: handleTop,
                  transform: "translateY(-50%)",
                  cursor: "crosshair",
                  opacity: "1",
                }}
                onMouseEnter={() => setHoveredHandle(`output-${handle.id}`)}
                onMouseLeave={() => setHoveredHandle(null)}
              />

              {/* Always visible handle indicator */}
              <div
                className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"
                style={{
                  right: "8px",
                  top: handleTop,
                  transform: "translateY(-50%)",
                  boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)",
                }}
              />

              {/* Enhanced Handle Label */}
              <div
                className={`absolute -right-24 text-xs px-3 py-2 rounded-lg transition-all duration-300 pointer-events-none ${
                  hoveredHandle === `output-${handle.id}`
                    ? "opacity-100 scale-100"
                    : "opacity-70 scale-95"
                }`}
                style={{
                  color: "#e5e7eb",
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  top: handleTop,
                  transform: "translateY(-50%)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                {handle.label}
                <ArrowLeft size={12} className="inline ml-2 text-emerald-400" />
              </div>

              {/* Enhanced Add Connection Button */}
              <button
                className={`absolute -right-10 w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-full flex items-center justify-center transition-all duration-300 z-20 shadow-lg hover:shadow-xl hover:scale-110 ${
                  hoveredHandle === `output-${handle.id}`
                    ? "opacity-100"
                    : "opacity-0"
                }`}
                style={{
                  top: handleTop,
                  transform: "translateY(-50%)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                }}
                onClick={() => handleAddConnection(handle.id, "output")}
              >
                <Plus size={14} className="text-white drop-shadow-sm" />
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default CustomNode;
