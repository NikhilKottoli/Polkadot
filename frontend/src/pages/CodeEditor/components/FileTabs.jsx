// components/FileTabs.jsx
import React from "react";
import { X } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { FileIcon } from "./FileIcons";

export const FileTabs = () => {
  const { files, activeFileId, setActiveFile, closeFile } = useEditorStore();

  if (files.length === 0) return null;

  return (
    <div className="flex  mt-2">
      {files.map((file) => (
        <div
          key={file.id}
          className={`
            flex items-center gap-2 px-3 py-2 border-r border-t border-l border-gray-200/10 cursor-pointer
            rounded-t-xl
            hover:bg-gray-800/50 transition-colors min-w-0 max-w-48
            ${file.id === activeFileId ? "bg-[#1e1e1e]  " : "bg-[#0a0a0a]"}
          `}
          onClick={() => setActiveFile(file.id)}
        >
          <FileIcon
            extension={file.name.split(".").pop()}
            fileName={file.name}
            className="size-4 flex-shrink-0"
          />
          <span className="text-sm truncate">
            {file.name}
            {file.isDirty && <span className="text-orange-400 ml-1">•</span>}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeFile(file.id);
            }}
            className="ml-auto p-1 hover:bg-gray-700 rounded flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};
