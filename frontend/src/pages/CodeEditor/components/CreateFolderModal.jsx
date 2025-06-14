// components/CreateFileModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

const CreateFileModal = ({ isOpen, onClose, parentPath, onCreate }) => {
  const [fileName, setFileName] = useState("");
  const [fileExtension, setFileExtension] = useState("jsx");

  const handleCreate = () => {
    if (fileName.trim()) {
      const fullFileName = `${fileName.trim()}.${fileExtension}`;
      onCreate(parentPath, fullFileName, fileExtension);
      setFileName("");
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreate();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Create New File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter file name"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File Extension
            </label>
            <select
              value={fileExtension}
              onChange={(e) => setFileExtension(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="jsx">JSX</option>
              <option value="js">JavaScript</option>
              <option value="ts">TypeScript</option>
              <option value="tsx">TSX</option>
              <option value="sol">Solidity</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="md">Markdown</option>
              <option value="txt">Text</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFileModal;
