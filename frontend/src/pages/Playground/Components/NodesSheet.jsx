import React, { useState } from "react";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  Zap,
  GitBranch,
  Database,
  Mail,
  Clock,
  Webhook,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Filter,
  ArrowRight,
  Pause,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

const nodeTypes = [
  {
    id: "trigger-webhook",
    name: "Webhook Trigger",
    category: "Triggers",
    description: "Start workflow on HTTP request",
    icon: Webhook,
    color: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  },
  {
    id: "trigger-schedule",
    name: "Schedule Trigger",
    category: "Triggers",
    description: "Run workflow on schedule",
    icon: Clock,
    color: "bg-green-500/20 border-green-500/40 text-green-400",
  },
  {
    id: "trigger-email",
    name: "Email Trigger",
    category: "Triggers",
    description: "Trigger on email received",
    icon: Mail,
    color: "bg-purple-500/20 border-purple-500/40 text-purple-400",
  },
  {
    id: "trigger-calendar",
    name: "Calendar Trigger",
    category: "Triggers",
    description: "Trigger on calendar events",
    icon: Calendar,
    color: "bg-orange-500/20 border-orange-500/40 text-orange-400",
  },
  {
    id: "action-http",
    name: "HTTP Request",
    category: "Actions",
    description: "Make API calls",
    icon: ArrowRight,
    color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
  },
  {
    id: "action-database",
    name: "Database Query",
    category: "Actions",
    description: "Query or update database",
    icon: Database,
    color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-400",
  },
  {
    id: "action-email",
    name: "Send Email",
    category: "Actions",
    description: "Send email notifications",
    icon: Mail,
    color: "bg-red-500/20 border-red-500/40 text-red-400",
  },
  {
    id: "action-slack",
    name: "Slack Message",
    category: "Actions",
    description: "Send Slack notifications",
    icon: MessageSquare,
    color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
  },
  {
    id: "action-file",
    name: "File Operation",
    category: "Actions",
    description: "Read, write, or process files",
    icon: FileText,
    color: "bg-teal-500/20 border-teal-500/40 text-teal-400",
  },
  {
    id: "condition-if",
    name: "If Condition",
    category: "Conditionals",
    description: "Branch based on condition",
    icon: GitBranch,
    color: "bg-pink-500/20 border-pink-500/40 text-pink-400",
  },
  {
    id: "condition-filter",
    name: "Filter",
    category: "Conditionals",
    description: "Filter data based on criteria",
    icon: Filter,
    color: "bg-violet-500/20 border-violet-500/40 text-violet-400",
  },
  {
    id: "condition-switch",
    name: "Switch",
    category: "Conditionals",
    description: "Multiple condition branches",
    icon: Settings,
    color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
  },
  {
    id: "utility-delay",
    name: "Delay",
    category: "Utilities",
    description: "Add delays to workflow",
    icon: Pause,
    color: "bg-gray-500/20 border-gray-500/40 text-gray-400",
  },
  {
    id: "utility-retry",
    name: "Retry Logic",
    category: "Utilities",
    description: "Retry failed operations",
    icon: RefreshCw,
    color: "bg-amber-500/20 border-amber-500/40 text-amber-400",
  },
  {
    id: "utility-success",
    name: "Success Block",
    category: "Utilities",
    description: "Mark workflow success",
    icon: CheckCircle,
    color: "bg-lime-500/20 border-lime-500/40 text-lime-400",
  },
];

export default function NodesSheet() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(nodeTypes.map((node) => node.category)),
  ];

  const filteredNodes = nodeTypes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || node.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleNodeDrag = (nodeType) => {
    // This would typically start a drag operation
    console.log("Dragging node:", nodeType);
  };

  return (
    <SheetContent
      side="left"
      className="w-[400px] border border-white/10 bg-[#171717]/60 backdrop-blur-md overflow-y-auto"
    >
      <SheetHeader>
        <SheetTitle>
          <div className="flex items-center gap-2">
            <img src="/logo.svg" />
            <p className="font-bold text-white">Polkaflow</p>
          </div>
        </SheetTitle>
        <SheetDescription className="mt-4 text-gray-400">
          Add different types of nodes, triggers, actions and conditional blocks
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 px-4 py-6">
        {/* Search Input */}
        <div className="space-y-2">
          <Input
            id="search-nodes"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                selectedCategory === category
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredNodes.map((node) => {
            const IconComponent = node.icon;
            return (
              <div
                key={node.id}
                draggable
                onDragStart={() => handleNodeDrag(node)}
                className={`
                  p-3 rounded-lg border cursor-grab active:cursor-grabbing
                  transition-all duration-200 hover:scale-105 hover:shadow-lg
                  ${node.color}
                  hover:border-opacity-60 hover:bg-opacity-30
                `}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 rounded-lg bg-black/20">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm leading-tight">
                      {node.name}
                    </h3>
                    <p className="text-xs opacity-70 mt-1 leading-tight">
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No nodes found matching your search.</p>
          </div>
        )}
      </div>

      <SheetFooter className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center w-full">
          Drag nodes to canvas to add them to your workflow
        </p>
      </SheetFooter>
    </SheetContent>
  );
}
