import React, { useState } from "react";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  Zap,
  Brain,
  Link,
  Wallet,
  Settings,
  X,
  History,
  ChevronRight,
  Info,
  Plus,
} from "lucide-react";

import { NODE_TYPES } from "../Node/NodeTypes";
import { useNodeOperations } from "../../NodeOperations";

// Category configurations
const CATEGORY_CONFIG = {
  trigger: {
    name: "Triggers",
    icon: Zap,
    color: " border-purple-500/40 ",
    description: "Event listeners and workflow starters",
  },
  action: {
    name: "Actions",
    icon: Settings,
    color: " border-blue-500/40 ",
    description: "Execute operations and transactions",
  },
  logic: {
    name: "Logic & Utilities",
    icon: Brain,
    color: " border-green-500/40 ",
    description: "Data processing and conditional logic",
  },
  bridge: {
    name: "Bridge & DeFi",
    icon: Link,
    color: " border-orange-500/40 ",
    description: "Cross-chain and DeFi operations",
  },
  wallet: {
    name: "Wallet",
    icon: Wallet,
    color: " border-violet-500/40 ",
    description: "Wallet management and interactions",
  },
  ai: {
    name: "AI/ML",
    icon: Brain,
    color: " border-pink-500/40 ",
    description: "Artificial intelligence and machine learning",
  },
};

// Flatten nodes for easier searching
const getAllNodes = () => {
  const nodes = [];
  Object.entries(NODE_TYPES).forEach(([categoryKey, categoryNodes]) => {
    Object.entries(categoryNodes).forEach(([nodeKey, nodeData]) => {
      nodes.push({
        ...nodeData,
        categoryKey,
        categoryConfig: CATEGORY_CONFIG[categoryKey],
        nodeKey, // Add nodeKey for identification
      });
    });
  });
  return nodes;
};

export default function EnhancedNodesSheet() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [recentSearches, setRecentSearches] = useState([]);
  const [expandedNode, setExpandedNode] = useState(null);

  // Use the node operations hook
  const { createNode } = useNodeOperations();

  const allNodes = getAllNodes();
  const categories = ["All", ...Object.keys(CATEGORY_CONFIG)];

  // Get subcategories based on selected category
  const getSubcategories = () => {
    if (selectedCategory === "All") {
      const allSubs = new Set();
      allNodes.forEach((node) => {
        if (node.subcategory) allSubs.add(node.subcategory);
      });
      return ["All", ...Array.from(allSubs)];
    }

    const subs = new Set();
    allNodes
      .filter((node) => node.categoryKey === selectedCategory)
      .forEach((node) => {
        if (node.subcategory) subs.add(node.subcategory);
      });
    return ["All", ...Array.from(subs)];
  };

  const subcategories = getSubcategories();

  // Filter nodes based on search and category
  const filteredNodes = allNodes.filter((node) => {
    const matchesSearch =
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.categoryKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.subcategory &&
        node.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || node.categoryKey === selectedCategory;

    const matchesSubcategory =
      selectedSubcategory === "All" || node.subcategory === selectedSubcategory;

    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  // Handle search with recent searches
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      const newRecentSearches = [term.trim(), ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
    }
  };

  const clearRecentSearch = (searchToRemove) => {
    setRecentSearches(
      recentSearches.filter((search) => search !== searchToRemove)
    );
  };

  // Updated handleNodeDrag to use createNode
  const handleNodeDrag = (node) => {
    // Generate a random position for the new node
    const position = {
      x: Math.random() * 400,
      y: Math.random() * 300,
    };
    // Create the node using the hook
    const nodeId = createNode(node.nodeKey || node.categoryKey, position);
    console.log(
      "Created node:",
      nodeId,
      "of type:",
      node.nodeKey || node.categoryKey
    );
  };

  // Handle drag start for better drag and drop experience
  const handleDragStart = (e, node) => {
    e.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({
        nodeType: node.nodeKey || node.categoryKey,
        nodeData: node,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const toggleNodeExpanded = (nodeId) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };

  // Quick add popular nodes
  const quickAddNodes = [
    { label: "Timer", nodeKey: "timer", icon: "⏰" },
    { label: "HTTP Request", nodeKey: "http", icon: "🌐" },
    { label: "Condition", nodeKey: "condition", icon: "🔀" },
    { label: "Transform", nodeKey: "transform", icon: "⚡" },
  ];

  return (
    <SheetContent
      side="left"
      className="min-w-[600px] border border-white/10 bg-[#171717]/60 backdrop-blur-md overflow-y-auto"
    >
      <SheetHeader>
        <SheetTitle>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <p className="font-bold text-white">Polkaflow Nodes</p>
          </div>
        </SheetTitle>
        <SheetDescription className="mt-4 text-gray-400">
          Browse and search through all available nodes for your workflow
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 px-4 py-6">
        {/* Search Input */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search nodes, categories, or descriptions..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && searchTerm === "" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <History className="w-3 h-3" />
                Recent searches
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-400"
                  >
                    <button
                      onClick={() => setSearchTerm(search)}
                      className="hover:text-white transition-colors"
                    >
                      {search}
                    </button>
                    <button
                      onClick={() => clearRecentSearch(search)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Section */}
        <div className="space-y-3">
          <div className="text-xs text-gray-500 font-medium">Quick Add</div>
          <div className="flex flex-wrap gap-2">
            {quickAddNodes.map((quickNode) => (
              <button
                key={quickNode.nodeKey}
                onClick={() => {
                  const position = {
                    x: Math.random() * 400,
                    y: Math.random() * 300,
                  };
                  createNode(quickNode.nodeKey, position);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
              >
                <span>{quickNode.icon}</span>
                {quickNode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <div className="text-xs text-gray-500 font-medium">Categories</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const config = CATEGORY_CONFIG[category];
              const IconComponent = config?.icon;

              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcategory("All");
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all ${
                    selectedCategory === category
                      ? config?.color ||
                        "bg-blue-500/20 border-blue-500/40 text-blue-400"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {IconComponent && <IconComponent className="w-3 h-3" />}
                  {config?.name || category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory Filter */}
        {subcategories.length > 1 && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 font-medium">
              Subcategories
            </div>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className={`px-2 py-1 text-xs rounded-md border transition-all ${
                    selectedSubcategory === subcategory
                      ? "bg-gray-500/20 border-gray-500/40 text-gray-300"
                      : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                  }`}
                >
                  {subcategory
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="text-xs text-gray-500">
          Showing {filteredNodes.length} of {allNodes.length} nodes
        </div>

        {/* Nodes Grid - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredNodes.map((node) => {
            const isExpanded = expandedNode === node.id;
            const categoryConfig = node.categoryConfig;

            return (
              <div
                key={node.id}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${
                    categoryConfig?.color ||
                    "bg-gray-500/20 border-gray-500/40 text-gray-400"
                  }
                  hover:border-opacity-60 hover:bg-opacity-30 hover:scale-[1.02]
                  ${isExpanded ? "lg:col-span-2" : ""}
                `}
              >
                <div
                  onClick={() => toggleNodeExpanded(node.id)}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-black/20 text-lg">
                      {node.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{node.label}</h3>
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {node.subcategory?.replace(/_/g, " ") ||
                            categoryConfig?.name}
                        </Badge>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed">
                        {node.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeDrag(node);
                      }}
                      className="px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded transition-colors flex items-center gap-1"
                      title="Add node to canvas"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                    <button
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, node);
                      }}
                      className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                      title="Drag to canvas"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Properties */}
                {isExpanded && node.properties && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Info className="w-3 h-3" />
                      Configuration Properties
                    </div>
                    <div className="grid gap-2">
                      {Object.entries(node.properties).map(([key, prop]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="text-gray-300">{prop.label}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5"
                            >
                              {prop.type}
                            </Badge>
                            {prop.default !== undefined &&
                              prop.default !== "" && (
                                <span className="text-gray-500">
                                  {typeof prop.default === "boolean"
                                    ? prop.default
                                      ? "true"
                                      : "false"
                                    : String(prop.default)}
                                </span>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredNodes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No nodes found</p>
            <p className="text-sm">
              Try adjusting your search terms or category filters
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => {
            const position = {
              x: Math.random() * 400,
              y: Math.random() * 300,
            };
            createNode("action", position);
          }}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Quick add action node"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      <SheetFooter className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-gray-500 text-center w-full space-y-1">
          <p>
            Click Add button or drag nodes to canvas • Click to expand details
          </p>
          <p className="opacity-60">{allNodes.length} total nodes available</p>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
