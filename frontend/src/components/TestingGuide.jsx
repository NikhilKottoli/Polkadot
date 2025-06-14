import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, PlayIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import DynamicContractTester from './DynamicContractTester';

// Sample test contracts
const testContracts = {
  simpleStorage: {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Local testnet address
    abi: [
      {
        "name": "store",
        "type": "function",
        "inputs": [{"name": "num", "type": "uint256"}],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "name": "retrieve",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view"
      }
    ],
    flowchartNodes: [
      {id: 'node1', label: 'Store Value', functionName: 'store'},
      {id: 'node2', label: 'Retrieve Value', functionName: 'retrieve'}
    ]
  },
  erc20: {
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Local testnet address
    abi: [
      {
        "name": "balanceOf",
        "type": "function",
        "inputs": [{"name": "account", "type": "address"}],
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view"
      },
      {
        "name": "transfer",
        "type": "function",
        "inputs": [
          {"name": "to", "type": "address"},
          {"name": "amount", "type": "uint256"}
        ],
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable"
      },
      {
        "name": "name",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view"
      }
    ],
    flowchartNodes: [
      {id: 'node1', label: 'Check Balance', functionName: 'balanceOf'},
      {id: 'node2', label: 'Transfer', functionName: 'transfer'},
      {id: 'node3', label: 'Token Name', functionName: 'name'}
    ]
  }
};

const TestStep = ({ step, children, isCompleted, isActive }) => {
  return (
    <div className={`border-l-4 pl-4 py-3 ${
      isCompleted 
        ? 'border-green-500 bg-green-50' 
        : isActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-gray-50'
    }`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
          isCompleted 
            ? 'bg-green-500 text-white' 
            : isActive 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-300 text-gray-600'
        }`}>
          {isCompleted ? <CheckIcon className="w-4 h-4" /> : step}
        </div>
        <h4 className="font-medium text-gray-900">{children}</h4>
      </div>
    </div>
  );
};

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between rounded-t-lg"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

const TestingGuide = () => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeStep, setActiveStep] = useState(1);

  const markStepCompleted = (step) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    setActiveStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Contract Testing Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn how to test your smart contracts using the DynamicContractTester. 
            Follow this step-by-step guide to get started.
          </p>
        </div>

        {/* Quick Start Steps */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Start</h2>
          
          <div className="space-y-2">
            <TestStep 
              step={1} 
              isCompleted={completedSteps.has(1)} 
              isActive={activeStep === 1}
            >
              Deploy or have a contract address ready
            </TestStep>
            
            <TestStep 
              step={2} 
              isCompleted={completedSteps.has(2)} 
              isActive={activeStep === 2}
            >
              Install MetaMask and connect wallet
            </TestStep>
            
            <TestStep 
              step={3} 
              isCompleted={completedSteps.has(3)} 
              isActive={activeStep === 3}
            >
              Add contract to dashboard
            </TestStep>
            
            <TestStep 
              step={4} 
              isCompleted={completedSteps.has(4)} 
              isActive={activeStep === 4}
            >
              Test read functions (no gas required)
            </TestStep>
            
            <TestStep 
              step={5} 
              isCompleted={completedSteps.has(5)} 
              isActive={activeStep === 5}
            >
              Test write functions (requires gas)
            </TestStep>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => markStepCompleted(activeStep)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Mark Step {activeStep} Complete</span>
            </button>
            
            <button
              onClick={() => {
                setCompletedSteps(new Set());
                setActiveStep(1);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Reset Progress
            </button>
          </div>
        </div>

        {/* Testing Methods */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          
          {/* Method 1: Dashboard */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-3">📊 Method 1: Contract Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Use the dashboard to manage and test all your deployed contracts in one place.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium">Navigate to Dashboard</p>
                  <p className="text-sm text-gray-600">Go to the Contract Dashboard page</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium">Add Contract</p>
                  <p className="text-sm text-gray-600">Click "Add Contract" and fill in details</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium">Test Functions</p>
                  <p className="text-sm text-gray-600">Click the play button to test any contract</p>
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: Direct Component */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-3">🔧 Method 2: Direct Component</h3>
            <p className="text-gray-600 mb-4">
              Integrate the DynamicContractTester directly into your application.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium">Import Component</p>
                  <p className="text-sm text-gray-600">Import DynamicContractTester</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium">Pass Props</p>
                  <p className="text-sm text-gray-600">Provide address, ABI, and flowchart data</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium">Start Testing</p>
                  <p className="text-sm text-gray-600">Connect wallet and test functions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          
          {/* Prerequisites */}
          <CollapsibleSection title="🔧 Prerequisites & Setup" defaultOpen={true}>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Required Setup</h4>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      <li>• MetaMask browser extension installed</li>
                      <li>• Test ETH or tokens for gas fees</li>
                      <li>• Contract deployed on a supported network</li>
                      <li>• Contract ABI available</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">For Local Testing</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Run local blockchain (Hardhat/Ganache)</li>
                    <li>• Deploy contracts locally</li>
                    <li>• Use local RPC URL</li>
                    <li>• Import test accounts to MetaMask</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">For AssetHub Testing</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Connect to AssetHub network</li>
                    <li>• Have DOT/KSM for gas fees</li>
                    <li>• Use AssetHub RPC endpoint</li>
                    <li>• Verify contract deployment</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Testing Process */}
          <CollapsibleSection title="🧪 Step-by-Step Testing Process">
            <div className="space-y-6">
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Step 1: Connect Wallet</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Open the contract tester interface</li>
                    <li>Click "Connect Wallet" button</li>
                    <li>Approve MetaMask connection</li>
                    <li>Verify green "Connected" status</li>
                  </ol>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Step 2: Test Read Functions</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Find functions marked as "Read Function" (green buttons)</li>
                    <li>Click to expand the function card</li>
                    <li>Fill in required input parameters</li>
                    <li>Click "Call [function name]" button</li>
                    <li>View results immediately (no gas cost)</li>
                  </ol>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Step 3: Test Write Functions</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Find functions marked as "Write Function" (blue buttons)</li>
                    <li>Expand and fill in parameters carefully</li>
                    <li>Click "Call [function name]" button</li>
                    <li>Approve transaction in MetaMask</li>
                    <li>Wait for transaction confirmation</li>
                    <li>View transaction hash and gas usage</li>
                  </ol>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Input Types Guide */}
          <CollapsibleSection title="📝 Input Types Reference">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Types</h4>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded p-3">
                    <code className="text-sm font-mono text-blue-600">address</code>
                    <p className="text-xs text-gray-600 mt-1">
                      42 characters starting with 0x<br/>
                      Example: 0x742d35Cc6634C0532925a3b8D...
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-3">
                    <code className="text-sm font-mono text-blue-600">uint256</code>
                    <p className="text-xs text-gray-600 mt-1">
                      Positive numbers only<br/>
                      Example: 1000, 42, 1000000
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-3">
                    <code className="text-sm font-mono text-blue-600">string</code>
                    <p className="text-xs text-gray-600 mt-1">
                      Any text value<br/>
                      Example: "Hello World", "Token Name"
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Advanced Types</h4>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded p-3">
                    <code className="text-sm font-mono text-blue-600">bool</code>
                    <p className="text-xs text-gray-600 mt-1">
                      Checkbox for true/false<br/>
                      Used for: voting, flags, switches
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-3">
                    <code className="text-sm font-mono text-blue-600">bytes32</code>
                    <p className="text-xs text-gray-600 mt-1">
                      66 characters starting with 0x<br/>
                      Example: 0x123...abc (64 hex chars)
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-3">
                    <code className="text-sm font-mono text-blue-600">uint256[]</code>
                    <p className="text-xs text-gray-600 mt-1">
                      Dynamic array with add/remove<br/>
                      Example: [100, 200, 300]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Live Testing */}
          <CollapsibleSection title="🎯 Try Live Testing">
            <div className="space-y-4">
              <p className="text-gray-600">
                Test the DynamicContractTester with sample contracts. Choose a contract below to start testing:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedContract('simpleStorage')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedContract === 'simpleStorage'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">Simple Storage</h4>
                  <p className="text-sm text-gray-600">Store and retrieve a number</p>
                  <div className="mt-2 flex space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">store</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">retrieve</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedContract('erc20')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedContract === 'erc20'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">ERC20 Token</h4>
                  <p className="text-sm text-gray-600">Test token functions</p>
                  <div className="mt-2 flex space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">balanceOf</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">transfer</span>
                  </div>
                </button>
              </div>

              {selectedContract && (
                <div className="mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <PlayIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Testing: {selectedContract === 'simpleStorage' ? 'Simple Storage' : 'ERC20 Token'}</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          This is a demo with local testnet addresses. For real testing, replace with your deployed contract address.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <DynamicContractTester
                    contractAddress={testContracts[selectedContract].address}
                    contractABI={testContracts[selectedContract].abi}
                    flowchartNodes={testContracts[selectedContract].flowchartNodes}
                    rpcUrl="http://localhost:8545" // Local testnet
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Troubleshooting */}
          <CollapsibleSection title="🔧 Troubleshooting">
            <div className="space-y-4">
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Common Issues & Solutions</h4>
                <div className="space-y-3">
                  
                  <div>
                    <p className="font-medium text-red-700 text-sm">❌ "MetaMask is not installed!"</p>
                    <ul className="text-sm text-red-600 mt-1 ml-4">
                      <li>• Install MetaMask browser extension</li>
                      <li>• Refresh the page after installation</li>
                      <li>• Check if MetaMask is enabled for the site</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-red-700 text-sm">❌ "Contract not initialized!"</p>
                    <ul className="text-sm text-red-600 mt-1 ml-4">
                      <li>• Verify contract address is correct</li>
                      <li>• Check if contract is deployed on the network</li>
                      <li>• Ensure ABI matches the deployed contract</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-red-700 text-sm">❌ "Transaction failed"</p>
                    <ul className="text-sm text-red-600 mt-1 ml-4">
                      <li>• Check if you have sufficient balance for gas</li>
                      <li>• Verify input parameters are correct</li>
                      <li>• Try increasing gas limit manually</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-red-700 text-sm">❌ "Invalid input format"</p>
                    <ul className="text-sm text-red-600 mt-1 ml-4">
                      <li>• Check address format (42 chars, starts with 0x)</li>
                      <li>• Ensure numbers are valid for uint256/int256</li>
                      <li>• Verify bytes32 is exactly 66 characters</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">✅ Best Practices</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Always test read functions before write functions</li>
                  <li>• Start with small amounts when testing transfers</li>
                  <li>• Double-check addresses before sending transactions</li>
                  <li>• Keep track of gas costs for optimization</li>
                  <li>• Test on testnets before mainnet deployment</li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

        </div>
      </div>
    </div>
  );
};

export default TestingGuide; 