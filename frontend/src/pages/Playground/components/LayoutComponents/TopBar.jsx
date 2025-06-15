import React, { useState, useEffect } from "react";
import {
  solidityCompiler,
  getCompilerVersions,
} from "@agnostico/browser-solidity-compiler";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  Check,
  Edit,
  FileText,
  Save,
  Sparkle,
  Wallet,
  TestTube,
  X,
  Play,
  Rocket,
  Copy,
  Download,
  Code,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import useBoardStore from "../../../../store/store";

import {
  compileContract,
  deployContract,
} from "../../../../utils/contractService";

import { ContractGenerationService } from "../../../../services/contractGenerationService";

export default function TopBar({
  walletAddress,
  setWalletAddress,
  setVersionTrigger,
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isGeneratingSolidity, setIsGeneratingSolidity] = useState(false);
  const [generatedSolidity, setGeneratedSolidity] = useState("");
  const [showSolidityModal, setShowSolidityModal] = useState(false);
  const [showGenerationChoice, setShowGenerationChoice] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [contractName, setContractName] = useState("");
  const [compilationResult, setCompilationResult] = useState({
    abi: null,
    bytecode: null,
  });
  const [deploymentResult, setDeploymentResult] = useState({
    address: null,
    txHash: null,
  });
  const [operationState, setOperationState] = useState({
    loading: false,
    error: null,
    message: null,
  });
  const [gasEstimation, setGasEstimation] = useState({
    deploymentGas: null,
    functionGasEstimates: {},
    totalEstimatedCost: null,
    error: null,
  });
  const [contractGenerationResult, setContractGenerationResult] =
    useState(null);
  const [showRustOptimizationOption, setShowRustOptimizationOption] =
    useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const {
    getCurrentProject,
    updateProject,
    getNodes,
    getEdges,
    saveProjectThumbnail,
  } = useBoardStore();

  const currentProject = getCurrentProject();

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        try {
          // Check for existing accounts
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", (newAccounts) => {
            setWalletAddress(newAccounts.length > 0 ? newAccounts[0] : null);
          });
        } catch (error) {
          console.error("Error initializing wallet:", error);
        }
      }
    };
    initWallet();

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Wallet connection failed:", error);
        alert("Failed to connect wallet.");
      }
    } else {
      alert("MetaMask not found. Please install the extension.");
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setShowWalletDetails(false);
  };

  const handleGenerate = async (type) => {
    setShowGenerationChoice(false);
    if (!currentProject) {
      alert("Please select or create a project first.");
      return;
    }

    console.log("🔨 [TopBar] Starting contract generation");
    setIsGeneratingSolidity(true);
    // Reset states
    setCompilationResult({ abi: null, bytecode: null });
    setDeploymentResult({ address: null, txHash: null });
    setOperationState({ loading: false, error: null, message: null });
    
    // Ensure we have a valid contract name
    const projectName = currentProject.name || "MyContract";
    const name = projectName.replace(/\s+/g, '') || "MyContract";
    console.log("🏷️ [TopBar] Using contract name:", name);
    setContractName(name);

    try {
      const nodes = getNodes();
      const edges = getEdges();

      // Use the ContractGenerationService with AI
      console.log("🤖 [TopBar] Using AI for contract generation");
      const result = await ContractGenerationService.generateContract(
        nodes,
        edges,
        name,
        "ai"
      );

      setGeneratedSolidity(result.original.solidity);
      setGasEstimation(result.original.gasEstimation);
      setContractGenerationResult(result);

      // Check if we have high gas functions that could benefit from Rust optimization
      if (result.original.highGasFunctions.length > 0) {
        setShowRustOptimizationOption(true);
      }

      setShowSolidityModal(true);
    } catch (error) {
      console.error("Contract generation failed:", error);
      alert(`Contract generation failed: ${error.message}`);
    } finally {
      setIsGeneratingSolidity(false);
    }
  };

  const handleCompile = async () => {
    setOperationState({ loading: true, error: null, message: "Compiling..." });
    setCompilationResult({ abi: null, bytecode: null });
    setDeploymentResult({ address: null, txHash: null });

    const result = await compileContract(generatedSolidity, contractName);
    if (result.success) {
      setCompilationResult({ abi: result.abi, bytecode: result.bytecode });
      setOperationState({
        loading: false,
        error: null,
        message: "Compilation successful!",
      });
    } else {
      setOperationState({ loading: false, error: result.error, message: null });
    }
  };

  const handleDeployContract = async () => {
    if (!compilationResult.bytecode || !walletAddress) {
      alert("Contract not compiled or wallet not connected.");
      return;
    }
    setOperationState({ loading: true, error: null, message: "Deploying..." });
    const contractName = currentProject?.name || "FlowchartContract";
    const result = await deployContract(
      compilationResult.abi,
      compilationResult.bytecode,
      walletAddress,
      contractName
    );
    if (result.success) {
      setDeploymentResult({
        address: result.contractAddress,
        txHash: result.transactionHash,
      });
      setOperationState({
        loading: false,
        error: null,
        message: `Deployment successful!`,
      });

      // Update project with deployment info and register for monitoring
      const deploymentUpdates = {
        status: "deployed",
        deployedAt: new Date().toISOString(),
        contractAddress: result.contractAddress,
        abi: compilationResult.abi,
      };
      updateProject(currentProject.id, deploymentUpdates);
      console.log(
        "✅ Project updated with deployment info:",
        deploymentUpdates
      );

      // Register contract for monitoring
      try {
        await fetch("http://localhost:3000/api/monitor/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractAddress: result.contractAddress,
            abi: compilationResult.abi,
            contractName: contractName,
          }),
        });
        console.log("✅ Contract registered for monitoring");
      } catch (error) {
        console.error("❌ Failed to register contract for monitoring:", error);
      }
    } else {
      setOperationState({ loading: false, error: result.error, message: null });
    }
  };

  const handleGenerateClick = () => {
    if (!currentProject) return;
    const nodes = getNodes();
    if (nodes.length === 0) {
      alert("No nodes in the flowchart to generate from!");
      return;
    }
    setShowGenerationChoice(true);
  };

  const handleOptimizeWithRust = () => {
    if (!contractGenerationResult || !contractGenerationResult.optimized) {
      alert("No optimization data available");
      return;
    }

    console.log("🚀 [TopBar] Navigating to code editor with optimization data");
    console.log("Original contract:", contractGenerationResult.original);
    console.log("Optimized contracts:", contractGenerationResult.optimized);

    // Navigate to the code editor page with the contract data
    navigate("/code-editor", {
      state: {
        originalContract: contractGenerationResult.original,
        optimizedContracts: contractGenerationResult.optimized,
        contractName: contractName,
        highGasFunctions: contractGenerationResult.original.highGasFunctions,
      },
    });
    setShowSolidityModal(false);
  };

  const copySolidityToClipboard = () =>
    navigator.clipboard.writeText(generatedSolidity);

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

  const handleStartEdit = () => {
    if (currentProject) {
      setEditForm({
        name: currentProject.name,
        description: currentProject.description || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (currentProject && editForm.name.trim()) {
      updateProject(currentProject.id, editForm);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSave = async () => {
    if (!currentProject || !walletAddress) {
      alert("Project and wallet must be selected.");
      return;
    }

    const flowData = {
      nodes: getNodes(),
      edges: getEdges(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:3000/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          walletId: walletAddress,
          flowData: flowData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Project saved successfully!");
        // Optionally update local state as well
        updateProject(currentProject.id, flowData);
      } else {
        console.error("Save failed:", data.error);
        alert("Save failed: " + data.error);
      }
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Error saving project: " + err.message);
    }
  };

  const takeScreenshotAndExit = async () => {
    if (!currentProject) {
      navigate("/dashboard");
      return;
    }
    setIsCapturingScreenshot(true);
    try {
      const flowContainer =
        document.querySelector(".react-flow") || document.body;
      const canvas = await html2canvas(flowContainer, { scale: 1 });
      const imageData = canvas.toDataURL("image/png", 0.8);
      await saveProjectThumbnail(currentProject.id, imageData);
    } catch (error) {
      console.error("Failed to take screenshot:", error);
    } finally {
      setIsCapturingScreenshot(false);
      navigate("/dashboard");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) handleSaveEdit();
    else if (e.key === "Escape") handleCancelEdit();
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <img src="/logo.svg" alt="Logo" className="h-5" />
          <p className="font-bold">Polkaflow</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[20px] mb-4 px-4 mt-2 flex justify-between w-full items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={takeScreenshotAndExit}
            disabled={isCapturingScreenshot}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src="/logo.svg" alt="Logo" className="h-5" />
          <p className="font-bold">Polkaflow</p>
          <div className="w-84" />
        </div>

        <div className="flex-1 flex justify-center items-center">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                onKeyDown={handleKeyDown}
                className="h-8"
              />
              <Button onClick={handleSaveEdit} size="sm">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={handleCancelEdit} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="font-semibold text-lg">{currentProject.name}</h1>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={handleStartEdit}
              >
                <Edit size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <Button onClick={handleSave} size="sm" className="-mr-4 z-2">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            onClick={() => {
              setVersionTrigger((a) => !a);
            }}
            variant="outline"
            className="text-xs  cursor-pointer hover:text-white  h-8  border  border-white/60"
          >
            Load version
          </Button>

          <div className="relative ">
            {!walletAddress ? (
              <Button onClick={handleConnectWallet} size="sm">
                Connect Wallet
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setShowWalletDetails(!showWalletDetails)}
                  size="icon"
                  variant="outline"
                >
                  <Wallet className="h-5 w-5 text-green-500" />
                </Button>

                {showWalletDetails && (
                  <div className="absolute top-12 right-0 bg-gray-800 border border-gray-700 rounded-lg p-4 w-72 z-50 text-white shadow-lg">
                    <p className="text-sm text-gray-400 mb-1">
                      Connected Wallet
                    </p>
                    <p className="font-mono text-xs break-words mb-4">
                      {walletAddress}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleDisconnectWallet}
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            onClick={handleGenerateClick}
            disabled={isGeneratingSolidity}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isGeneratingSolidity ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Code className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </div>
      {showGenerationChoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-xl mx-4">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Flowchart to Contract Generation
            </h2>
            <p className="text-muted-foreground mb-8">
              Using <span className="text-primary font-semibold"> AI</span> for
              intelligent contract generation with gas estimation.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleGenerate("ai")}
                className="p-6 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/30 transition-colors group"
              >
                <Sparkle className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-foreground">
                  🚀 AI Generator
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  AI + Gas Analysis
                </div>
              </button>

              <button
                onClick={() => handleGenerate("our-algorithm")}
                className="p-6 bg-secondary/10 hover:bg-secondary/20 rounded-lg border border-secondary/30 transition-colors group"
              >
                <FileText className="w-10 h-10 mx-auto mb-3 text-secondary-foreground group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-foreground">
                  📋 Template Logic
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Basic flowchart conversion
                </div>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mb-6 mt-16">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Info className="w-4 h-4" />
                      Implementation Features
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <div className="font-semibold text-sm">
                        ✅ Available Features:
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>• Gemini AI contract generation</div>
                        <div>• Gas estimation & analysis</div>
                        <div>• AI-powered Rust optimization</div>
                        <div>• Gas comparison & savings</div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              onClick={() => setShowGenerationChoice(false)}
              variant="ghost"
              className="w-full mt-8 "
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showSolidityModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur">
          <div className="bg-background border rounded-lg p-6 max-w-[80%] max-h-[90vh] w-full flex flex-col min-h-[70vh] shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Generated Solidity Contract
                </h3>
                <Badge variant="secondary" className="font-mono text-primary">
                  {contractName}.sol
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSolidityModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-6 flex-1 overflow-auto">
              {/* Code Editor Column */}

              <Card className="flex flex-col h-full max-w-[60%]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">
                    Solidity Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <div className="relative h-full overflow-x-auto">
                    <SyntaxHighlighter
                      language="solidity"
                      style={atomOneDark}
                      customStyle={{
                        overflow: "auto",
                        margin: 0,
                        padding: "1rem",
                        height: "100%",
                        minHeight: "70vh",
                        background: "hsl(var(--muted))",
                        borderRadius: "calc(var(--radius) - 2px)",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                      }}
                      showLineNumbers={true}
                      lineNumberStyle={{
                        color: "hsl(var(--muted-foreground))",
                        paddingRight: "1rem",
                        minWidth: "2.5rem",
                      }}
                    >
                      {generatedSolidity}
                    </SyntaxHighlighter>

                    {/* Overlay textarea for editing */}
                    <textarea
                      value={generatedSolidity}
                      onChange={(e) => setGeneratedSolidity(e.target.value)}
                      className="absolute inset-0 p-4 w-full h-full bg-transparent resize-none focus:outline-none text-transparent caret-primary font-mono text-sm leading-6"
                      spellCheck="false"
                      style={{
                        caretColor: "hsl(var(--primary))",
                        lineHeight: "1.5",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Compilation & Deployment Column */}
              <div className="flex flex-col h-full overflow-y-auto space-y-4">
                {/* Gas Estimates */}
                {gasEstimation?.functionGasEstimates &&
                  Object.keys(gasEstimation.functionGasEstimates).length >
                    0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Code className="h-4 w-4 text-primary" />
                          Function Gas Estimates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(gasEstimation.functionGasEstimates).map(
                          ([funcName, gasData]) => (
                            <div
                              key={funcName}
                              className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                            >
                              <span className="text-sm font-mono text-muted-foreground">
                                {funcName}():
                              </span>
                              <Badge
                                variant={
                                  gasData.estimated > 100000
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="font-mono"
                              >
                                {gasData.estimated} gas
                                {gasData.estimated > 100000 && " ⚠️"}
                              </Badge>
                            </div>
                          )
                        )}

                        {/* Rust Optimization */}
                        {showRustOptimizationOption && (
                          <>
                            <Separator className="my-3" />
                            <div className="p-3 border border-orange-200/40 dark:border-orange-800 rounded-md bg-red-500/20 dark:bg-orange-950/20">
                              <p className="text-xs text-orange-300 dark:text-orange-300 mb-2">
                                High gas functions detected. Optimize with Rust
                                for better performance.
                              </p>
                              <Button
                                size="sm"
                                onClick={handleOptimizeWithRust}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <Code className="w-4 h-4 mr-2" />
                                Optimize with Rust
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                {/* Compilation Output */}
                {compilationResult.abi && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-600 dark:text-green-400">
                        Compilation Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block font-medium">
                          ABI
                        </label>
                        <SyntaxHighlighter
                          language="json"
                          style={atomOneDark}
                          customStyle={{
                            margin: 0,
                            fontSize: "0.75rem",
                            maxHeight: "8rem",
                            background: "hsl(var(--muted))",
                            borderRadius: "calc(var(--radius) - 2px)",
                          }}
                        >
                          {JSON.stringify(compilationResult.abi, null, 2)}
                        </SyntaxHighlighter>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block font-medium">
                          Bytecode
                        </label>
                        <div className="max-h-32 overflow-auto p-3 bg-muted rounded-md">
                          <code className="text-xs font-mono text-muted-foreground break-all">
                            {compilationResult.bytecode}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Deployment Details */}
                {deploymentResult.address && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-600 dark:text-blue-400">
                        Deployment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground font-medium">
                            Deployed By:
                          </span>
                          <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                            {walletAddress}
                          </code>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">
                            Contract Address:
                          </span>
                          <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                            {deploymentResult.address}
                          </code>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">
                            Transaction Hash:
                          </span>
                          <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                            {deploymentResult.txHash}
                          </code>
                        </div>
                      </div>

                      <Separator />

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <a
                          href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${deploymentResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Blockscout
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={handleCompile}
                  disabled={operationState.loading || !generatedSolidity}
                  variant="default"
                >
                  {operationState.loading &&
                  operationState.message?.startsWith("Compiling") ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Compile
                </Button>

                <Button
                  onClick={handleDeployContract}
                  disabled={
                    !compilationResult.bytecode ||
                    operationState.loading ||
                    !walletAddress
                  }
                  variant="default"
                >
                  {operationState.loading &&
                  operationState.message?.startsWith("Deploying") ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Rocket className="mr-2 h-4 w-4" />
                  )}
                  Deploy
                </Button>
              </div>

              {/* Status Messages */}
              <div className="flex-1 text-center mx-4">
                {operationState.message && !operationState.error && (
                  <Badge
                    variant="secondary"
                    className="text-green-600 dark:text-green-400"
                  >
                    {operationState.message}
                  </Badge>
                )}
                {operationState.error && (
                  <Badge variant="destructive" className="font-mono text-xs">
                    {operationState.error}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={copySolidityToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={downloadSolidityCode}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
