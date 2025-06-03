// components/LayoutComponents/NodeContextMenu.jsx
import React, { useEffect, useRef } from "react";
import { Copy, Trash2, RotateCcw } from "lucide-react";

export const NodeContextMenu = ({ x, y, nodeId, onAction, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleAction = (action) => {
    onAction(action, nodeId);
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#171717] border border-[#404040] rounded-lg shadow-lg py-2 min-w-[160px]"
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        className="w-full px-4 py-2 text-left text-white hover:bg-[#262626] flex items-center gap-2 text-sm"
        onClick={() => handleAction("duplicate")}
      >
        <Copy size={16} />
        Duplicate Node
      </button>

      <button
        className="w-full px-4 py-2 text-left text-white hover:bg-[#262626] flex items-center gap-2 text-sm"
        onClick={() => handleAction("reset")}
      >
        <RotateCcw size={16} />
        Reset to Defaults
      </button>

      <div className="border-t border-[#404040] my-1"></div>

      <button
        className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#262626] hover:text-red-300 flex items-center gap-2 text-sm"
        onClick={() => handleAction("delete")}
      >
        <Trash2 size={16} />
        Delete Node
      </button>
    </div>
  );
};
