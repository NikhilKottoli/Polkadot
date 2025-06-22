import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Sparkle,
  Code,
  Play,
  Upload,
  Copy,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileCode,
  Settings,
  Rocket,
  ArrowLeft,
} from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  generateSolidityContract,
  SOLIDITY_SAMPLE_PROMPTS,
} from "../../utils/aiService";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import LoadingAnimation from "../../components/LoadingAnimation";

export default function SolidityGenerator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  // Back navigation handler
  const handleGoBack = () => {
    if (location.key === "default") {
      navigate("/", { replace: true });
    } else {
      navigate(-1);
    }
  };

  // AI Generation State
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Code Editor State
  const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title MyContract
 * @dev AI-generated smart contract
 */
contract MyContract {
    // Contract code will be generated here
}`);

  const [isCodeLoaded, setIsCodeLoaded] = useState(false);

  // Load code from local storage on component mount
  useEffect(() => {
    if (projectId) {
      const savedCode = localStorage.getItem(`project_${projectId}_code`);
      if (savedCode) {
        setCode(savedCode);
        setIsCodeLoaded(true);
      }
    }
  }, [projectId]);

  // Save code to local storage whenever it changes
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`project_${projectId}_code`, code);
    }
  }, [code, projectId]);

  // Scroll synchronization state
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });

  // Compilation & Deployment State
  const [bytecode, setBytecode] = useState("");
  const [abi, setAbi] = useState([]);
  const [deployed, setDeployed] = useState({});
  const [loading, setLoading] = useState({ compile: false, deploy: false });
  const [compileError, setCompileError] = useState("");
  const [gasEstimation, setGasEstimation] = useState(null);

  // Scroll synchronization handler
  const handleScroll = (e) => {
    const { scrollTop, scrollLeft } = e.target;
    setScrollPosition({ top: scrollTop, left: scrollLeft });

    // Sync the syntax highlighter scroll
    const syntaxElement = document.querySelector(
      ".syntax-highlighter-container"
    );
    if (syntaxElement) {
      syntaxElement.scrollTop = scrollTop;
      syntaxElement.scrollLeft = scrollLeft;
    }
  };

  // AI Generation Handler
  const handleGenerateContract = async () => {
    if (!prompt.trim()) return;

    console.log("🔨 [SolidityGen] Starting generation with prompt:", prompt);
    setIsGenerating(true);
    setGenerationError("");

    try {
      const result = await generateSolidityContract(prompt.trim());

      if (result.success) {
        console.log("✅ [SolidityGen] Contract generated successfully");
        setCode(result.contractCode);
        setPrompt("");

        // Estimate gas after generating code
        const gasResult = randomInt(10000, 50000);
        if (gasResult.success) {
          setGasEstimation(gasResult.estimation);
        } else {
          console.warn("⚠️ [GasEst] Gas estimation failed:", gasResult.error);
        }

      } else {
        console.warn("⚠️ [SolidityGen] Generation failed, using fallback");
        setGenerationError(result.error);
        setCode(result.contractCode);
      }
    } catch (error) {
      console.error("❌ [SolidityGen] Generation error:", error);
      setGenerationError("Failed to generate contract. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsCodeLoaded(true);
    }
  };

  // Sample Prompt Handler
  const handleSamplePrompt = (samplePrompt) => {
    console.log("💡 [SolidityGen] Sample prompt selected:", samplePrompt);
    setPrompt(samplePrompt);
  };

  // Compilation Handler
  const handleCompile = async () => {
    console.log("⚙️ [SolidityGen] Starting compilation");
    setLoading({ ...loading, compile: true });
    setCompileError("");

    setBytecode("");
    setAbi([]);

    try {
      const res = await fetch("http://localhost:3000/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("✅ [SolidityGen] Compilation successful");
        setBytecode(data.bytecode);

        const compiledAbi = Array.isArray(data.abi) ? data.abi : [];
        setAbi(compiledAbi);
        console.log("📋 [SolidityGen] ABI set:", compiledAbi);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("❌ [SolidityGen] Compilation failed:", err);
      setCompileError(`Compilation failed: ${err.message}`);
      setBytecode("");
      setAbi([]);
    }

    setLoading({ ...loading, compile: false });
  };

  // Deployment Handler
  const handleDeploy = async () => {
    console.log("🚀 [SolidityGen] Starting deployment");
    setLoading({ ...loading, deploy: true });
    setCompileError("");

    try {
      // Extract contract name from code
      const contractNameMatch = code.match(/contract\s+(\w+)/);
      const contractName = contractNameMatch ? contractNameMatch[1] : 'GeneratedContract';
      
      const res = await fetch("http://localhost:3000/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bytecode, abi, contractName }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("✅ [SolidityGen] Deployment successful");
        setDeployed({
          address: data.contractAddress,
          txHash: data.transactionHash,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("❌ [SolidityGen] Deployment failed:", err);
      setCompileError(`Deployment failed: ${err.message}`);
    }

    setLoading({ ...loading, deploy: false });
  };

  const handleConvertToRust = async () => {
    if (!gasEstimation || gasEstimation.highGasFunctions.length === 0) {
      return;
    }

    setLoading({ ...loading, compile: true });
    const deployedRustContracts = [];

    try {
      for (const func of gasEstimation.highGasFunctions) {
        // 1. Generate Rust code
        const rustResult = "";
        if (!rustResult.success) {
          throw new Error(`Failed to generate Rust code for ${func.name}`);
        }

        // 2. Compile Rust code
        const compileResult = await fetch("http://localhost:3000/api/compile-rust", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: rustResult.rustCode }),
        }).then(res => res.json());

        if (!compileResult.success) {
          throw new Error(`Failed to compile Rust code for ${func.name}`);
        }

        // 3. Deploy Rust code
        const deployResult = await fetch("http://localhost:3000/api/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bytecode: compileResult.bytecode, abi: compileResult.abi, contractName: func.name }),
        }).then(res => res.json());

        if (!deployResult.success) {
          throw new Error(`Failed to deploy Rust code for ${func.name}`);
        }

        deployedRustContracts.push({
          name: func.name,
          address: deployResult.contractAddress,
          functionSignature: func.signature,
        });
      }

      // 4. Generate Solidity wrapper
      const contractNameMatch = code.match(/contract\s+(\w+)/);
      const wrapperResult = "";
      
      if (wrapperResult.success) {
        setCode(wrapperResult.contractCode);
        setGasEstimation(null); // Clear gas estimation for the new contract
      } else {
        throw new Error('Failed to generate Solidity wrapper contract');
      }

    } catch (err) {
      console.error("❌ [RustConv] Rust conversion failed:", err);
      setCompileError(`Rust conversion failed: ${err.message}`);
    } finally {
      setLoading({ ...loading, compile: false });
    }
  };

  // Utility Functions
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "contract.sol";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-gray-100 w-full p-0">
      <div
        className="container w-full  flex gap-4 justify-between  m-0 flex-1 min-w-full"
        style={{ height: "100%" }}
      >
        <div className="flex-1 px-8">
          <div className="mt-20">
            {/* Back Button */}
            <motion.button
              onClick={handleGoBack}
              className="flex items-center gap-2 mb-6 px-4 py-2 h-12 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full transition-colors ml-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </motion.button>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10  mb-20 ml-8"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                AI Solidity Contract Generator
              </h1>
              <p className="text-white/40 text-lg">
                Generate, edit, compile, and deploy smart contracts with AI
                assistance
              </p>
              {isCodeLoaded && (
                <div className="flex gap-4 mt-4">
                  <motion.button
                    onClick={() => {
                      // Logic to view code (already visible)
                    }}
                    className="flex items-center gap-2 px-4 py-2 h-12 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Code size={20} />
                    <span>View Code</span>
                  </motion.button>
                  <motion.button
                    onClick={handleGenerateContract}
                    className="flex items-center gap-2 px-4 py-2 h-12 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkle size={20} />
                    <span>Generate Again</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>

          {/* AI Generation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className=" backdrop-blur-sm rounded-[60px] shadow-xl p-0 mb-8"
          >
            <Card className="p-12 rounded-[30px] mx-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkle className="text-purple-400" size={24} />
                <h2 className="text-2xl font-semibold text-white">
                  AI-Powered Generation
                </h2>
              </div>
              {/* Prompt Input */}
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your smart contract logic here... (e.g., 'An ERC-20 token with a fixed supply')"
                  className="w-full h-28 p-4 bg-[#1a1a1a] border-[#3a3a3a] rounded-xl focus:ring-purple-500"
                />
                <motion.button
                  onClick={handleGenerateContract}
                  disabled={isGenerating}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isGenerating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </motion.button>
              </div>

              {/* Gas Estimation Display */}
              {gasEstimation && (
                <div className="mt-4 p-4 bg-[#1a1a1a] border-[#3a3a3a] rounded-xl">
                  <h3 className="text-lg font-semibold text-white">Gas Estimation</h3>
                  <p>Deployment Cost: {gasEstimation.deploymentCost} gas</p>
                  <p>Average Function Cost: {gasEstimation.averageFunctionCost} gas</p>
                  <ul>
                    {gasEstimation.highGasFunctions.map(func => (
                      <li key={func.name} className="text-yellow-400">
                        High gas function: {func.name} ({func.gas} gas)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rust Conversion Prompt */}
              {gasEstimation && gasEstimation.highGasFunctions.length > 0 && (
                <div className="mt-4 p-4 bg-[#1a1a1a] border-[#3a3a3a] rounded-xl">
                  <h3 className="text-lg font-semibold text-white">Optimize with Rust</h3>
                  <p className="text-gray-400">The following functions are using a lot of gas. Convert them to Rust for better performance.</p>
                  <ul className="my-2">
                    {gasEstimation.highGasFunctions.map(func => (
                      <li key={func.name} className="text-yellow-400">
                        {func.name} ({func.gas} gas)
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    onClick={handleConvertToRust}
                    className="flex items-center gap-2 px-4 py-2 mt-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Rocket size={20} />
                    <span>Convert to Rust</span>
                  </motion.button>
                </div>
              )}

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-2 mt-4">
                {SOLIDITY_SAMPLE_PROMPTS.map((p, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleSamplePrompt(p)}
                    disabled={isGenerating}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-sm text-purple-300 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-scroll space-y-4">
          {/* Loading Animation or Code Editor Section */}
          {isGenerating ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center py-20"
            >
              <LoadingAnimation />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-sm rounded-2xl shadow-xl"
            >
              <Card className="p-12 rounded-[0px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileCode className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-semibold text-white">
                      Contract Editor
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => copyToClipboard(code)}
                      className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Copy Code"
                    >
                      <Copy size={16} />
                    </motion.button>
                    <motion.button
                      onClick={downloadCode}
                      className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Download Code"
                    >
                      <Download size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Fixed Code Editor with Proper Scrolling */}
                <div
                  className="code-editor-wrapper"
                  style={{
                    position: "relative",
                    height: "70vh",
                    border: "1px solid #3a3a3a",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#0f0f0f",
                  }}
                >
                  {/* Syntax Highlighter Container */}
                  <div
                    className="syntax-highlighter-container"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      overflow: "auto",
                      pointerEvents: "none",
                      scrollTop: scrollPosition.top,
                      scrollLeft: scrollPosition.left,
                    }}
                  >
                    <SyntaxHighlighter
                      language="solidity"
                      style={atomOneDark}
                      customStyle={{
                        margin: 0,
                        padding: "16px",
                        backgroundColor: "transparent",
                        minHeight: "100%",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                      }}
                      showLineNumbers={false}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>

                  {/* Editable Textarea */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={handleScroll}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "transparent",
                      color: "transparent",
                      caretColor: "white",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      padding: "16px",
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                      fontSize: "14px",
                      lineHeight: "1.5",
                      overflow: "auto",
                      whiteSpace: "pre",
                      wordWrap: "off",
                      tabSize: 2,
                    }}
                    spellCheck={false}
                    onKeyDown={(e) => {
                      // Handle Tab key for indentation
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const start = e.target.selectionStart;
                        const end = e.target.selectionEnd;
                        const newValue =
                          code.substring(0, start) + "  " + code.substring(end);
                        setCode(newValue);
                        // Set cursor position after the inserted spaces
                        setTimeout(() => {
                          e.target.selectionStart = e.target.selectionEnd =
                            start + 2;
                        }, 0);
                      }
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <motion.button
                    onClick={handleCompile}
                    disabled={loading.compile || !code.trim()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      loading.compile || !code.trim()
                        ? "bg-[#3a3a3a] cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/25"
                    }`}
                    whileHover={!loading.compile ? { scale: 1.02 } : {}}
                    whileTap={!loading.compile ? { scale: 0.98 } : {}}
                  >
                    {loading.compile ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Settings size={20} />
                    )}
                    {loading.compile ? "Compiling..." : "Compile Contract"}
                  </motion.button>

                  <motion.button
                    onClick={handleDeploy}
                    disabled={!bytecode || loading.deploy}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      !bytecode || loading.deploy
                        ? "bg-[#3a3a3a] cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25"
                    }`}
                    whileHover={
                      !loading.deploy && bytecode ? { scale: 1.02 } : {}
                    }
                    whileTap={
                      !loading.deploy && bytecode ? { scale: 0.98 } : {}
                    }
                  >
                    {loading.deploy ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Rocket size={20} />
                    )}
                    {loading.deploy ? "Deploying..." : "Deploy Contract"}
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {compileError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-8"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={20} />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-300 mt-2">{compileError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compilation Results */}
          <AnimatePresence>
            {bytecode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2a2a2a] backdrop-blur-sm rounded-2xl border border-[#3a3a3a] p-6 mb-8 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="text-green-400" size={24} />
                  <h2 className="text-2xl font-semibold text-white">
                    Compilation Results
                  </h2>
                </div>

                <div className="grid gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-3">
                      Bytecode
                    </h3>
                    <div className="bg-[#0f0f0f] border border-[#3a3a3a] rounded-lg p-4">
                      <pre className="text-xs text-gray-300 overflow-x-auto">
                        {bytecode.slice(0, 200)}... [truncated]
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-300 mb-3">
                      Contract ABI
                    </h3>
                    <div className="bg-[#0f0f0f] border border-[#3a3a3a] rounded-lg p-4 max-h-64 overflow-y-auto">
                      {Array.isArray(abi) && abi.length > 0 ? (
                        abi.map((item, index) => (
                          <div
                            key={index}
                            className="mb-4 p-3 bg-[#1f1f1f] rounded border border-[#3a3a3a]"
                          >
                            <div className="text-sm">
                              <div>
                                <span className="text-blue-400 font-medium">
                                  Name:
                                </span>{" "}
                                {item.name || "(constructor)"}
                              </div>
                              <div>
                                <span className="text-purple-400 font-medium">
                                  Type:
                                </span>{" "}
                                {item.type}
                              </div>
                              <div>
                                <span className="text-green-400 font-medium">
                                  State Mutability:
                                </span>{" "}
                                {item.stateMutability}
                              </div>
                              {item.inputs && item.inputs.length > 0 && (
                                <div>
                                  <span className="text-yellow-400 font-medium">
                                    Inputs:
                                  </span>
                                  <ul className="ml-4 mt-1">
                                    {item.inputs.map((input, i) => (
                                      <li key={i} className="text-gray-300">
                                        {input.name}:{" "}
                                        <span className="text-cyan-400">
                                          {input.type}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.outputs && item.outputs.length > 0 && (
                                <div>
                                  <span className="text-orange-400 font-medium">
                                    Outputs:
                                  </span>
                                  <ul className="ml-4 mt-1">
                                    {item.outputs.map((output, i) => (
                                      <li key={i} className="text-gray-300">
                                        {output.name || "(unnamed)"}:{" "}
                                        <span className="text-cyan-400">
                                          {output.type}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm">
                          {Array.isArray(abi) && abi.length === 0
                            ? "No ABI available"
                            : "Invalid ABI format"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deployment Results */}
          <AnimatePresence>
            {deployed.address && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/20 border border-green-500/50 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="text-green-400" size={24} />
                  <h2 className="text-2xl font-semibold text-green-400">
                    Deployment Successful!
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-300 min-w-fit">
                      Contract Address:
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-green-400 bg-[#1f1f1f] px-3 py-1 rounded border border-[#3a3a3a] flex-1">
                        {deployed.address}
                      </span>
                      <motion.button
                        onClick={() => copyToClipboard(deployed.address)}
                        className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Copy size={16} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-300 min-w-fit">
                      Transaction Hash:
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-blue-400 bg-[#1f1f1f] px-3 py-1 rounded border border-[#3a3a3a] flex-1">
                        {deployed.txHash}
                      </span>
                      <motion.button
                        onClick={() => copyToClipboard(deployed.txHash)}
                        className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Copy size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
