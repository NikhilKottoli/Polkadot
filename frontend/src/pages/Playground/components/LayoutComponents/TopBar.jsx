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
  Code,
  Download,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useBoardStore from "../../../../store/FlowBoardStore";
import { generateSolidityFromFlowchart } from "../../../../utils/solidityGenerator";

export default function TopBar() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isGeneratingSolidity, setIsGeneratingSolidity] = useState(false);
  const [generatedSolidity, setGeneratedSolidity] = useState("");
  const [showSolidityModal, setShowSolidityModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  const {
    getCurrentProject,
    updateProject,
    getNodes,
    getEdges,
    saveProjectThumbnail,
  } = useBoardStore();

  const currentProject = getCurrentProject();

  // Generate Solidity code from flowchart
  const handleGenerateSolidity = async () => {
    if (!currentProject) return;

    console.log("🔨 [TopBar] Starting Solidity generation");
    setIsGeneratingSolidity(true);

    try {
      const nodes = getNodes();
      const edges = getEdges();

      if (nodes.length === 0) {
        alert("No nodes in the flowchart to generate from!");
        return;
      }

      const solidityCode = generateSolidityFromFlowchart(
        nodes,
        edges,
        currentProject.name
      );
      setGeneratedSolidity(solidityCode);
      setShowSolidityModal(true);

      console.log("✅ [TopBar] Solidity generation completed");
    } catch (error) {
      console.error("❌ [TopBar] Solidity generation failed:", error);
      alert("Failed to generate Solidity code. Please try again.");
    } finally {
      setIsGeneratingSolidity(false);
    }
  };

  // Copy Solidity code to clipboard
  const copySolidityToClipboard = () => {
    navigator.clipboard.writeText(generatedSolidity);
    console.log("📋 [TopBar] Solidity code copied to clipboard");
  };

  // Download Solidity code as file
  const downloadSolidityCode = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedSolidity], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${currentProject?.name || "contract"}.sol`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    console.log("💾 [TopBar] Solidity code downloaded");
  };

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
    <>
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
          <div className="w-84" />
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
            onClick={handleDeploy}
            disabled={currentProject.status === "deployed"}
          >
            <Play className="w-4 h-4 mr-2" />
            {currentProject.status === "deployed" ? "Deployed" : "Deploy"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSolidity}
            disabled={isGeneratingSolidity}
          >
            <Code className="w-4 h-4 mr-2" />
            {isGeneratingSolidity ? "Generating..." : "Generate Solidity"}
          </Button>
        </div>
      </div>

      {/* Solidity Code Modal */}
      {showSolidityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] w-full mx-4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Generated Solidity Contract
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySolidityToClipboard}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSolidityCode}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSolidityModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto">
                <code className="text-xs text-gray-800 dark:text-gray-200">
                  {generatedSolidity}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
