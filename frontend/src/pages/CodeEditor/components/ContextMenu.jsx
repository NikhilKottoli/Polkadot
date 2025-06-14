// components/ContextMenu.jsx
import React, { useState } from "react";
import { Trash2, Edit3, Copy, FileText, Folder } from "lucide-react";

const ContextMenu = ({ x, y, onClose, item, onDelete, onRename, onDuplicate }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item?.getItemData()?.name || "");

  const handleRename = () => {
    if (newName.trim() && newName !== item?.getItemData()?.name) {
      onRename(item.getId(), newName.trim());
    }
    setIsRenaming(false);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1 z-50 min-w-[160px]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {isRenaming ? (
        <div className="px-2 py-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleRename}
            className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      ) : (
        <>
          <button
            onClick={() => setIsRenaming(true)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <Edit3 size={14} />
            Rename
          </button>
          
          <button
            onClick={() => {
              onDuplicate(item.getId());
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <Copy size={14} />
            Duplicate
          </button>
          
          <div className="border-t border-gray-700 my-1" />
          
          <button
            onClick={() => {
              onDelete(item.getId());
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-900 text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
