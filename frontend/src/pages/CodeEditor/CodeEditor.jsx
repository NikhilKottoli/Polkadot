// components/CodeEditor.tsx (Updated with FileTree reload)
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FileTree from "./components/FileTree";
import { MonacoEditor } from "./components/MonacoEditor";
import { FileTabs } from "./components/FileTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  ExternalLink,
  Eye,
  FileText,
  ArrowLeft,
  Code,
  Rocket,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { compileContract, deployContract } from "../../utils/contractService";
import { RustCompilationService } from "../../services/rustCompilationService";

export default function CodeEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  // State for contract operations
  const [compilationResults, setCompilationResults] = useState({});
  const [deploymentResults, setDeploymentResults] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [walletAddress, setWalletAddress] = useState(null);

  // Extract data from location state
  const {
    originalContract,
    optimizedContracts,
    contractName,
    highGasFunctions,
  } = location.state || {};

  const {
    files,
    openFile,
    getActiveFile,
    loadContractFiles,
    setDeployedContract,
    updateContractWithAddress,
    setGasComparison,
    gasComparison,
    deployedContracts,
  } = useEditorStore();

// Initialize files from contract generation data
    useEffect(() => {
      console.log("🔄 [CodeEditor] Initializing files...", {
        originalContract,
        optimizedContracts,
        contractName,
      });

      if (originalContract) {
        const contractFiles = [];

        contractFiles.push({
          id: "main-solidity",
          name: `${contractName}.sol`,
          content: originalContract.solidity,
          language: "solidity",
          path: `contracts/${contractName}.sol`,
          type: "solidity",
          canCompile: true,
          canDeploy: true,
          dependencies: [],
          originalGas: originalContract.gasEstimation?.functionGasEstimates || {},
        });

        console.log("✅ [CodeEditor] Added main Solidity contract");

        // Add optimized contracts if available
        if (optimizedContracts) {
          console.log(
            "🦀 [CodeEditor] Adding Rust contracts:",
            optimizedContracts.rustContracts
          );

          optimizedContracts.rustContracts.forEach(async (rustContract, index) => {
            // Validate rust contract data
            if (!rustContract.name || !rustContract.code) {
              console.warn(
                "⚠️ [CodeEditor] Invalid Rust contract:",
                rustContract
              );
              return;
            }

            // Add Rust contract (only .rs files, hide config files)
            contractFiles.push({
              id: `rust-${rustContract.functionName || rustContract.name}`,
              name: `${rustContract.name}.rs`,
              content: rustContract.code,
              language: "rust",
              path: `rust/${rustContract.name}.rs`,
              type: "rust",
              canCompile: true,
              canDeploy: true,
              dependencies: [],
              functionName: rustContract.functionName || rustContract.name,
              estimatedGasSavings: rustContract.estimatedGasSavings,
              optimizations: rustContract.optimizations,
              cargoToml: rustContract.cargoToml,
              makefile: rustContract.makefile,
            });

            console.log(
              `✅ [CodeEditor] Added Rust contract: ${rustContract.name}.rs`
            );

            // Send POST request to :3000 for each Rust file
            try {
              const requestBody = {
                id: `rust-${rustContract.functionName || rustContract.name}`,
                name: `${rustContract.name}.rs`,
                content: rustContract.code,
                language: "rust",
                path: `rust/${rustContract.name}.rs`,
                type: "rust",
                functionName: rustContract.functionName || rustContract.name,
                estimatedGasSavings: rustContract.estimatedGasSavings,
                optimizations: rustContract.optimizations,
                cargoToml: rustContract.cargoToml,
                makefile: rustContract.makefile,
                contractName: contractName,
                timestamp: new Date().toISOString()
              };

              console.log(`📤 [CodeEditor] Sending POST request for ${rustContract.name}:`, requestBody);

              const response = await fetch('http://localhost:3000/api/rust/compile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
              });

              if (response.ok) {
                const responseData = await response.json();
                console.log(`✅ [CodeEditor] POST request successful for ${rustContract.name}:`, responseData);
              } else {
                console.error(`❌ [CodeEditor] POST request failed for ${rustContract.name}:`, response.status, response.statusText);
              }
            } catch (error) {
              console.error(`❌ [CodeEditor] Error sending POST request for ${rustContract.name}:`, error);
            }
          });

          // Add optimized Solidity contract
          if (optimizedContracts.modifiedSolidity) {
            contractFiles.push({
              id: "optimized-solidity",
              name: `${contractName}_optimized.sol`,
              content: optimizedContracts.modifiedSolidity,
              language: "solidity",
              path: `contracts/${contractName}_optimized.sol`,
              type: "solidity",
              canCompile: true,
              canDeploy: true,
              dependencies: optimizedContracts.rustContracts.map(
                (rustContract) =>
                  `rust-${rustContract.functionName || rustContract.name}`
              ),
              isOptimized: true,
            });

            console.log("✅ [CodeEditor] Added optimized Solidity contract");
          } else {
            console.warn("⚠️ [CodeEditor] No optimized Solidity content found");
          }

          // Set gas comparison data
          setGasComparison({
            original: originalContract.gasEstimation,
            estimated: {
              totalSavings: optimizedContracts.totalEstimatedSavings,
              aiGenerated: optimizedContracts.aiGenerated,
              rustContracts: optimizedContracts.rustContracts.map((r) => ({
                name: r.name,
                estimatedGasSavings: r.estimatedGasSavings,
                optimizations: r.optimizations,
              })),
            },
          });
        }

        // Continue with the rest of your file loading logic...
        // Load contract files into store
        console.log("📁 [CodeEditor] Loading contract files:", contractFiles);
        loadContractFiles({
          files: contractFiles,
          contractName,
          highGasFunctions,
        });

        // Force reload the file tree after loading files
        console.log("🔄 [CodeEditor] Reloading file tree...");
        
        setTimeout(() => {
          setLoadingStates(prev => ({ 
            ...prev, 
            treeReload: Date.now(),
            filesLoaded: true 
          }));
          
          console.log("✅ [CodeEditor] File tree reload triggered");
        }, 150);

        console.log("🎯 [CodeEditor] Files loaded successfully");
      } else {
        console.warn("⚠️ [CodeEditor] No original contract data found");
      }
    }, [
      originalContract,
      optimizedContracts,
      contractName,
      loadContractFiles,
      setGasComparison,
      highGasFunctions,
    ]);

  // Initialize wallet
  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error initializing wallet:", error);
        }
      }
    };
    initWallet();
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

  const handleCompile = async (fileId) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    setLoadingStates((prev) => ({ ...prev, [`compile-${fileId}`]: true }));

    try {
      if (file.type === "solidity") {
        const result = await compileContract(
          file.content,
          file.name.replace(".sol", "")
        );
        setCompilationResults((prev) => ({
          ...prev,
          [fileId]: result,
        }));
      } else if (file.type === "rust") {
        const result = await RustCompilationService.compileRustContract(
          file.content,
          file.name.replace(".rs", "")
        );
        setCompilationResults((prev) => ({
          ...prev,
          [fileId]: result,
        }));
      }
    } catch (error) {
      setCompilationResults((prev) => ({
        ...prev,
        [fileId]: { success: false, error: error.message },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`compile-${fileId}`]: false }));
    }
  };

  const handleDeploy = async (fileId) => {
    const file = files.find((f) => f.id === fileId);
    const compilation = compilationResults[fileId];

    if (!file || !compilation?.success || !walletAddress) {
      alert("File not compiled or wallet not connected");
      return;
    }

    // Check dependencies (Rust contracts must be deployed before Solidity)
    if (file.dependencies && file.dependencies.length > 0) {
      const undeployedDeps = file.dependencies.filter(
        (depId) => !deployedContracts[depId]?.address
      );
      if (undeployedDeps.length > 0) {
        const depNames = undeployedDeps
          .map((depId) => {
            const depFile = files.find((f) => f.id === depId);
            return depFile?.name || depId;
          })
          .join(", ");
        alert(`Please deploy Rust dependencies first: ${depNames}`);
        return;
      }
    }

    setLoadingStates((prev) => ({ ...prev, [`deploy-${fileId}`]: true }));

    try {
      let result;
      if (file.type === "solidity") {
        // For optimized Solidity contracts, update with Rust contract addresses first
        if (file.isOptimized && file.dependencies?.length > 0) {
          let updatedContent = file.content;

          // Update contract addresses in the Solidity code
          file.dependencies.forEach((rustFileId) => {
            const rustDeployment = deployedContracts[rustFileId];
            if (rustDeployment?.address) {
              updatedContent = updatedContent.replace(
                "address(0x0000000000000000000000000000000000000000)",
                rustDeployment.address
              );
            }
          });

          // Recompile with updated addresses
          const recompileResult = await compileContract(
            updatedContent,
            file.name.replace(".sol", "")
          );
          if (!recompileResult.success) {
            throw new Error("Failed to recompile with Rust contract addresses");
          }

          result = await deployContract(
            recompileResult.abi,
            recompileResult.bytecode,
            walletAddress,
            file.name.replace(".sol", "")
          );
        } else {
          result = await deployContract(
            compilation.abi,
            compilation.bytecode,
            walletAddress,
            file.name.replace(".sol", "")
          );
        }
      } else if (file.type === "rust") {
        result = await RustCompilationService.deployRustContract(
          compilation.bytecode,
          walletAddress,
          file.name.replace(".rs", "")
        );
      }

      if (result.success) {
        // Store deployment info
        setDeployedContract(
          fileId,
          result.contractAddress,
          result.transactionHash
        );
        setDeploymentResults((prev) => ({
          ...prev,
          [fileId]: result,
        }));

        // If this is a Rust contract, calculate actual gas savings
        if (file.type === "rust") {
          await calculateActualGasSavings(file, result.contractAddress);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setDeploymentResults((prev) => ({
        ...prev,
        [fileId]: { success: false, error: error.message },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`deploy-${fileId}`]: false }));
    }
  };

  const calculateActualGasSavings = async (rustFile, contractAddress) => {
    try {
      // Get original gas consumption for this function
      const functionName =
        rustFile.functionName || rustFile.name.replace("_optimized.rs", "");
      const originalGas =
        gasComparison?.original?.functionGasEstimates?.[functionName]
          ?.estimated;

      console.log(`📊 Calculating gas savings for ${functionName}:`, {
        originalGas,
        contractAddress,
        rustFile: rustFile.name,
      });

      // Estimate gas for the deployed Rust contract with original gas context
      const gasResult = await RustCompilationService.estimateRustGas(
        contractAddress,
        functionName,
        [],
        originalGas
      );

      if (gasResult.success) {
        console.log(`✅ Gas calculation completed:`, gasResult);

        // Update gas comparison with actual data
        setGasComparison((prev) => ({
          ...prev,
          actual: {
            ...prev.actual,
            [rustFile.id]: {
              functionName,
              originalGas: gasResult.originalGas,
              deployedGas: gasResult.gasEstimate,
              actualSavingsPercentage: gasResult.savingsPercentage,
              estimatedSavings: rustFile.estimatedGasSavings,
              contractAddress,
              message: gasResult.message,
            },
          },
        }));
      }
    } catch (error) {
      console.error("Failed to calculate actual gas savings:", error);
    }
  };

  const handleDownload = (file) => {
    const element = document.createElement("a");
    const blob = new Blob([file.content], { type: "text/plain" });
    element.href = URL.createObjectURL(blob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Get active file for operations
  const activeFile = getActiveFile();
  const activeFileCompilation = activeFile
    ? compilationResults[activeFile.id]
    : null;
  const activeFileDeployment = activeFile
    ? deploymentResults[activeFile.id]
    : null;

  // Add these state variables at the top of your component
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editorStats, setEditorStats] = useState({
    totalLines: 0,
    totalCharacters: 0,
    filesCount: 0,
    compiledFiles: 0,
    deployedFiles: 0,
  });

  // Add useEffect to update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Add useEffect to calculate editor statistics
  useEffect(() => {
    const stats = {
      totalLines: files.reduce((total, file) => {
        return total + (file.content?.split("\n").length || 0);
      }, 0),
      totalCharacters: files.reduce((total, file) => {
        return total + (file.content?.length || 0);
      }, 0),
      filesCount: files.length,
      compiledFiles: Object.keys(compilationResults).filter(
        (fileId) => compilationResults[fileId]?.success
      ).length,
      deployedFiles: Object.keys(deploymentResults).filter(
        (fileId) => deploymentResults[fileId]?.success
      ).length,
    };
    setEditorStats(stats);
  }, [files, compilationResults, deploymentResults]);

  // Calculate gas savings summary
  const getGasSavingsSummary = () => {
    if (!gasComparison?.actual) return null;

    const actualSavings = Object.values(gasComparison.actual);
    const avgSavings =
      actualSavings.reduce(
        (sum, data) => sum + (data.actualSavingsPercentage || 0),
        0
      ) / actualSavings.length;

    return {
      avgSavings: avgSavings.toFixed(1),
      functionsOptimized: actualSavings.length,
    };
  };

  return (
    <div className=" h-screen overflow-y-hidden w-full  text-white bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-600/50 bg-gray-200/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <img src="logo.svg" alt="Logo" className="h-5" />
            <p className="font-bold">Polkaflow</p>
            <Badge variant="outline">Editor</Badge>
            {contractName && (
              <div>
                <span className="text-lg font-semibold">{contractName}</span>
                {highGasFunctions?.length > 0 && (
                  <span className="text-sm text-orange-400 ml-2">
                    ({highGasFunctions.length} high-gas functions optimized)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Wallet Connection */}
            {!walletAddress ? (
              <Button onClick={handleConnectWallet} size="sm">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="text-sm text-green-400 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </div>
            )}

            {/* File-specific actions */}
            {activeFile && (
              <>
                {activeFile.canCompile && (
                  <Button
                    size="sm"
                    onClick={() => handleCompile(activeFile.id)}
                    disabled={loadingStates[`compile-${activeFile.id}`]}
                    variant="outline"
                  >
                    {loadingStates[`compile-${activeFile.id}`] ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Code className="w-4 h-4 mr-2" />
                    )}
                    Compile
                  </Button>
                )}

                {activeFile.canDeploy && (
                  <Button
                    size="sm"
                    onClick={() => handleDeploy(activeFile.id)}
                    disabled={
                      loadingStates[`deploy-${activeFile.id}`] ||
                      !activeFileCompilation?.success
                    }
                  >
                    {loadingStates[`deploy-${activeFile.id}`] ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4 mr-2" />
                    )}
                    Deploy
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(activeFile.content)}
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(activeFile)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="min-w-[300px] max-w-[300px] flex-1 mt-8 px-4 pr-6 relative flex flex-col">
          <FileTree />

          {/* Status Panel */}
          {activeFile && (
            <div className="flex flex-col gap-2 z-10 bg-none justify-self-end pb-4 max-h-[400px] overflow-y-auto">
              {/* Compilation Status */}
              {activeFileCompilation && (
                <div
                  className={`p-3 rounded text-xs ${
                    activeFileCompilation.success
                      ? "bg-green-900/20 text-green-400 border border-green-500/20"
                      : "bg-red-900/20 text-red-400 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {activeFileCompilation.success ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span className="font-medium">
                      {activeFileCompilation.success
                        ? "Compiled"
                        : "Compilation Failed"}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">
                    {activeFileCompilation.success
                      ? activeFileCompilation.message ||
                        "Compilation successful"
                      : activeFileCompilation.error}
                  </p>
                </div>
              )}

              {/* Deployment Status */}
              {activeFileDeployment && (
                <div
                  className={`p-3 rounded text-xs ${
                    activeFileDeployment.success
                      ? "bg-blue-900/20 text-blue-400 border border-blue-500/20"
                      : "bg-red-900/20 text-red-400 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {activeFileDeployment.success ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span className="font-medium">
                      {activeFileDeployment.success
                        ? "Deployed"
                        : "Deployment Failed"}
                    </span>
                  </div>
                  {activeFileDeployment.success ? (
                    <div className="text-xs space-y-1">
                      <p>Contract: {activeFileDeployment.contractAddress}</p>
                      <p>Tx: {activeFileDeployment.transactionHash}</p>
                    </div>
                  ) : (
                    <p className="text-xs opacity-80">
                      {activeFileDeployment.error}
                    </p>
                  )}
                </div>
              )}

              {/* Gas Optimization Info */}
              {activeFile.type === "rust" && activeFile.estimatedGasSavings && (
                <div className="p-3 bg-orange-900/20 text-orange-400 border border-orange-500/20 rounded text-xs">
                  <div className="font-medium mb-1">🚀 AI Optimization</div>
                  <div className="space-y-1">
                    <p>
                      Estimated Gas Savings:{" "}
                      <span className="font-bold text-green-400">
                        {activeFile.estimatedGasSavings}
                      </span>
                    </p>
                    <p className="text-xs opacity-80">
                      {activeFile.optimizations}
                    </p>
                  </div>
                </div>
              )}

              {/* Gas Comparison Panel */}
              {gasComparison && (
                <div className="p-3 bg-purple-900/20 text-purple-400 border border-purple-500/20 rounded text-xs">
                  <div className="font-medium mb-2">⚡ Gas Analysis</div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400">AI Generated:</span>
                      <span
                        className={`ml-2 ${
                          gasComparison.estimated?.aiGenerated
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {gasComparison.estimated?.aiGenerated
                          ? "✓ Gemini AI"
                          : "⚠ Fallback"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg. Savings:</span>
                      <span className="ml-2 font-bold text-green-400">
                        {gasComparison.estimated?.totalSavings || 0}%
                      </span>
                    </div>
                    {gasComparison.actual &&
                      Object.keys(gasComparison.actual).length > 0 && (
                        <div className="pt-2 border-t border-purple-500/20">
                          <div className="text-gray-300 font-medium mb-1">
                            🎯 Deployed Results:
                          </div>
                          {Object.entries(gasComparison.actual).map(
                            ([fileId, data]) => (
                              <div
                                key={fileId}
                                className="text-xs space-y-1 mb-2"
                              >
                                <div className="font-medium text-blue-300">
                                  {data.functionName}
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    Original:
                                  </span>
                                  <span className="text-red-300">
                                    {data.originalGas?.toLocaleString()} gas
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    Optimized:
                                  </span>
                                  <span className="text-green-300">
                                    {data.deployedGas?.toLocaleString()} gas
                                  </span>
                                </div>
                                <div className="flex justify-between font-bold">
                                  <span className="text-gray-400">
                                    Actual Savings:
                                  </span>
                                  <span className="text-green-400">
                                    {data.actualSavingsPercentage}%
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 italic">
                                  vs {data.estimatedSavings} estimated
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="p-3 bg-gray-800/50 rounded text-xs">
                <div className="font-medium mb-1">{activeFile.name}</div>
                <div className="text-gray-400">Type: {activeFile.type}</div>
                {activeFile.dependencies?.length > 0 && (
                  <div className="text-gray-400 mt-1">
                    Dependencies: {activeFile.dependencies.length}
                  </div>
                )}
                {activeFile.isOptimized && (
                  <div className="text-orange-400 mt-1">
                    🔄 Hybrid Solidity+Rust
                  </div>
                )}
              </div>
            </div>
          )}
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

      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-pink-500/50 to-purple-500/50 text-white h-8 w-full flex items-center justify-between px-4 text-xs font-medium border-t">
        <div className="flex items-center space-x-6">
          {/* Git-like status */}
          <span className="bg-black/50 px-2 py-0.5 rounded flex items-center gap-1">
            Polkaflow Editor
          </span>

          {/* Dynamic file statistics */}
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {editorStats.filesCount} files
            </span>

            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              {editorStats.totalLines.toLocaleString()} lines
            </span>

            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              {editorStats.compiledFiles} compiled
            </span>

            <span className="flex items-center gap-1">
              <Rocket className="w-3 h-3 text-blue-400" />
              {editorStats.deployedFiles} deployed
            </span>
          </div>

          {/* Gas optimization summary */}
          {getGasSavingsSummary() && (
            <span className="flex items-center gap-1 text-green-400">
              ⚡ {getGasSavingsSummary().avgSavings}% avg savings (
              {getGasSavingsSummary().functionsOptimized} functions)
            </span>
          )}

          {/* Compilation status */}
          <span className="flex items-center gap-1">
            {Object.values(compilationResults).some(
              (result) => !result.success
            ) ? (
              <>
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400">
                  {
                    Object.values(compilationResults).filter((r) => !r.success)
                      .length
                  }{" "}
                  errors
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-green-400">✓ All good</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Active file info */}
          {activeFile && (
            <div className="flex items-center space-x-3">
              <span className="text-gray-300">{activeFile.name}</span>
              <span className="text-gray-400">
                Ln {activeFile.content?.split("\n").length || 1}, Col{" "}
                {activeFile.content?.length || 1}
              </span>
              <span className="text-gray-400 capitalize">
                {activeFile.language || activeFile.type}
              </span>
            </div>
          )}
          {/* Memory usage (simulated) */}
          <span className="text-gray-400">
            Memory: {(editorStats.totalCharacters / 1024).toFixed(1)}KB
          </span>
          {/* Session duration */}
          <span className="text-gray-400">
            Session:{" "}
            {Math.floor(
              (Date.now() - (window.sessionStartTime || Date.now())) / 60000
            )}
            m
          </span>
          {/* Encoding and branding */}
          <span className="text-gray-400">UTF-8</span>
        </div>
      </div>
    </div>
  );
}
