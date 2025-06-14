// components/CodeEditor.tsx (Updated)
import React from "react";
import FileTree from "./components/FileTree";
import { MonacoEditor } from "./components/MonacoEditor";
import { FileTabs } from "./components/FileTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Eye, FileText } from "lucide-react";

export default function CodeEditor() {
  return (
    <div className=" h-screen overflow-y-hidden w-full  text-white bg-[#0a0a0a] flex flex-col">
      <div className="flex flex-1">
        <div className="min-w-[300px] max-w-[300px] flex-1 mt-8 px-4 pr-6 relative flex flex-col">
          <div className="mb-8 flex gap-4">
            <img src="logo.svg" />
            <p className="font-bold">Polkaflow</p>
            <Badge variant="outline">Editor</Badge>
          </div>
          <FileTree />

          <div className="flex flex-col gap-2 z-10 bg-none justify-self-end  pb-4">
            <Button
              size="sm"
              variant="secondary"
              className="bg-[#1e1e1e] hover:bg-gray-700 text-white border-gray-600 backdrop-blur-sm"
              onClick={() => {
                /* Handle export code */
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Code
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="bg-[#1e1e1e] hover:bg-gray-700 text-white border-gray-600 backdrop-blur-sm"
              onClick={() => {
                /* Handle open in Remix IDE */
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Remix
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="bg-[#1e1e1e] hover:bg-gray-700 text-white border-gray-600 backdrop-blur-sm"
              onClick={() => {
                /* Handle view in flow form */
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View in Flow
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col w-full pt-3 pr-4">
          <div className="px-6 ">
            <FileTabs />
          </div>
          <div className=" w-full flex-1 bg-[#0f0f0f] rounded-t-3xl overflow-hidden  border-gray-200/10  border-1">
            <MonacoEditor className=" h-full " />
          </div>
        </div>
      </div>
      <div className="bg-pink-500/50 text-white h-6 w-full flex items-center justify-between px-2 text-xs font-medium border-t ">
        <div className="flex items-center space-x-4">
          <span className="bg-black/50 px-2 py-0.5 rounded">main</span>
          <span>✓</span>
          <span>0 ⚠ 0</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>JavaScript</span>
        </div>
      </div>
    </div>
  );
}
