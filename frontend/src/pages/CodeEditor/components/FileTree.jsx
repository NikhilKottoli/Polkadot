// components/FileTree.jsx (Updated with folder icons and lines)
"use client";

import React, { useState } from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { FolderIcon, FolderOpenIcon } from "lucide-react";
import { Tree, TreeItem, TreeItemLabel } from "./tree";
import { FileIcon } from "./FileIcons";
import { useEditorStore } from "@/store/editorStore";

// Updated initialItems with Web3 files
const initialItems = {
  app: {
    name: "app",
    children: ["app/layout.jsx", "app/page.jsx", "app/(dashboard)", "app/api"],
  },
  "app/layout.jsx": { name: "layout.jsx", fileExtension: "jsx" },
  "app/page.jsx": { name: "page.jsx", fileExtension: "jsx" },
  "app/(dashboard)": {
    name: "(dashboard)",
    children: ["app/(dashboard)/dashboard"],
  },
  "app/(dashboard)/dashboard": {
    name: "dashboard",
    children: ["app/(dashboard)/dashboard/page.jsx"],
  },
  "app/(dashboard)/dashboard/page.jsx": {
    name: "page.jsx",
    fileExtension: "jsx",
  },
  "app/api": { name: "api", children: ["app/api/hello"] },
  "app/api/hello": { name: "hello", children: ["app/api/hello/route.js"] },
  "app/api/hello/route.js": { name: "route.js", fileExtension: "js" },
  components: {
    name: "components",
    children: ["components/button.jsx", "components/card.jsx"],
  },
  "components/button.jsx": { name: "button.jsx", fileExtension: "jsx" },
  "components/card.jsx": { name: "card.jsx", fileExtension: "jsx" },
  contracts: {
    name: "contracts",
    children: [
      "contracts/Token.sol",
      "contracts/NFT.sol",
      "contracts/Staking.sol",
    ],
  },
  "contracts/Token.sol": { name: "Token.sol", fileExtension: "sol" },
  "contracts/NFT.sol": { name: "NFT.sol", fileExtension: "sol" },
  "contracts/Staking.sol": { name: "Staking.sol", fileExtension: "sol" },
  scripts: {
    name: "scripts",
    children: ["scripts/deploy.js", "scripts/verify.js"],
  },
  "scripts/deploy.js": { name: "deploy.js", fileExtension: "js" },
  "scripts/verify.js": { name: "verify.js", fileExtension: "js" },
  test: {
    name: "test",
    children: ["test/Token.test.js", "test/NFT.test.js"],
  },
  "test/Token.test.js": { name: "Token.test.js", fileExtension: "js" },
  "test/NFT.test.js": { name: "NFT.test.js", fileExtension: "js" },
  lib: { name: "lib", children: ["lib/utils.js"] },
  "lib/utils.js": { name: "utils.js", fileExtension: "js" },
  public: {
    name: "public",
    children: ["public/favicon.ico", "public/vercel.svg"],
  },
  "public/favicon.ico": { name: "favicon.ico", fileExtension: "ico" },
  "public/vercel.svg": { name: "vercel.svg", fileExtension: "svg" },
  "package.json": { name: "package.json", fileExtension: "json" },
  "hardhat.config.js": { name: "hardhat.config.js", fileExtension: "js" },
  "foundry.toml": { name: "foundry.toml", fileExtension: "toml" },
  "next.config.mjs": { name: "next.config.mjs", fileExtension: "mjs" },
  "README.md": { name: "README.md", fileExtension: "md" },
  root: {
    name: "Project Root",
    children: [
      "app",
      "components",
      "contracts",
      "scripts",
      "test",
      "lib",
      "public",
      "package.json",
      "hardhat.config.js",
      "foundry.toml",
      "next.config.mjs",
      "README.md",
    ],
  },
};

function getDefaultFileContent(fileName, extension) {
  switch (extension) {
    case "sol":
      return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ${fileName.replace(".sol", "")} {
    // Your contract code here
}`;
    case "js":
      if (fileName.includes("test")) {
        return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("${fileName.replace(".test.js", "")}", function () {
  it("Should deploy successfully", async function () {
    // Your test code here
  });
});`;
      }
      return `// ${fileName}`;
    case "jsx":
      return `import React from 'react';

export default function ${fileName.replace(".jsx", "")}() {
  return (
    <div>
      {/* Your component code here */}
    </div>
  );
}`;
    default:
      return `// ${fileName}`;
  }
}

const indent = 20;

export default function FileTree() {
  const [items, setItems] = useState(initialItems);
  const { openFile } = useEditorStore();

  const tree = useTree({
    initialState: {
      expandedItems: ["app", "contracts", "scripts", "test"],
      selectedItems: [],
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData()?.name ?? "Unknown",
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    canReorder: false,
    onDrop: createOnDropHandler((parentItem, newChildrenIds) => {
      setItems((prevItems) => {
        const sortedChildren = [...newChildrenIds].sort((a, b) => {
          const itemA = prevItems[a];
          const itemB = prevItems[b];
          const isAFolder = (itemA?.children?.length ?? 0) > 0;
          const isBFolder = (itemB?.children?.length ?? 0) > 0;

          if (isAFolder && !isBFolder) return -1;
          if (!isAFolder && isBFolder) return 1;
          return (itemA?.name ?? "").localeCompare(itemB?.name ?? "");
        });

        return {
          ...prevItems,
          [parentItem.getId()]: {
            ...prevItems[parentItem.getId()],
            children: sortedChildren,
          },
        };
      });
    }),
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  const handleFileClick = (item) => {
    if (!item.isFolder()) {
      const itemData = item.getItemData();
      openFile({
        id: item.getId(),
        name: itemData.name,
        content: getDefaultFileContent(itemData.name, itemData.fileExtension),
        language: itemData.fileExtension,
        path: item.getId(),
      });
    }
  };

  return (
    <div className="flex h-full flex-col gap-2 bg-[#0a0a0a]">
      <div className="flex-1 h-full">
        <Tree
          className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          <AssistiveTreeDescription tree={tree} />
          {tree.getItems().map((item) => {
            return (
              <TreeItem key={item.getId()} item={item} className="pb-0">
                <TreeItemLabel
                  className="before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 rounded-none py-1 cursor-pointer"
                  onClick={() => handleFileClick(item)}
                >
                  <span className="-order-1 flex flex-1 items-center gap-2">
                    {item.isFolder() ? (
                      item.isExpanded() ? (
                        <FolderOpenIcon className="text-muted-foreground pointer-events-none size-4" />
                      ) : (
                        <FolderIcon className="text-muted-foreground pointer-events-none size-4" />
                      )
                    ) : (
                      <FileIcon
                        extension={item.getItemData()?.fileExtension}
                        fileName={item.getItemData()?.name}
                        className="text-muted-foreground pointer-events-none size-4"
                      />
                    )}
                    {item.getItemName()}
                  </span>
                </TreeItemLabel>
              </TreeItem>
            );
          })}
        </Tree>
      </div>
    </div>
  );
}
