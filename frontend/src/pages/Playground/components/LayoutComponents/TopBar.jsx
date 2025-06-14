import React, { useState, useEffect } from "react";
import { solidityCompiler, getCompilerVersions } from "@agnostico/browser-solidity-compiler"; 
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  Check,
  Code,
  Copy,
  Download,
  Edit,
  FileText,
  Loader2,
  Play,
  Rocket,
  Save,
  Sparkle,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useBoardStore from "../../../../store/store";
import { generateSolidityFromFlowchart } from "../../../../utils/solidityGenerator";
import { compileContract, deployContract } from "../../../../utils/contractService";
import { generateSolidityFromFlowchartAI } from "../../../../utils/aiService";
import { estimateContractGas } from "./gasEstimation";

export default function TopBar() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isGeneratingSolidity, setIsGeneratingSolidity] = useState(false);
  const [generatedSolidity, setGeneratedSolidity] = useState("");
  const [showSolidityModal, setShowSolidityModal] = useState(false);
  const [showGenerationChoice, setShowGenerationChoice] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [contractName, setContractName] = useState("");
  const [compilationResult, setCompilationResult] = useState({ abi: null, bytecode: null });
  const [deploymentResult, setDeploymentResult] = useState({ address: null, txHash: null });
  const [operationState, setOperationState] = useState({ loading: false, error: null, message: null });
  const [gasEstimation, setGasEstimation] = useState({
    deploymentGas: null,
    functionGasEstimates: {},
    totalEstimatedCost: null,
    error: null
  });
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
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (newAccounts) => {
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
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
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
    if (!currentProject) return;

    console.log("🔨 [TopBar] Starting Solidity generation");
    setIsGeneratingSolidity(true);
    // Reset states
    setCompilationResult({ abi: null, bytecode: null });
    setDeploymentResult({ address: null, txHash: null });
    setOperationState({ loading: false, error: null, message: null });
    const name = currentProject.name.replace(/\s+/g, '') || "MyContract";
    setContractName(name);

    try {
      const nodes = getNodes();
      const edges = getEdges();
      if (nodes.length === 0) {
        alert("Cannot generate code from an empty flowchart.");
        setIsGeneratingSolidity(false);
        return;
      }
      
      let solidityCode = "";
      if (type === "our-algorithm") {
        solidityCode = generateSolidityFromFlowchart(nodes, edges, name);
      } else {
        const result = await generateSolidityFromFlowchartAI(nodes, edges, name);
        if (result.success) {
          solidityCode = result.contractCode;
        } else {
          solidityCode = `// AI generation failed: ${result.error}`;
        }
      }
      setGeneratedSolidity(solidityCode);
      
      // Perform gas estimation
      console.log("⛽ [TopBar] Starting gas estimation");
      try {
        const gasEstimation = await estimateContractGas(solidityCode, name);
        setGasEstimation(gasEstimation);
        console.log("⛽ [TopBar] Gas estimation completed:", gasEstimation);
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        setGasEstimation({
          deploymentGas: null,
          functionGasEstimates: {},
          error: gasError.message || "Gas estimation failed"
        });
      }
      
      setShowSolidityModal(true);
    } catch (error) {
      console.error("Solidity generation failed:", error);
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
      setOperationState({ loading: false, error: null, message: "Compilation successful!" });
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
    const result = await deployContract(compilationResult.abi, compilationResult.bytecode, walletAddress);
    if (result.success) {
      setDeploymentResult({ address: result.contractAddress, txHash: result.transactionHash });
      setOperationState({ loading: false, error: null, message: `Deployment successful!` });
      updateProject(currentProject.id, { ...currentProject, status: "deployed", deployedAt: new Date().toISOString() });
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

  const copySolidityToClipboard = () => navigator.clipboard.writeText(generatedSolidity);

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
      setEditForm({ name: currentProject.name, description: currentProject.description || "" });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (currentProject && editForm.name.trim()) {
      updateProject(currentProject.id, { ...currentProject, ...editForm });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => setIsEditing(false);
  
  const handleSave = () => {
    if (currentProject) {
      updateProject(currentProject.id, {
        ...currentProject,
        nodes: getNodes(),
        edges: getEdges(),
        updatedAt: new Date().toISOString(),
      });
      console.log("Project saved successfully!");
    }
  };
  
  const takeScreenshotAndExit = async () => {
    if (!currentProject) {
      navigate("/dashboard");
      return;
    }
    setIsCapturingScreenshot(true);
    try {
      const flowContainer = document.querySelector(".react-flow") || document.body;
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
           <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <img src="/logo.svg" alt="Logo" className="h-5"/>
          <p className="font-bold">Polkaflow</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[20px] mb-4 px-4 mt-2 flex justify-between w-full items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={takeScreenshotAndExit} disabled={isCapturingScreenshot}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src="/logo.svg" alt="Logo" className="h-5"/>
          <p className="font-bold">Polkaflow</p>
          <div className="w-84" />
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} onKeyDown={handleKeyDown} className="h-8"/>
              <Button onClick={handleSaveEdit} size="sm"><Check className="h-4 w-4"/></Button>
              <Button onClick={handleCancelEdit} size="sm" variant="ghost"><X className="h-4 w-4"/></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="font-semibold text-lg">{currentProject.name}</h1>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={handleStartEdit}>
                <Edit size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4" />Save</Button>
          
          <div className="relative">
            {!walletAddress ? (
              <Button onClick={handleConnectWallet} size="sm">Connect Wallet</Button>
            ) : (
              <>
                <Button onClick={() => setShowWalletDetails(!showWalletDetails)} size="icon" variant="outline">
                  <Wallet className="h-5 w-5 text-green-500"/>
                </Button>
                {showWalletDetails && (
                  <div className="absolute top-12 right-0 bg-gray-800 border border-gray-700 rounded-lg p-4 w-72 z-50 text-white shadow-lg">
                    <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
                    <p className="font-mono text-xs break-words mb-4">{walletAddress}</p>
                    <Button variant="destructive" size="sm" className="w-full" onClick={handleDisconnectWallet}>
                        Disconnect
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <Button onClick={handleGenerateClick} disabled={isGeneratingSolidity} size="sm" className="bg-green-600 hover:bg-green-700">
            {isGeneratingSolidity ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </div>
      </div>

      {showGenerationChoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border-gray-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Choose Generation Method</h2>
            <p className="text-gray-400 mb-8">Select how to generate Solidity from your flowchart.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleGenerate('ai')} className="p-6 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg">
                <Sparkle className="w-10 h-10 mx-auto mb-3 text-purple-400" /> AI Generator
              </button>
              <button onClick={() => handleGenerate('our-algorithm')} className="p-6 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg">
                <FileText className="w-10 h-10 mx-auto mb-3 text-blue-400" /> Flowchart Logic
              </button>
            </div>
            <Button onClick={() => setShowGenerationChoice(false)} variant="ghost" className="mt-8">Cancel</Button>
          </div>
        </div>
      )}

      {showSolidityModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur">
          <div className="bg-gray-800 rounded-lg p-6 max-w-6xl max-h-[90vh] w-full flex flex-col text-white min-h-[70vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generated Solidity Contract: <span className="font-mono text-purple-400">{contractName}.sol</span></h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSolidityModal(false)}><X/></Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 flex-1 overflow-auto min-w-[70vh]">
              {/* Code Editor Column */}
              <div className="flex flex-col h-full">
                <label className="text-sm text-gray-400 mb-2">Solidity Code</label>
                <div className="flex-1 bg-gray-900 rounded-md font-mono text-sm">
                  <textarea
                    value={generatedSolidity}
                    onChange={(e) => setGeneratedSolidity(e.target.value)}
                    className="p-4 w-full h-full bg-transparent resize-none focus:outline-none text-white font-mono min-h-[70vh]"
                    spellCheck="false"
                  />
                </div>
              </div>

        

              {/* Compilation & Deployment Column */}
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Function Gas Estimates */}
              {gasEstimation?.functionGasEstimates && Object.keys(gasEstimation.functionGasEstimates).length > 0 && (
                <div className="mb-4 p-3 bg-purple-700/20 border border-purple-500 rounded-md font-mono text-sm max-h-[50vh] overflow-y-auto">
                  <div className="text-sm mb-2 text-purple-300">🔧 Function Gas Estimates:</div>
                  <div className="space-y-1">
                    {Object.entries(gasEstimation.functionGasEstimates).map(([funcName, gasData]) => (
                      <div key={funcName} className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">{funcName}():</span>
                        <span className="text-white font-bold">
                          {gasData.estimated > 100000 ? (
                            <span className="text-red-400">{gasData.estimated} ⚠️ recommend using rust as gas is high </span>
                          ) : (
                            <span className="text-green-400">{gasData.estimated} gas</span>
                          )} 
                        </span>
                        
                      </div>
                    ))}
                  </div>
                </div>
              )}
                {/* Compilation Output */}
                {compilationResult.abi && (
                  <div className="mb-4">
                    <h4 className="text-md font-semibold mb-2 text-green-400">Compilation Output</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">ABI</label>
                        <textarea
                          readOnly
                          value={JSON.stringify(compilationResult.abi, null, 2)}
                          className="w-full h-32 p-2 bg-gray-900 rounded-md font-mono text-xs resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Bytecode</label>
                        <textarea
                          readOnly
                          value={compilationResult.bytecode}
                          className="w-full h-32 p-2 bg-gray-900 rounded-md font-mono text-xs resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {deploymentResult.address && (
                  <div className="mb-4">
                    <h4 className="text-md font-semibold mb-2 text-blue-400">Deployment Details</h4>
                    <div className="space-y-2 text-sm bg-gray-900 p-4 rounded-md">
                      <p><strong className="text-gray-400">Deployed By:</strong> <span className="font-mono text-xs">{walletAddress}</span></p>
                      <p><strong className="text-gray-400">Contract Address:</strong> <span className="font-mono text-xs">{deploymentResult.address}</span></p>
                      <p><strong className="text-gray-400">Transaction Hash:</strong> <span className="font-mono text-xs">{deploymentResult.txHash}</span></p>
                      <p>
                        <strong className="text-gray-400">Testnet Explorer:</strong> 
                        <a href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${deploymentResult.txHash}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline ml-2">
                          View on Blockscout
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto border-t border-gray-700 pt-4">
              <div className="flex gap-2">
                <Button onClick={handleCompile} disabled={operationState.loading || !generatedSolidity}>
                  {operationState.loading && operationState.message?.startsWith('Compiling') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4"/>}
                  Compile
                </Button>
                <Button onClick={handleDeployContract} disabled={!compilationResult.bytecode || operationState.loading || !walletAddress}>
                  {operationState.loading && operationState.message?.startsWith('Deploying') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4"/>}
                  Deploy
                </Button>
              </div>
              <div className="text-sm text-gray-400 text-center flex-1 mx-4">
                {operationState.message && !operationState.error && <span className="text-green-400">{operationState.message}</span>}
                {operationState.error && <span className="text-red-400 font-mono text-xs">{operationState.error}</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copySolidityToClipboard}><Copy className="w-4 h-4 mr-2" />Copy</Button>
                <Button variant="outline" onClick={downloadSolidityCode}><Download className="w-4 h-4 mr-2" />Download</Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

