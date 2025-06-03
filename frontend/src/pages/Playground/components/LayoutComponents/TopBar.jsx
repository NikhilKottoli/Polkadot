import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleUser,
  Edit,
  ArrowLeft,
  Save,
  Play,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useBoardStore from "../../store";

export default function TopBar() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  const { getCurrentProject, updateProject, getNodes, getEdges } =
    useBoardStore();

  const currentProject = getCurrentProject();

  // Initialize edit form when editing starts
  const handleStartEdit = () => {
    if (currentProject) {
      setEditForm({
        name: currentProject.name,
        description: currentProject.description || "",
      });
      setIsEditing(true);
    }
  };

  // Save project details
  const handleSaveEdit = () => {
    if (currentProject && editForm.name.trim()) {
      updateProject(currentProject.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      setIsEditing(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: "", description: "" });
  };

  // Save project workflow
  const handleSave = () => {
    if (currentProject) {
      updateProject(currentProject.id, {
        nodes: getNodes(),
        edges: getEdges(),
        updatedAt: new Date().toISOString(),
      });

      // Optional: Show success notification
      console.log("Project saved successfully!");
    }
  };

  // Deploy project
  const handleDeploy = () => {
    if (currentProject) {
      // Save current state before deploying
      updateProject(currentProject.id, {
        nodes: getNodes(),
        edges: getEdges(),
        status: "deployed",
        deployedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Optional: Show success notification
      console.log("Project deployed successfully!");
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (!currentProject) {
    return (
      <div className="h-[20px] mb-4 px-4 mt-2 flex justify-between w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img className="" src="/logo.svg" alt="Logo" />
          <p className="font-bold">Polkaflow</p>
        </div>
        <div className="text-muted-foreground">No project selected</div>
      </div>
    );
  }

  return (
    <div className="h-[20px] mb-4 px-4 mt-2 flex justify-between w-full">
      {/* Left Section - Logo and Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="ml-[-10px] mr-[8px]"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 " />
        </Button>
        <img className="" src="/logo.svg" alt="Logo" />
        <p className="font-bold">Polkaflow</p>
      </div>

      {/* Center Section - Project Info */}
      <div className="flex gap-2 items-center h-full">
        {isEditing ? (
          <div
            className={`flex  gap-2 min-w-[300px] ${
              isEditing ? " items-center" : "flex-col"
            }`}
          >
            <div className="flex items-center gap-2 justify-center text-center">
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Project name"
                className="h-8 text-sm font-semibold"
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            <Input
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              placeholder="Project description"
              className="h-6 text-xs"
              onKeyDown={handleKeyDown}
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleSaveEdit}
                disabled={!editForm.name.trim()}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 group text-center">
            <div>
              <h1 className="font-semibold">{currentProject.name}</h1>
              <p className="text-sm text-muted-foreground">
                {currentProject.description || "No description"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleStartEdit}
            >
              <Edit size={12} />
            </Button>
          </div>
        )}
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
          <div
            className={`w-2 h-2 rounded-full ${
              currentProject.status === "deployed"
                ? "bg-green-500"
                : currentProject.status === "draft"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}
          />
          <span className="capitalize">{currentProject.status}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="relative"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          size="sm"
          onClick={handleDeploy}
          disabled={currentProject.status === "deployed"}
        >
          <Play className="w-4 h-4 mr-2" />
          {currentProject.status === "deployed" ? "Deployed" : "Deploy"}
        </Button>
      </div>
    </div>
  );
}
