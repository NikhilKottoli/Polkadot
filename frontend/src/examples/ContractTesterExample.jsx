import React from 'react';
import DynamicContractTester from '../components/DynamicContractTester';

// Sample ERC20 Token Contract ABI for demonstration
const sampleTokenABI = [
  {
    "name": "name",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "name": "symbol",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "name": "totalSupply",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "approve",
    "type": "function",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "allowance",
    "type": "function",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
];

// Sample DAO Contract ABI
const sampleDAOABI = [
  {
    "name": "createProposal",
    "type": "function",
    "inputs": [
      { "name": "description", "type": "string" },
      { "name": "votingPeriod", "type": "uint256" }
    ],
    "outputs": [{ "name": "proposalId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "vote",
    "type": "function",
    "inputs": [
      { "name": "proposalId", "type": "uint256" },
      { "name": "support", "type": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "executeProposal",
    "type": "function",
    "inputs": [{ "name": "proposalId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "getProposal",
    "type": "function",
    "inputs": [{ "name": "proposalId", "type": "uint256" }],
    "outputs": [
      { "name": "description", "type": "string" },
      { "name": "yesVotes", "type": "uint256" },
      { "name": "noVotes", "type": "uint256" },
      { "name": "executed", "type": "bool" }
    ],
    "stateMutability": "view"
  }
];

// Sample Asset Management Contract ABI
const sampleAssetABI = [
  {
    "name": "createAsset",
    "type": "function",
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "symbol", "type": "string" },
      { "name": "initialSupply", "type": "uint256" }
    ],
    "outputs": [{ "name": "assetId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "mintAsset",
    "type": "function",
    "inputs": [
      { "name": "assetId", "type": "uint256" },
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "freezeAsset",
    "type": "function",
    "inputs": [{ "name": "assetId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "thawAsset",
    "type": "function",
    "inputs": [{ "name": "assetId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "burnAsset",
    "type": "function",
    "inputs": [
      { "name": "assetId", "type": "uint256" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "getAssetInfo",
    "type": "function",
    "inputs": [{ "name": "assetId", "type": "uint256" }],
    "outputs": [
      { "name": "name", "type": "string" },
      { "name": "symbol", "type": "string" },
      { "name": "totalSupply", "type": "uint256" },
      { "name": "isFrozen", "type": "bool" }
    ],
    "stateMutability": "view"
  }
];

// Sample flowchart nodes for different contracts
const tokenFlowchartNodes = [
  { id: 'node1', label: 'Check Balance', functionName: 'balanceOf' },
  { id: 'node2', label: 'Transfer Tokens', functionName: 'transfer' },
  { id: 'node3', label: 'Approve Spending', functionName: 'approve' },
  { id: 'node4', label: 'Check Allowance', functionName: 'allowance' }
];

const daoFlowchartNodes = [
  { id: 'node1', label: 'Create Proposal', functionName: 'createProposal' },
  { id: 'node2', label: 'Vote on Proposal', functionName: 'vote' },
  { id: 'node3', label: 'Execute Proposal', functionName: 'executeProposal' },
  { id: 'node4', label: 'View Proposal', functionName: 'getProposal' }
];

const assetFlowchartNodes = [
  { id: 'node1', label: 'Create Asset', functionName: 'createAsset' },
  { id: 'node2', label: 'Mint Tokens', functionName: 'mintAsset' },
  { id: 'node3', label: 'Freeze Asset', functionName: 'freezeAsset' },
  { id: 'node4', label: 'Thaw Asset', functionName: 'thawAsset' },
  { id: 'node5', label: 'Burn Tokens', functionName: 'burnAsset' },
  { id: 'node6', label: 'Asset Info', functionName: 'getAssetInfo' }
];

const ContractTesterExample = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dynamic Contract Tester Examples
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Interactive examples demonstrating how to test different types of smart contracts 
            including ERC20 tokens, DAO governance, and asset management systems.
          </p>
        </div>

        {/* ERC20 Token Contract Example */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            🪙 ERC20 Token Contract
          </h2>
          <p className="text-gray-600 mb-6">
            Standard ERC20 token with transfer, approval, and balance checking functionality.
          </p>
          <DynamicContractTester
            contractAddress="0x8Eb30f83c4d219848eeca903b0b1d32bBcA7BE04"
            contractABI={sampleTokenABI}
            flowchartNodes={tokenFlowchartNodes}
            rpcUrl="https://asset-hub-evm-rpc-url"
          />
        </div>

        {/* DAO Contract Example */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">
            🏛️ DAO Governance Contract
          </h2>
          <p className="text-gray-600 mb-6">
            Decentralized governance with proposal creation, voting, and execution capabilities.
          </p>
          <DynamicContractTester
            contractAddress="0x1234567890123456789012345678901234567890"
            contractABI={sampleDAOABI}
            flowchartNodes={daoFlowchartNodes}
            rpcUrl="https://asset-hub-evm-rpc-url"
          />
        </div>

        {/* Asset Management Contract Example */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            🏦 Asset Management Contract
          </h2>
          <p className="text-gray-600 mb-6">
            Comprehensive asset management with creation, minting, freezing, and burning features.
          </p>
          <DynamicContractTester
            contractAddress="0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
            contractABI={sampleAssetABI}
            flowchartNodes={assetFlowchartNodes}
            rpcUrl="https://asset-hub-evm-rpc-url"
          />
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 How to Use
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>Connect Wallet:</strong> Click "Connect Wallet" to connect your MetaMask</p>
            <p>• <strong>Expand Functions:</strong> Click on any function card to reveal input fields</p>
            <p>• <strong>Fill Inputs:</strong> Enter values according to the Solidity type requirements</p>
            <p>• <strong>Call Functions:</strong> Green buttons are read-only, blue buttons write to blockchain</p>
            <p>• <strong>View Results:</strong> Transaction hashes, gas usage, and return values are displayed</p>
            <p>• <strong>Flowchart Integration:</strong> Functions highlight corresponding flowchart nodes when active</p>
          </div>
        </div>

        {/* Type Guide */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            🔧 Input Type Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-yellow-800">
            <div>
              <p><strong>address:</strong> 0x1234...abcd (42 characters)</p>
              <p><strong>uint256:</strong> Positive numbers (0, 100, 1000000)</p>
              <p><strong>string:</strong> Any text value</p>
              <p><strong>bool:</strong> Checkbox for true/false</p>
            </div>
            <div>
              <p><strong>bytes32:</strong> 0x123...abc (66 characters)</p>
              <p><strong>arrays:</strong> Dynamic list with add/remove buttons</p>
              <p><strong>int256:</strong> Positive or negative numbers</p>
              <p><strong>Gas:</strong> Estimated automatically for write functions</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContractTesterExample; 