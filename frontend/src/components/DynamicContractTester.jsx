import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { ChevronDownIcon, ChevronUpIcon, PlayIcon } from '@heroicons/react/24/outline';
import { LoaderIcon } from 'lucide-react';

// Helper function to validate Solidity types
const validateInput = (value, type) => {
  switch (type) {
    case 'address':
      return /^0x[a-fA-F0-9]{40}$/.test(value);
    case 'bytes32':
      return /^0x[a-fA-F0-9]{64}$/.test(value);
    case 'uint256':
    case 'int256':
      return !isNaN(value) && value !== '';
    case 'bool':
      return typeof value === 'boolean';
    case 'string':
      return typeof value === 'string';
    default:
      if (type.includes('[]')) {
        return Array.isArray(value);
      }
      return true;
  }
};

// Helper function to format input value for contract call
const formatInputValue = (value, type) => {
  switch (type) {
    case 'uint256':
    case 'int256':
      return value === '' ? '0' : ethers.getBigInt(value.toString());
    case 'bool':
      return Boolean(value);
    case 'bytes32':
      if (typeof value === 'string' && value.startsWith('0x')) {
        return value;
      }
      return ethers.encodeBytes32String(value);
    default:
      if (type.includes('[]')) {
        return Array.isArray(value) ? value : [];
      }
      return value;
  }
};

// Input component for different Solidity types
const SolidityInput = ({ type, name, value, onChange, placeholder }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    let formattedValue = inputValue;

    if (type === 'bool') {
      formattedValue = e.target.checked;
    } else if (type === 'uint256' || type === 'int256') {
      formattedValue = inputValue;
    }

    onChange(formattedValue);
  };

  const getInputProps = () => {
    const baseProps = {
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      placeholder: placeholder || `Enter ${type}`,
      value: type === 'bool' ? undefined : value,
      onChange: handleChange,
    };

    switch (type) {
      case 'bool':
        return {
          ...baseProps,
          type: 'checkbox',
          checked: Boolean(value),
          className: "w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500",
        };
      case 'uint256':
      case 'int256':
        return {
          ...baseProps,
          type: 'number',
          min: type === 'uint256' ? '0' : undefined,
        };
      case 'address':
        return {
          ...baseProps,
          type: 'text',
          placeholder: '0x...',
          maxLength: 42,
        };
      case 'bytes32':
        return {
          ...baseProps,
          type: 'text',
          placeholder: '0x...',
          maxLength: 66,
        };
      default:
        return {
          ...baseProps,
          type: 'text',
        };
    }
  };

  const inputProps = getInputProps();

  if (type === 'bool') {
    return (
      <div className="flex items-center space-x-2">
        <input {...inputProps} />
        <label className="text-sm text-gray-700">{name}</label>
      </div>
    );
  }

  return <input {...inputProps} />;
};

// Array input component for dynamic arrays
const ArrayInput = ({ type, name, value, onChange }) => {
  const baseType = type.replace('[]', '');
  const arrayValue = Array.isArray(value) ? value : [''];

  const addItem = () => {
    const newValue = [...arrayValue, ''];
    onChange(newValue);
  };

  const removeItem = (index) => {
    const newValue = arrayValue.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateItem = (index, newItemValue) => {
    const newValue = [...arrayValue];
    newValue[index] = newItemValue;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {arrayValue.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <SolidityInput
            type={baseType}
            name={`${name}[${index}]`}
            value={item}
            onChange={(newValue) => updateItem(index, newValue)}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="px-2 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
      >
        Add Item
      </button>
    </div>
  );
};

// Function card component
const FunctionCard = ({ func, onCall, isLoading, result, flowchartNodes, activeNode }) => {
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Find corresponding flowchart node
  const correspondingNode = flowchartNodes?.find(node => 
    node.functionName === func.name || node.id === func.name
  );

  const isHighlighted = activeNode === correspondingNode?.id;

  useEffect(() => {
    // Initialize inputs with default values
    const initialInputs = {};
    func.inputs.forEach(input => {
      if (input.type.includes('[]')) {
        initialInputs[input.name] = [];
      } else if (input.type === 'bool') {
        initialInputs[input.name] = false;
      } else {
        initialInputs[input.name] = '';
      }
    });
    setInputs(initialInputs);
  }, [func]);

  const validateInputs = () => {
    const errors = {};
    func.inputs.forEach(input => {
      const value = inputs[input.name];
      if (!validateInput(value, input.type)) {
        errors[input.name] = `Invalid ${input.type}`;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCall = async () => {
    if (!validateInputs()) {
      toast.error('Please fix validation errors');
      return;
    }

    const formattedInputs = func.inputs.map(input => {
      const value = inputs[input.name];
      return formatInputValue(value, input.type);
    });

    await onCall(func.name, formattedInputs, correspondingNode?.id);
  };

  const isReadFunction = func.stateMutability === 'view' || func.stateMutability === 'pure';

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
      isHighlighted ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
      >
        <div>
          <h3 className="font-medium text-gray-900">{func.name}</h3>
          <p className="text-sm text-gray-500">
            {isReadFunction ? 'Read Function' : 'Write Function'} • 
            {func.inputs.length} input{func.inputs.length !== 1 ? 's' : ''}
          </p>
        </div>
        {expanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {func.inputs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Function Inputs</h4>
              {func.inputs.map((input, index) => (
                <div key={index} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {input.name} ({input.type})
                  </label>
                  {input.type.includes('[]') ? (
                    <ArrayInput
                      type={input.type}
                      name={input.name}
                      value={inputs[input.name]}
                      onChange={(value) => setInputs(prev => ({ ...prev, [input.name]: value }))}
                    />
                  ) : (
                    <SolidityInput
                      type={input.type}
                      name={input.name}
                      value={inputs[input.name]}
                      onChange={(value) => setInputs(prev => ({ ...prev, [input.name]: value }))}
                    />
                  )}
                  {validationErrors[input.name] && (
                    <p className="text-sm text-red-600">{validationErrors[input.name]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleCall}
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isReadFunction
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Calling...' : `Call ${func.name}`}</span>
          </button>

          {result && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h5 className="font-medium text-gray-700 mb-2">Result</h5>
              {result.error ? (
                <div>
                  <div className={result.isContractError ? "text-orange-600" : "text-red-600"}>
                    <p className="font-medium">
                      {result.isContractError ? "Contract Error:" : "Error:"}
                    </p>
                    <p className="text-sm font-mono bg-white p-2 rounded border mt-1">
                      {result.error}
                    </p>
                  </div>
                  {result.isContractError && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-xs text-orange-800">
                        💡 <strong>This is expected for the demo contract!</strong> 
                        The address has no deployed contract. Add a real contract to test actual functions.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {result.returnValue !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Return Value:</p>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {JSON.stringify(result.returnValue, null, 2)}
                      </p>
                    </div>
                  )}
                  {result.transactionHash && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transaction Hash:</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-mono bg-white p-2 rounded border flex-1">
                          {result.transactionHash}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(result.transactionHash);
                            toast.success('Transaction hash copied!');
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {result.gasUsed && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gas Used:</p>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {result.gasUsed.toString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main component
const DynamicContractTester = ({
  contractAddress,
  contractABI,
  flowchartNodes = [],
  rpcUrl = "https://asset-hub-evm-rpc-url"
}) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [activeNode, setActiveNode] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed! Please install MetaMask to continue.');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect at least one account in MetaMask.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);
      
      console.log('Connected to network:', network);
      toast.success(`Wallet connected! Network: ${network.name || 'Unknown'}`);
    } catch (error) {
      console.error('Wallet connection error:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error(`Failed to connect wallet: ${error.message}`);
      }
    }
  };

  // Initialize contract
  useEffect(() => {
    if (signer && contractAddress && contractABI) {
      try {
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
        toast.success('Contract initialized successfully!');
      } catch (error) {
        toast.error(`Failed to initialize contract: ${error.message}`);
      }
    }
  }, [signer, contractAddress, contractABI]);

  // Call contract function
  const callFunction = async (functionName, inputs, nodeId) => {
    if (!contract) {
      toast.error('Contract not initialized! Please connect your wallet first.');
      return;
    }

    setLoading(prev => ({ ...prev, [functionName]: true }));
    setActiveNode(nodeId);

    try {
      const func = contractABI.find(f => f.name === functionName);
      if (!func) {
        throw new Error(`Function ${functionName} not found in ABI`);
      }

      const isReadFunction = func.stateMutability === 'view' || func.stateMutability === 'pure';

      // Format inputs according to their types
      const formattedInputs = inputs.map((input, index) => {
        const inputType = func.inputs[index]?.type;
        return inputType ? formatInputValue(input, inputType) : input;
      });

      let result;
      if (isReadFunction) {
        // Call read function (no gas required)
        console.log(`Calling read function: ${functionName} with inputs:`, formattedInputs);
        const returnValue = await contract[functionName](...formattedInputs);
        
        // Format return value for display
        let displayValue = returnValue;
        if (typeof returnValue === 'bigint') {
          displayValue = returnValue.toString();
        } else if (typeof returnValue === 'object' && returnValue !== null) {
          displayValue = JSON.stringify(returnValue, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          );
        }
        
        result = { returnValue: displayValue };
        toast.success(`${functionName} called successfully!`);
      } else {
        // Call write function (requires gas)
        console.log(`Calling write function: ${functionName} with inputs:`, formattedInputs);
        const tx = await contract[functionName](...formattedInputs);
        toast.info('Transaction submitted, waiting for confirmation...');
        
        const receipt = await tx.wait();
        result = {
          transactionHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          returnValue: 'Transaction successful'
        };
        toast.success(`${functionName} transaction confirmed!`);
      }

      setResults(prev => ({ ...prev, [functionName]: result }));
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      
      // Handle specific error types
      let errorMessage = error.message || 'Unknown error occurred';
      let userFriendlyMessage = `Failed to execute ${functionName}`;
      
      if (error.code === 'CALL_EXCEPTION') {
        if (error.message.includes('execution reverted')) {
          errorMessage = 'No contract found at this address or function reverted';
          userFriendlyMessage = `${functionName}: No contract deployed at this address`;
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network connection error';
        userFriendlyMessage = 'Network error - check your connection';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
        userFriendlyMessage = 'Transaction cancelled by user';
      }
      
      const errorResult = { 
        error: errorMessage,
        isContractError: error.code === 'CALL_EXCEPTION'
      };
      setResults(prev => ({ ...prev, [functionName]: errorResult }));
      toast.error(userFriendlyMessage);
    } finally {
      // Always stop loading, even on error
      setLoading(prev => ({ ...prev, [functionName]: false }));
      setActiveNode(null);
    }
  };

  // Filter functions from ABI
  const contractFunctions = contractABI.filter(item => item.type === 'function');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Testing Guide */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Testing Guide</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>🔸 Demo Contract:</strong> Uses a mock address. Functions will show "execution reverted" errors - this is expected!</p>
          <p><strong>🔸 Real Contracts:</strong> Connect MetaMask, ensure correct network, and contract is deployed.</p>
          <p><strong>🔸 Read Functions:</strong> No gas required, call instantly.</p>
          <p><strong>🔸 Write Functions:</strong> Require gas and MetaMask confirmation.</p>
          <p><strong>🔸 From Flowchart:</strong> Yes! Contracts deployed from your flowchart can be added here for testing.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Contract Tester</h2>
        
        {/* Connection Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contract Address:</p>
              <p className="font-mono text-sm">{contractAddress}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              {!isConnected && (
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Functions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Contract Functions ({contractFunctions.length})
          </h3>
          
          {contractFunctions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No functions found in contract ABI</p>
          ) : (
            <div className="space-y-3">
              {contractFunctions.map((func, index) => (
                <FunctionCard
                  key={`${func.name}-${index}`}
                  func={func}
                  onCall={callFunction}
                  isLoading={loading[func.name]}
                  result={results[func.name]}
                  flowchartNodes={flowchartNodes}
                  activeNode={activeNode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicContractTester; 