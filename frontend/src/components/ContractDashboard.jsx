import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PlusIcon, TrashIcon, PencilIcon, PlayIcon, EyeIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import DynamicContractTester from './DynamicContractTester';
import ContractTestingHelper from './ContractTestingHelper';

// LocalStorage utility functions
const CONTRACTS_STORAGE_KEY = 'deployed_contracts';

const getStoredContracts = () => {
  try {
    const stored = localStorage.getItem(CONTRACTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading contracts from localStorage:', error);
    return [];
  }
};

const saveContracts = (contracts) => {
  try {
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(contracts));
  } catch (error) {
    console.error('Error saving contracts to localStorage:', error);
    toast.error('Failed to save contracts data');
  }
};

const addContract = (contractData) => {
  const contracts = getStoredContracts();
  const newContract = {
    id: Date.now().toString(),
    ...contractData,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  };
  contracts.push(newContract);
  saveContracts(contracts);
  return newContract;
};

const updateContract = (id, updates) => {
  const contracts = getStoredContracts();
  const index = contracts.findIndex(c => c.id === id);
  if (index !== -1) {
    contracts[index] = { ...contracts[index], ...updates, lastUsed: new Date().toISOString() };
    saveContracts(contracts);
  }
};

const deleteContract = (id) => {
  const contracts = getStoredContracts();
  const filtered = contracts.filter(c => c.id !== id);
  saveContracts(filtered);
};

// Add Contract Modal
const AddContractModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    network: 'AssetHub',
    abi: '',
    flowchartNodes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.address || !formData.abi) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address)) {
      toast.error('Invalid contract address format');
      return;
    }

    // Parse ABI
    let parsedABI;
    try {
      parsedABI = JSON.parse(formData.abi);
    } catch (error) {
      toast.error('Invalid ABI JSON format');
      return;
    }

    // Parse flowchart nodes (optional)
    let parsedNodes = [];
    if (formData.flowchartNodes.trim()) {
      try {
        parsedNodes = JSON.parse(formData.flowchartNodes);
      } catch (error) {
        toast.error('Invalid flowchart nodes JSON format');
        return;
      }
    }

    const contractData = {
      name: formData.name,
      address: formData.address,
      description: formData.description,
      network: formData.network,
      abi: parsedABI,
      flowchartNodes: parsedNodes
    };

    onAdd(contractData);
    setFormData({
      name: '',
      address: '',
      description: '',
      network: 'AssetHub',
      abi: '',
      flowchartNodes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Contract</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Token Contract"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the contract..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network
            </label>
            <select
              value={formData.network}
              onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AssetHub">AssetHub</option>
              <option value="Polkadot">Polkadot</option>
              <option value="Kusama">Kusama</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract ABI *
            </label>
            <textarea
              value={formData.abi}
              onChange={(e) => setFormData(prev => ({ ...prev, abi: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='[{"name": "functionName", "type": "function", ...}]'
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flowchart Nodes (Optional)
            </label>
            <textarea
              value={formData.flowchartNodes}
              onChange={(e) => setFormData(prev => ({ ...prev, flowchartNodes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='[{"id": "node1", "label": "Create Asset", "functionName": "createAsset"}]'
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Contract Card Component
const ContractCard = ({ contract, onEdit, onDelete, onTest, onCopyAddress }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{contract.name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {contract.network}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">{contract.description}</p>
          
          {/* Contract Address - Prominent */}
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1">Contract Address</p>
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                    {contract.address}
                  </code>
                  <button
                    onClick={() => onCopyAddress(contract.address)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                    title="Copy address"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Hash - If available */}
          {contract.deploymentTx && (
            <div className="mb-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-700 mb-1">Deployment Transaction</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono text-green-900 bg-white px-2 py-1 rounded border">
                      {contract.deploymentTx.slice(0, 10)}...{contract.deploymentTx.slice(-8)}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contract.deploymentTx);
                        toast.success('Transaction hash copied!');
                      }}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-200 rounded"
                      title="Copy transaction hash"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Created: {new Date(contract.createdAt).toLocaleDateString()}</span>
            <span>Last used: {new Date(contract.lastUsed).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 ml-4">
          {/* Primary Test Button - More Prominent */}
          <button
            onClick={() => onTest(contract)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center space-x-2 transition-colors"
            title="Test contract functions"
          >
            <PlayIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Test Contract</span>
          </button>
          
          {/* Secondary Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="View details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(contract)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
              title="Edit contract"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(contract.id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              title="Delete contract"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contract Info Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            <strong>{contract.abi?.filter(item => item.type === 'function')?.length || 0}</strong> functions
          </span>
          {contract.flowchartNodes?.length > 0 && (
            <span className="text-purple-600">
              <strong>{contract.flowchartNodes.length}</strong> flowchart nodes
            </span>
          )}
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Functions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {contract.abi
                  ?.filter(item => item.type === 'function')
                  ?.slice(0, 5)
                  ?.map((func, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      {func.name}
                    </span>
                  ))}
                {contract.abi?.filter(item => item.type === 'function')?.length > 5 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                    +{contract.abi.filter(item => item.type === 'function').length - 5} more
                  </span>
                )}
              </div>
            </div>
            
            {contract.flowchartNodes?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">Flowchart Nodes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contract.flowchartNodes.map((node, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                      {node.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Contract Dashboard Component
const ContractDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingContract, setTestingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('All');
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'testing'

  useEffect(() => {
    setContracts(getStoredContracts());
  }, []);

  const handleAddContract = (contractData) => {
    const newContract = addContract(contractData);
    setContracts(prev => [...prev, newContract]);
    toast.success('Contract added successfully!');
  };

  const handleDeleteContract = (id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      deleteContract(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      toast.success('Contract deleted successfully!');
    }
  };

  const handleTestContract = (contract) => {
    updateContract(contract.id, { lastUsed: new Date().toISOString() });
    setContracts(prev => prev.map(c => 
      c.id === contract.id 
        ? { ...c, lastUsed: new Date().toISOString() }
        : c
    ));
    setTestingContract(contract);
    setViewMode('testing');
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNetwork = filterNetwork === 'All' || contract.network === filterNetwork;
    return matchesSearch && matchesNetwork;
  });

  const networks = ['All', ...new Set(contracts.map(c => c.network))];

  if (viewMode === 'testing' && testingContract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">Testing: {testingContract.name}</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    🧪 Active Testing
                  </span>
                </div>
                
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">
                      <strong>Contract Address:</strong>
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                        {testingContract.address}
                      </code>
                      <button
                        onClick={() => handleCopyAddress(testingContract.address)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {testingContract.deploymentTx && (
                    <div>
                      <p className="text-gray-600">
                        <strong>Deployment Tx:</strong>
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                          {testingContract.deploymentTx.slice(0, 10)}...{testingContract.deploymentTx.slice(-8)}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(testingContract.deploymentTx);
                            toast.success('Transaction hash copied!');
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  Network: <strong>{testingContract.network}</strong>
                </span>
                <button
                  onClick={() => {
                    setTestingContract(null);
                    setViewMode('dashboard');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>← Back to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
          
          <DynamicContractTester
            contractAddress={testingContract.address}
            contractABI={testingContract.abi}
            flowchartNodes={testingContract.flowchartNodes || []}
            rpcUrl="https://asset-hub-evm-rpc-url"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Dashboard</h1>
              <p className="text-gray-600">Manage and test your deployed smart contracts</p>
            </div>
            {contracts.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Ready to test?</p>
                <p className="text-xs text-gray-400">Click the green "Test Contract" button on any contract</p>
              </div>
            )}
          </div>
        </div>

        {/* Testing Helper */}
        <ContractTestingHelper />

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterNetwork}
              onChange={(e) => setFilterNetwork(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {networks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Contract</span>
          </button>
        </div>

        {/* Stats */}
        {contracts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{contracts.length}</div>
              <div className="text-sm text-gray-600">Total Contracts</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{networks.length - 1}</div>
              <div className="text-sm text-gray-600">Networks</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {contracts.reduce((acc, c) => acc + (c.abi?.filter(item => item.type === 'function')?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Functions</div>
            </div>
          </div>
        )}

        {/* Contracts List */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {contracts.length === 0 ? 'No contracts yet' : 'No contracts match your search'}
            </h3>
            <p className="text-gray-600 mb-4">
              {contracts.length === 0 
                ? 'Add your first deployed contract to start testing'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {contracts.length === 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-3"
                >
                  Add Your First Contract
                </button>
                <p className="text-sm text-gray-500">or</p>
                <button
                  onClick={() => {
                    // Add a demo contract for testing
                    const demoContract = {
                      name: "Demo ERC20 Token",
                      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                      description: "Sample ERC20 contract for testing the interface",
                      network: "Local Testnet",
                      deploymentTx: "0xabc123def456789012345678901234567890123456789012345678901234567890",
                      abi: [
                        {
                          "name": "name",
                          "type": "function",
                          "inputs": [],
                          "outputs": [{"name": "", "type": "string", "internalType": "string"}],
                          "stateMutability": "view"
                        },
                        {
                          "name": "symbol",
                          "type": "function",
                          "inputs": [],
                          "outputs": [{"name": "", "type": "string", "internalType": "string"}],
                          "stateMutability": "view"
                        },
                        {
                          "name": "totalSupply",
                          "type": "function",
                          "inputs": [],
                          "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
                          "stateMutability": "view"
                        },
                        {
                          "name": "balanceOf",
                          "type": "function",
                          "inputs": [{"name": "account", "type": "address", "internalType": "address"}],
                          "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
                          "stateMutability": "view"
                        },
                        {
                          "name": "transfer",
                          "type": "function",
                          "inputs": [
                            {"name": "to", "type": "address", "internalType": "address"},
                            {"name": "amount", "type": "uint256", "internalType": "uint256"}
                          ],
                          "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
                          "stateMutability": "nonpayable"
                        },
                        {
                          "name": "approve",
                          "type": "function",
                          "inputs": [
                            {"name": "spender", "type": "address", "internalType": "address"},
                            {"name": "amount", "type": "uint256", "internalType": "uint256"}
                          ],
                          "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
                          "stateMutability": "nonpayable"
                        }
                      ],
                      flowchartNodes: [
                        {id: 'node1', label: 'Check Name', functionName: 'name'},
                        {id: 'node2', label: 'Check Symbol', functionName: 'symbol'},
                        {id: 'node3', label: 'Check Balance', functionName: 'balanceOf'},
                        {id: 'node4', label: 'Transfer Tokens', functionName: 'transfer'}
                      ]
                    };
                    handleAddContract(demoContract);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  🧪 Try Demo Contract
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onEdit={(contract) => {
                  // TODO: Implement edit functionality
                  toast.info('Edit functionality coming soon!');
                }}
                onDelete={handleDeleteContract}
                onTest={handleTestContract}
                onCopyAddress={handleCopyAddress}
              />
            ))}
          </div>
        )}

        {/* Add Contract Modal */}
        <AddContractModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddContract}
        />
      </div>
    </div>
  );
};

export default ContractDashboard; 