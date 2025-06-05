import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Rocket
} from 'lucide-react';
import { generateSolidityContract, SOLIDITY_SAMPLE_PROMPTS } from '../../utils/aiService';

export default function SolidityGenerator() {
  // AI Generation State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

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

  // Compilation & Deployment State
  const [bytecode, setBytecode] = useState('');
  const [abi, setAbi] = useState([]);
  const [deployed, setDeployed] = useState({});
  const [loading, setLoading] = useState({ compile: false, deploy: false });
  const [compileError, setCompileError] = useState('');

  // AI Generation Handler
  const handleGenerateContract = async () => {
    if (!prompt.trim()) return;

    console.log('🔨 [SolidityGen] Starting generation with prompt:', prompt);
    setIsGenerating(true);
    setGenerationError('');

    try {
      const result = await generateSolidityContract(prompt.trim());

      if (result.success) {
        console.log('✅ [SolidityGen] Contract generated successfully');
        setCode(result.contractCode);
        setPrompt(''); // Clear prompt after successful generation
      } else {
        console.warn('⚠️ [SolidityGen] Generation failed, using fallback');
        setGenerationError(result.error);
        setCode(result.contractCode); // Still use fallback code
      }
    } catch (error) {
      console.error('❌ [SolidityGen] Generation error:', error);
      setGenerationError('Failed to generate contract. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample Prompt Handler
  const handleSamplePrompt = (samplePrompt) => {
    console.log('💡 [SolidityGen] Sample prompt selected:', samplePrompt);
    setPrompt(samplePrompt);
  };

  // Compilation Handler
  const handleCompile = async () => {
    console.log('⚙️ [SolidityGen] Starting compilation');
    setLoading({ ...loading, compile: true });
    setCompileError('');
    
    // Reset previous compilation results
    setBytecode('');
    setAbi([]);
    
    try {
      const res = await fetch('http://localhost:3000/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ [SolidityGen] Compilation successful');
        setBytecode(data.bytecode);
        
        // Ensure ABI is an array
        const compiledAbi = Array.isArray(data.abi) ? data.abi : [];
        setAbi(compiledAbi);
        console.log('📋 [SolidityGen] ABI set:', compiledAbi);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('❌ [SolidityGen] Compilation failed:', err);
      setCompileError(`Compilation failed: ${err.message}`);
      // Reset compilation results on error
      setBytecode('');
      setAbi([]);
    }
    
    setLoading({ ...loading, compile: false });
  };

  // Deployment Handler
  const handleDeploy = async () => {
    console.log('🚀 [SolidityGen] Starting deployment');
    setLoading({ ...loading, deploy: true });
    setCompileError('');
    
    try {
      const res = await fetch('http://localhost:3000/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bytecode, abi })
      });
      
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ [SolidityGen] Deployment successful');
        setDeployed({
          address: data.contractAddress,
          txHash: data.transactionHash
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('❌ [SolidityGen] Deployment failed:', err);
      setCompileError(`Deployment failed: ${err.message}`);
    }
    
    setLoading({ ...loading, deploy: false });
  };

  // Utility Functions
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'contract.sol';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            AI Solidity Contract Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Generate, edit, compile, and deploy smart contracts with AI assistance
          </p>
        </motion.div>

        {/* AI Generation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkle className="text-purple-400" size={24} />
            <h2 className="text-2xl font-semibold">Generate Contract</h2>
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the smart contract you want to generate..."
              disabled={isGenerating}
              className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
            />
          </div>

          {/* Sample Prompts */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Ideas:</h3>
            <div className="flex flex-wrap gap-2">
              {SOLIDITY_SAMPLE_PROMPTS.slice(0, 4).map((samplePrompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSamplePrompt(samplePrompt)}
                  disabled={isGenerating}
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm text-purple-300 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {samplePrompt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleGenerateContract}
              disabled={!prompt.trim() || isGenerating}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                !prompt.trim() || isGenerating
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25'
              }`}
              whileHover={!isGenerating ? { scale: 1.02 } : {}}
              whileTap={!isGenerating ? { scale: 0.98 } : {}}
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Sparkle size={20} />
              )}
              {isGenerating ? 'Generating...' : 'Generate Contract'}
            </motion.button>

            {generationError && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm"
              >
                <AlertCircle size={16} />
                <span>{generationError}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Code Editor Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileCode className="text-blue-400" size={24} />
              <h2 className="text-2xl font-semibold">Contract Editor</h2>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => copyToClipboard(code)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Copy Code"
              >
                <Copy size={16} />
              </motion.button>
              <motion.button
                onClick={downloadCode}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download Code"
              >
                <Download size={16} />
              </motion.button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 bg-gray-900/80 border border-gray-600 rounded-lg p-4 text-gray-100 font-mono text-sm leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
            spellCheck={false}
          />

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <motion.button
              onClick={handleCompile}
              disabled={loading.compile || !code.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                loading.compile || !code.trim()
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/25'
              }`}
              whileHover={!loading.compile ? { scale: 1.02 } : {}}
              whileTap={!loading.compile ? { scale: 0.98 } : {}}
            >
              {loading.compile ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Settings size={20} />
              )}
              {loading.compile ? 'Compiling...' : 'Compile Contract'}
            </motion.button>

            <motion.button
              onClick={handleDeploy}
              disabled={!bytecode || loading.deploy}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                !bytecode || loading.deploy
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25'
              }`}
              whileHover={!loading.deploy && bytecode ? { scale: 1.02 } : {}}
              whileTap={!loading.deploy && bytecode ? { scale: 0.98 } : {}}
            >
              {loading.deploy ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Rocket size={20} />
              )}
              {loading.deploy ? 'Deploying...' : 'Deploy Contract'}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {compileError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-8"
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
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="text-green-400" size={24} />
                <h2 className="text-2xl font-semibold">Compilation Results</h2>
              </div>

              <div className="grid gap-6">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">Bytecode</h3>
                  <div className="bg-gray-900/80 border border-gray-600 rounded-lg p-4">
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {bytecode.slice(0, 200)}... [truncated]
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">Contract ABI</h3>
                  <div className="bg-gray-900/80 border border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {Array.isArray(abi) && abi.length > 0 ? (
                      abi.map((item, index) => (
                        <div key={index} className="mb-4 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <div className="text-sm">
                            <div><span className="text-blue-400 font-medium">Name:</span> {item.name || '(constructor)'}</div>
                            <div><span className="text-purple-400 font-medium">Type:</span> {item.type}</div>
                            <div><span className="text-green-400 font-medium">State Mutability:</span> {item.stateMutability}</div>
                            {item.inputs && item.inputs.length > 0 && (
                              <div><span className="text-yellow-400 font-medium">Inputs:</span>
                                <ul className="ml-4 mt-1">
                                  {item.inputs.map((input, i) => (
                                    <li key={i} className="text-gray-300">
                                      {input.name}: <span className="text-cyan-400">{input.type}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.outputs && item.outputs.length > 0 && (
                              <div><span className="text-orange-400 font-medium">Outputs:</span>
                                <ul className="ml-4 mt-1">
                                  {item.outputs.map((output, i) => (
                                    <li key={i} className="text-gray-300">
                                      {output.name || '(unnamed)'}: <span className="text-cyan-400">{output.type}</span>
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
                        {Array.isArray(abi) && abi.length === 0 ? 'No ABI available' : 'Invalid ABI format'}
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
              className="bg-green-900/20 border border-green-500/50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="text-green-400" size={24} />
                <h2 className="text-2xl font-semibold text-green-400">Deployment Successful!</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-300 min-w-fit">Contract Address:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-green-400 bg-gray-800/50 px-3 py-1 rounded border border-gray-600 flex-1">
                      {deployed.address}
                    </span>
                    <motion.button
                      onClick={() => copyToClipboard(deployed.address)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Copy size={16} />
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-300 min-w-fit">Transaction Hash:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-blue-400 bg-gray-800/50 px-3 py-1 rounded border border-gray-600 flex-1">
                      {deployed.txHash}
                    </span>
                    <motion.button
                      onClick={() => copyToClipboard(deployed.txHash)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
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
  );
} 