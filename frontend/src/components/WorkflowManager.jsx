import React, { useState, useEffect } from 'react';
import { 
  generateStep1SolidityCode, 
  generateStep2RustOptimizations, 
  generateStep3EnhancedSolidity,
  createNewWorkflow,
  getAllWorkflows,
  deleteWorkflow
} from '../utils/aiService.js';
import { estimateContractGasWithRecommendations } from '../pages/Playground/components/LayoutComponents/gasEstimation.jsx';
import { LocalStorageService } from '../services/localStorageService.js';

const WorkflowManager = ({ onWorkflowComplete, initialPrompt = '' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowId, setWorkflowId] = useState(null);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [contractName, setContractName] = useState('MyContract');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Step results
  const [step1Result, setStep1Result] = useState(null);
  const [step1GasAnalysis, setStep1GasAnalysis] = useState(null);
  const [step2Result, setStep2Result] = useState(null);
  const [step3Result, setStep3Result] = useState(null);
  
  // Workflow management
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [showWorkflowHistory, setShowWorkflowHistory] = useState(false);

  useEffect(() => {
    loadSavedWorkflows();
  }, []);

  const loadSavedWorkflows = () => {
    const workflows = Object.values(getAllWorkflows()).sort((a, b) => b.lastModified - a.lastModified);
    setSavedWorkflows(workflows);
  };

  const startNewWorkflow = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your smart contract');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const newWorkflowId = createNewWorkflow(contractName, prompt);
      setWorkflowId(newWorkflowId);
      await executeStep1();
    } catch (error) {
      setError(`Failed to start workflow: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const executeStep1 = async () => {
    console.log('🔥 [WorkflowManager] Executing Step 1: Plain Solidity Generation');
    setIsLoading(true);
    
    try {
      const result = await generateStep1SolidityCode(prompt, workflowId);
      
      if (result.success) {
        setStep1Result(result);
        const gasAnalysis = await estimateContractGasWithRecommendations(result.contractCode, contractName);
        setStep1GasAnalysis(gasAnalysis);
        setCurrentStep(2);
        console.log('✅ [WorkflowManager] Step 1 completed successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(`Step 1 failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const executeStep2 = async () => {
    console.log('🦀 [WorkflowManager] Executing Step 2: Rust Optimization Generation');
    setIsLoading(true);
    
    try {
      const result = await generateStep2RustOptimizations(
        step1Result.contractCode, 
        step1GasAnalysis, 
        workflowId
      );
      
      if (result.success) {
        setStep2Result(result);
        setCurrentStep(3);
        console.log('✅ [WorkflowManager] Step 2 completed successfully');
      } else {
        throw new Error(result.error || 'Step 2 generation failed');
      }
    } catch (error) {
      setError(`Step 2 failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const executeStep3 = async (rustContractAddress) => {
    console.log('⚡ [WorkflowManager] Executing Step 3: Enhanced Solidity Generation');
    setIsLoading(true);
    
    try {
      const result = await generateStep3EnhancedSolidity(
        step1Result.contractCode,
        step2Result.rustContracts,
        rustContractAddress,
        workflowId
      );
      
      if (result.success) {
        setStep3Result(result);
        console.log('✅ [WorkflowManager] Step 3 completed successfully');
        
        if (onWorkflowComplete) {
          onWorkflowComplete({
            workflowId,
            step1: step1Result,
            step2: step2Result,
            step3: result,
            gasAnalysis: step1GasAnalysis
          });
        }
      } else {
        throw new Error(result.error || 'Step 3 generation failed');
      }
    } catch (error) {
      setError(`Step 3 failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateRustDeployment = () => {
    const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    executeStep3(mockAddress);
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setWorkflowId(null);
    setStep1Result(null);
    setStep1GasAnalysis(null);
    setStep2Result(null);
    setStep3Result(null);
    setError(null);
  };

  const RustRecommendationCard = ({ recommendations, onGenerateRust }) => {
    if (!recommendations || recommendations.totalRecommendations === 0) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-xl">✅</span>
            <h3 className="ml-2 text-lg font-semibold text-green-800">Optimization Status</h3>
          </div>
          <p className="text-green-700 mt-2">Your contract is already well-optimized! No Rust optimizations needed.</p>
          <button
            onClick={() => setCurrentStep(3)}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Final Step
          </button>
        </div>
      );
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-yellow-800">🦀 Rust Optimization Opportunities</h3>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
            {recommendations.totalRecommendations} Functions
          </span>
        </div>
        
        <p className="text-yellow-700 mb-4">{recommendations.summary}</p>
        
        <div className="space-y-3 mb-4">
          {recommendations.recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="bg-white border border-yellow-200 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{rec.functionName}()</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.recommendationStrength === 'High' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {rec.recommendationStrength} Priority
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Current:</span>
                  <span className="ml-2 font-mono text-red-600">{rec.currentGas.toLocaleString()} Gas</span>
                </div>
                <div>
                  <span className="text-gray-600">Potential Savings:</span>
                  <span className="ml-2 font-mono text-green-600">${rec.costSavingsUSD}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onGenerateRust}
          disabled={isLoading}
          className="w-full bg-orange-600 text-white px-4 py-2 rounded font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Generating Rust Optimizations...' : 'Generate Rust Optimizations'}
        </button>
      </div>
    );
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
            step <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Smart Contract Optimization Workflow</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowWorkflowHistory(!showWorkflowHistory)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            History
          </button>
          <button
            onClick={resetWorkflow}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <StepIndicator />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <div className="text-red-800 font-medium">Error:</div>
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {showWorkflowHistory && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Recent Workflows</h3>
          {savedWorkflows.length === 0 ? (
            <p className="text-gray-600">No saved workflows found.</p>
          ) : (
            <div className="space-y-2">
              {savedWorkflows.slice(0, 5).map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <div>
                    <div className="font-medium">{workflow.name}</div>
                    <div className="text-sm text-gray-600">{new Date(workflow.lastModified).toLocaleString()}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setPrompt(workflow.description || '');
                        setContractName(workflow.name || 'MyContract');
                        setWorkflowId(workflow.id);
                        setShowWorkflowHistory(false);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => {
                        deleteWorkflow(workflow.id);
                        loadSavedWorkflows();
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Step 1: Initial Setup and Solidity Generation */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Step 1: Generate Base Solidity Contract</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Name</label>
                <input
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="MyContract"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contract Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Describe what your smart contract should do (e.g., 'Create a token with minting, burning, and staking functionality')"
              />
            </div>

            <button
              onClick={startNewWorkflow}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Generating Contract...' : 'Generate Base Contract'}
            </button>

            {step1Result && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <h3 className="ml-2 text-lg font-semibold text-green-800">Step 1 Complete</h3>
                </div>
                <p className="text-green-700">Base Solidity contract generated successfully!</p>
                <div className="mt-2 text-sm text-green-600">
                  Contract size: {step1Result.contractCode?.length || 0} characters
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Gas Analysis and Rust Recommendations */}
        {currentStep === 2 && step1GasAnalysis && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Step 2: Gas Analysis & Rust Optimization</h2>
            
            <RustRecommendationCard
              recommendations={step1GasAnalysis.rustAnalysis}
              onGenerateRust={executeStep2}
            />

            {step2Result && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <h3 className="ml-2 text-lg font-semibold text-green-800">Step 2 Complete</h3>
                </div>
                <p className="text-green-700">Generated {step2Result.rustContracts?.length || 0} Rust optimization contracts!</p>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
                >
                  Continue to Integration
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Enhanced Solidity Generation */}
        {currentStep === 3 && step2Result && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Step 3: Enhanced Contract Integration</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Ready for Integration</h3>
              <p className="text-blue-700 mb-4">
                Your Rust optimizations are ready. Click below to generate the enhanced Solidity contract 
                that integrates with the optimized Rust functions.
              </p>
              
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-blue-800">Rust Contracts Generated:</h4>
                {step2Result.rustContracts?.map((contract, index) => (
                  <div key={index} className="bg-white border border-blue-200 rounded p-2">
                    <div className="font-medium">{contract.functionName}</div>
                    <div className="text-sm text-gray-600">
                      Estimated savings: {contract.estimatedGasSavings}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={simulateRustDeployment}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Generating Enhanced Contract...' : 'Generate Enhanced Contract'}
              </button>
            </div>

            {step3Result && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 text-xl">🎉</span>
                  <h3 className="ml-2 text-lg font-semibold text-green-800">Workflow Complete!</h3>
                </div>
                <p className="text-green-700">Enhanced Solidity contract with Rust integration generated successfully!</p>
                <div className="mt-3 text-sm text-green-600">
                  Your optimized contract is ready for compilation and deployment.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowManager; 