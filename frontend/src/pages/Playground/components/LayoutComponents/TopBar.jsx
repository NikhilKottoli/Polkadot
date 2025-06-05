import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
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
import useBoardStore from "../../../../store/store";
import GeneratedCodeModal from "../Board/GeneratedCodeModal";
const { project } = useBoardStore.getState();

export default function TopBar() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const {
    getCurrentProject,
    updateProject,
    getNodes,
    getEdges,
    saveProjectThumbnail,
  } = useBoardStore();
  const geminiKey = ""; // put your key here Lil bro
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

  const data = {
      nodes: project?.nodes || [],
      edges: project?.edges || [],
      description: project?.description || "",
  }

const handleGenerate = async ({ example }) => {

  const instructions = "Give me solidity code for the following data and make sure you provide the full code (don't leave it empty at any cost. use the description etc to generate something don't leave it empty). Here are the nodes and edges in the project workflow.  give me code for the logic as you understand and nothing else, no explaination, no comments, just the code. The code should be in a single file and should not include any imports or package.json. The code should be a complete and functional smart contract that can be deployed on the Ethereum network. The code should be optimized for gas efficiency and should follow best practices for security and performance.";
  const prompt = `
  Instructions:
  ${instructions}

  Data:
  ${JSON.stringify(data, null, 2)}`;

    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      });

      const result = await res.json();
      const code = result.candidates[0].content.parts[0].text;
      console.log('Generated code:', code);
      setGeneratedCode(code);
      setModalOpen(true);
      return code;
    } catch (error) {
      console.error('Error calling Gemini:', error);
      return { error: error.message };
    }
  };

  // Save project workflow
  const handleSave = () => {
    if (currentProject) {
      updateProject(currentProject.id, {
        nodes: getNodes(),
        edges: getEdges(),
        updatedAt: new Date().toISOString(),
      });

      console.log("Project saved successfully!");
    }
  };

  // Deploy project
  const handleDeploy = () => {
    if (currentProject) {
      updateProject(currentProject.id, {
        nodes: getNodes(),
        edges: getEdges(),
        status: "deployed",
        deployedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log("Project deployed successfully!");
    }
  };

  // Enhanced screenshot function with html2canvas
  const takeScreenshotAndExit = async () => {
    if (!currentProject) {
      navigate("/dashboard");
      return;
    }

    setIsCapturingScreenshot(true);

    try {
      // Find the React Flow container with better selectors
      const flowContainer =
        document.querySelector(".react-flow") ||
        document.querySelector('[data-testid="rf__wrapper"]') ||
        document.querySelector(".react-flow__renderer") ||
        document.querySelector(".react-flow__container") ||
        document.body;

      if (flowContainer) {
        // Save current project state first
        updateProject(currentProject.id, {
          nodes: getNodes(),
          edges: getEdges(),
          updatedAt: new Date().toISOString(),
        });

        // Configure html2canvas options for better quality
        const canvas = await html2canvas(flowContainer, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: true,
          allowTaint: true,
          width: flowContainer.scrollWidth || flowContainer.offsetWidth,
          height: flowContainer.scrollHeight || flowContainer.offsetHeight,
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (element) => {
            // Ignore certain UI elements that shouldn't be in screenshot
            return (
              element.classList.contains("react-flow__controls") ||
              element.classList.contains("react-flow__minimap") ||
              element.tagName === "BUTTON"
            );
          },
        });

        // Convert canvas to base64 image
        const imageData = canvas.toDataURL("image/png", 0.8);

        // Save thumbnail using your store method
        await saveProjectThumbnail(currentProject.id, imageData);

        console.log("Screenshot saved and cached successfully!");
      }
    } catch (error) {
      console.error("Failed to take screenshot:", error);
    } finally {
      setIsCapturingScreenshot(false);
      // Always navigate back, even if screenshot fails
      navigate("/dashboard");
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
          onClick={takeScreenshotAndExit}
          disabled={isCapturingScreenshot}
        >
          <ArrowLeft className="w-4 h-4" />
          {isCapturingScreenshot && (
            <span className="ml-1 text-xs">Capturing...</span>
          )}
        </Button>
        <img className="" src="/logo.svg" alt="Logo" />
        <p className="font-bold">Polkaflow</p>
      </div>

      {/* Center Section - Project Info */}
      <div className="flex gap-2 items-center h-full">
        {isEditing ? (
          <div className="flex gap-2 min-w-[300px] items-center">
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
          onClick={handleGenerate}
        >
          <Play className="w-4 h-4 mr-2" />
          Generate Code
        </Button>
        <GeneratedCodeModal open={modalOpen} code={generatedCode} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
}
