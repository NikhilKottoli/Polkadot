import { Handle, Position } from "@xyflow/react";
import { useState, useEffect } from "react";
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
  Edit3,
} from "lucide-react";
import { getNodeTypeById } from "./NodeTypes";

const CustomNode = ({ data, id }) => {
  const [hoveredHandle, setHoveredHandle] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyValues, setPropertyValues] = useState({});

  // Sync local property state with actual node properties
  useEffect(() => {
    if (data.properties) {
      setPropertyValues(data.properties);
    }
  }, [data.properties]);

  // Get node type configuration
  const nodeTypeConfig = getNodeTypeById(data.nodeType) || {};

  // Check if this is a logic node (if/else, switch, etc.)
  const isLogicNode = data.nodeType?.includes('logic') || data.nodeType?.includes('dao_voting');
  const isLoopNode = data.nodeType?.includes('loop');

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
      shape: isLogicNode ? "diamond" : "rounded-lg",
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
    "🆕": Plus,
    "🧊": Flame,
    "⚡": Zap,
    "🔀": Brain,
  };

  // Get configuration
  const config = categoryConfig[data.category] || categoryConfig["logic"];
  const IconComponent = nodeIconMap[nodeTypeConfig.icon || data.nodeIcon] || config.icon;

  // Standard handles for most nodes (left input, right output)
  const getStandardHandles = () => {
    if (isLogicNode) {
      // Logic nodes: 1 input (left), 2 outputs (right top/bottom for true/false)
      return {
        inputs: [{ id: "input", label: "Input", position: "left" }],
        outputs: [
          { id: "true", label: "True", position: "right", offset: -20 },
          { id: "false", label: "False", position: "right", offset: 20 }
        ]
      };
    } else if (isLoopNode) {
      // Loop nodes: 1 input, 2 outputs (continue/break)
      return {
        inputs: [{ id: "input", label: "Input", position: "left" }],
        outputs: [
          { id: "continue", label: "Continue", position: "right", offset: -20 },
          { id: "break", label: "Break", position: "right", offset: 20 }
        ]
      };
    } else {
      // Standard nodes: 1 input (left), 1 output (right)
      return {
        inputs: [{ id: "input", label: "Input", position: "left" }],
        outputs: [{ id: "output", label: "Output", position: "right" }]
      };
    }
  };

  // Use configured handles or standard handles
  const handles = nodeTypeConfig.handles || getStandardHandles();

  // Handle property change
  const handlePropertyChange = (key, value, type) => {
    let processedValue = value;
    
    // Process value based on type
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    } else if (type === 'boolean') {
      processedValue = value === 'true';
    } else if (type === 'object') {
      try {
        processedValue = JSON.parse(value);
      } catch (e) {
        processedValue = {};
      }
    }

    const newPropertyValues = { ...propertyValues, [key]: processedValue };
    
    // Update local state immediately for responsive UI
    setPropertyValues(newPropertyValues);
    
    // Update the node data in the store
    if (data.onUpdateProperties) {
      data.onUpdateProperties(id, newPropertyValues);
    }
  };

  // Get properties with current values
  const getPropertiesWithDefaults = () => {
    const typeProperties = nodeTypeConfig.properties || {};
    const currentProperties = propertyValues || {};
    const mergedProperties = {};
    
    // First, add all properties from the node type configuration
    Object.keys(typeProperties).forEach((key) => {
      const typeProp = typeProperties[key];
      mergedProperties[key] = {
        ...typeProp,
        value: currentProperties[key] !== undefined ? currentProperties[key] : typeProp.default,
      };
    });

    // Then, add any additional properties that exist in the current node but not in the type config
    Object.keys(currentProperties).forEach((key) => {
      if (!mergedProperties[key]) {
        const value = currentProperties[key];
        mergedProperties[key] = {
          type: typeof value === 'boolean' ? 'boolean' : 
                typeof value === 'number' ? 'number' : 
                typeof value === 'object' ? 'object' : 'string',
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          value: value,
          default: value
        };
      }
    });

    return mergedProperties;
  };

  const properties = getPropertiesWithDefaults();

  // Render property value based on type - FIXED
  const renderPropertyValue = (key, property) => {
    const value = property.value !== undefined ? property.value : property.default;
    
    // Common event handlers to prevent event bubbling
    const handleInputClick = (e) => {
      e.stopPropagation();
    };
    
    const handleInputFocus = (e) => {
      e.stopPropagation();
    };
    
    if (editingProperty === key) {
      return (
        <input
          type={property.type === 'number' ? 'number' : 'text'}
          value={property.type === 'object' ? JSON.stringify(value, null, 2) : String(value)}
          onChange={(e) => handlePropertyChange(key, e.target.value, property.type)}
          onBlur={() => setEditingProperty(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setEditingProperty(null);
            if (e.key === 'Escape') setEditingProperty(null);
          }}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
          autoFocus
        />
      );
    }

    switch (property.type) {
      case "boolean":
        return (
          <select
            value={value ? "true" : "false"}
            onChange={(e) => handlePropertyChange(key, e.target.value, property.type)}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      case "select":
        return (
          <select
            value={String(value || "")}
            onChange={(e) => handlePropertyChange(key, e.target.value, property.type)}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
          >
            {property.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case "object":
        const objValue = value && typeof value === 'object' ? value : {};
        const keys = Object.keys(objValue);
        const displayText = keys.length === 0 ? "{}" : 
          keys.length <= 3 ? 
            keys.map(k => `${k}: ${String(objValue[k]).substring(0, 8)}`).join(', ') :
            `{${keys.length} properties}`;
        return (
          <div 
            className="cursor-pointer flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded hover:border-blue-500"
            onClick={(e) => {
              handleInputClick(e);
              setEditingProperty(key);
            }}
          >
            <span className="text-xs text-white flex-1">
              {displayText}
            </span>
            <Edit3 size={10} className="text-gray-400" />
          </div>
        );
      case "text":
        const textValue = String(value || "");
        return (
          <div 
            className="cursor-pointer flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded hover:border-blue-500"
            onClick={(e) => {
              handleInputClick(e);
              setEditingProperty(key);
            }}
          >
            <span className="text-xs text-white flex-1">
              {textValue.length > 25 ? textValue.substring(0, 25) + "..." : textValue || "Enter text..."}
            </span>
            <Edit3 size={10} className="text-gray-400" />
          </div>
        );
      case "number":
        return (
          <input
            type="number"
            value={String(value || "")}
            onChange={(e) => handlePropertyChange(key, e.target.value, property.type)}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
          />
        );
      default:
        return (
          <div 
            className="cursor-pointer flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded hover:border-blue-500"
            onClick={(e) => {
              handleInputClick(e);
              setEditingProperty(key);
            }}
          >
            <span className="text-xs text-white flex-1">
              {String(value || "").substring(0, 25)}{String(value || "").length > 25 ? "..." : ""}
            </span>
            <Edit3 size={10} className="text-gray-400" />
          </div>
        );
    }
  };

  // Render handle component
  const renderHandle = (handle, type, index = 0, total = 1) => {
    const isInput = type === "target";
    const position = handle.position === "left" ? Position.Left : 
                   handle.position === "right" ? Position.Right :
                   handle.position === "top" ? Position.Top : Position.Bottom;
    
    // Calculate position based on handle offset or distribute evenly
    let styleTop = "50%";
    if (handle.offset) {
      styleTop = `calc(50% + ${handle.offset}px)`;
    } else if (total > 1) {
      const spacing = 40;
      styleTop = `calc(50% + ${(index - (total - 1) / 2) * spacing}px)`;
    }

    const handleStyle = {
      backgroundColor: isInput ? "#3b82f6" : "#10b981",
      borderColor: isInput ? "#1d4ed8" : "#059669",
      borderWidth: "2px",
      borderRadius: "50%",
      width: "12px",
      height: "12px",
      cursor: "crosshair",
      ...(position === Position.Left && { left: "-6px", top: styleTop, transform: "translateY(-50%)" }),
      ...(position === Position.Right && { right: "-6px", top: styleTop, transform: "translateY(-50%)" }),
      ...(position === Position.Top && { top: "-6px", left: "50%", transform: "translateX(-50%)" }),
      ...(position === Position.Bottom && { bottom: "-6px", left: "50%", transform: "translateX(-50%)" }),
    };

    return (
      <Handle
        key={`${type}-${handle.id}`}
        type={type}
        position={position}
        id={handle.id}
        style={handleStyle}
        onMouseEnter={() => setHoveredHandle(`${type}-${handle.id}`)}
        onMouseLeave={() => setHoveredHandle(null)}
      />
    );
  };

  return (
    <div className="relative group">
      {/* Render input handles */}
      {handles.inputs?.map((handle, index) => 
        renderHandle(handle, "target", index, handles.inputs.length)
      )}

      {/* Render output handles */}
      {handles.outputs?.map((handle, index) => 
        renderHandle(handle, "source", index, handles.outputs.length)
      )}

      {/* Main Node Container */}
      <div
        className={`
          relative min-w-72 max-w-80 ${config.pattern}
          border ${config.borderColor} ${config.accent}
          ${config.shape} hover:shadow-xl transform transition-all duration-300 ease-out
          backdrop-blur-sm overflow-hidden
        `}
      >
        <div className="absolute -top-0 -right-0 flex justify-end items-start">
          <div className={`text-xs font-bold text-white uppercase mb-1 p-2 py-1 ${config.iconBg} rounded-bl-lg inline`}>
            {data.category || "Node"}
          </div>
          <div className={`${config.iconBg} ${config.shape} p-3 flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-tl-[0] rounded-br-[0]`}>
            <IconComponent size={24} className={config.iconColor} />
          </div>
        </div>

        {/* Header Section */}
        <div className="flex items-start gap-4 p-5 pb-3" style={{ backgroundColor: "#262626" }}>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg leading-tight mb-1">
              {nodeTypeConfig.label || data.label || "Custom Node"}
            </div>
            {(nodeTypeConfig.description || data.description) && (
              <div className="text-sm opacity-90 leading-relaxed max-w-[200px]" style={{ color: "#cccccc" }}>
                {nodeTypeConfig.description || data.description}
              </div>
            )}

            {/* Subcategory Badge */}
            {nodeTypeConfig.subcategory && (
              <div className="mt-2">
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#999999",
                }}>
                  {nodeTypeConfig.subcategory.replace("_", " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border mb-4" style={{ borderColor: "#404040" }}></div>

        {/* Properties Section - FIXED TO BE EDITABLE */}
        <div className="p-5">
          {Object.keys(properties).length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#999999" }}>
                Configuration
              </div>
              <div className="border rounded-lg p-3 space-y-3" style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderColor: "#404040",
              }}>
                {Object.entries(properties).map(([key, property]) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-xs font-medium" style={{ color: "#999999" }}>
                      {property.label || key}:
                    </label>
                    <div className="w-full">
                      {renderPropertyValue(key, property)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Node Type Info */}
          {nodeTypeConfig.id && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: "#404040" }}>
              <div className="text-xs" style={{ color: "#666666" }}>
                Node Type: <span className="font-mono">{nodeTypeConfig.id}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Handle Labels */}
      {hoveredHandle && (
        <div className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50"
             style={{
               top: "50%",
               left: hoveredHandle.includes('input') ? "-60px" : "calc(100% + 10px)",
               transform: "translateY(-50%)"
             }}>
          {hoveredHandle.replace('input-', '').replace('output-', '').replace('target-', '').replace('source-', '')}
        </div>
      )}
    </div>
  );
};

export default CustomNode;
