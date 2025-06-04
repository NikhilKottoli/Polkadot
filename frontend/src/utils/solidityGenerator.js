// Solidity Code Generator from Flowchart
import { getNodeTypeById } from '../pages/Playground/components/Node/NodeTypes';

export const generateSolidityFromFlowchart = (nodes, edges, projectName = "GeneratedContract") => {
  console.log('🔨 [SolidityGen] Converting flowchart to Solidity');
  console.log('🔨 [SolidityGen] Nodes:', nodes.length);
  console.log('🔨 [SolidityGen] Edges:', edges.length);

  // Clean project name for contract
  const contractName = projectName.replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedContract';
  
  // Analyze flowchart structure
  const analysis = analyzeFlowchart(nodes, edges);
  
  // Generate contract code
  let solidityCode = buildSolidityContract(contractName, analysis, nodes, edges);
  
  // Clean any potential markdown artifacts
  solidityCode = cleanSolidityCode(solidityCode);
  
  console.log('✅ [SolidityGen] Generated Solidity code length:', solidityCode.length);
  
  return solidityCode;
};

// Clean any markdown artifacts from the generated code
const cleanSolidityCode = (code) => {
  // Remove markdown code blocks
  code = code.replace(/```solidity\n?/g, '');
  code = code.replace(/```\n?/g, '');
  
  // Remove any extra whitespace at the beginning or end
  code = code.trim();
  
  // Ensure proper line endings
  code = code.replace(/\r\n/g, '\n');
  
  return code;
};

// Analyze the flowchart to understand its structure and requirements
const analyzeFlowchart = (nodes, edges) => {
  const triggers = nodes.filter(node => node.data.category === 'trigger');
  const actions = nodes.filter(node => node.data.category === 'action');
  const logicNodes = nodes.filter(node => node.data.category === 'logic');
  const walletNodes = nodes.filter(node => node.data.category === 'wallet');
  
  // Find the entry point (trigger nodes with no incoming edges)
  const entryPoints = triggers.filter(trigger => 
    !edges.some(edge => edge.target === trigger.id)
  );
  
  // Determine required state variables and events
  const stateVars = new Set();
  const events = new Set();
  const functions = new Set();
  
  // Analyze each node type for requirements
  nodes.forEach(node => {
    const nodeType = getNodeTypeById(node.data.nodeType);
    
    switch (node.data.nodeType) {
      case 'asset_transfer_detected':
        stateVars.add('mapping(address => uint256) public balances');
        events.add('AssetTransferDetected(address indexed from, address indexed to, uint256 amount)');
        functions.add('detectTransfer');
        break;
        
      case 'dao_voting':
        stateVars.add('mapping(uint256 => Proposal) public proposals');
        stateVars.add('uint256 public proposalCounter');
        stateVars.add('mapping(uint256 => mapping(address => bool)) public hasVoted');
        events.add('ProposalCreated(uint256 indexed proposalId, string description)');
        events.add('VoteCast(uint256 indexed proposalId, address indexed voter, bool support)');
        functions.add('createProposal');
        functions.add('vote');
        break;
        
      case 'transfer_token':
        stateVars.add('mapping(address => uint256) public tokenBalances');
        stateVars.add('uint256 public totalTokenSupply');
        stateVars.add('string public tokenName');
        stateVars.add('string public tokenSymbol');
        events.add('TokenTransferred(address indexed to, uint256 amount)');
        functions.add('transferTokens');
        break;
        
      case 'freeze_asset':
        stateVars.add('mapping(uint256 => bool) public frozenAssets');
        events.add('AssetFrozen(uint256 indexed assetId)');
        functions.add('freezeAsset');
        break;
        
      case 'create_asset':
        stateVars.add('mapping(uint256 => Asset) public assets');
        stateVars.add('uint256 public assetCounter');
        events.add('AssetCreated(uint256 indexed assetId, string name, uint256 totalSupply)');
        functions.add('createAsset');
        break;
        
      case 'if_else_logic':
        functions.add('checkCondition');
        break;
        
      case 'math_operation':
        functions.add('performMathOperation');
        break;
        
      case 'send_email':
        events.add('EmailSent(address indexed recipient, string subject)');
        functions.add('sendEmail');
        break;
    }
  });
  
  return {
    entryPoints,
    triggers,
    actions,
    logicNodes,
    walletNodes,
    stateVars: Array.from(stateVars),
    events: Array.from(events),
    functions: Array.from(functions)
  };
};

// Build the complete Solidity contract
const buildSolidityContract = (contractName, analysis, nodes, edges) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  let contract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ${contractName}
 * @dev Smart contract generated from Polkaflow flowchart
 * @notice Generated on ${timestamp}
 */

contract ${contractName} {
    // Owner and access control
    address public owner;
    mapping(address => bool) public authorized;
    
    // Reentrancy guard
    bool private _locked;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorized[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

`;

  // Add structs based on node types
  contract += generateStructs(analysis, nodes);
  
  // Add state variables
  if (analysis.stateVars.length > 0) {
    contract += `    // State variables\n`;
    analysis.stateVars.forEach(stateVar => {
      contract += `    ${stateVar};\n`;
    });
    contract += '\n';
  }
  
  // Add events
  if (analysis.events.length > 0) {
    contract += `    // Events\n`;
    analysis.events.forEach(event => {
      contract += `    event ${event};\n`;
    });
    contract += '\n';
  }
  
  // Add constructor
  contract += generateConstructor(analysis, nodes);
  
  // Add functions based on flowchart logic
  contract += generateFunctions(analysis, nodes, edges);
  
  // Add utility functions
  contract += generateUtilityFunctions();
  
  contract += `}`;
  
  return contract;
};

// Generate required structs
const generateStructs = (analysis, nodes) => {
  let structs = '';
  
  // Check if we need proposal struct
  if (nodes.some(node => node.data.nodeType === 'dao_voting')) {
    structs += `    // Structs
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        address proposer;
    }
    
`;
  }
  
  // Check if we need asset struct
  if (nodes.some(node => node.data.nodeType === 'create_asset')) {
    structs += `    struct Asset {
        string name;
        uint256 totalSupply;
        address creator;
        bool frozen;
    }
    
`;
  }
  
  return structs;
};

// Generate constructor
const generateConstructor = (analysis, nodes) => {
  let constructor = `    // Constructor
    constructor() {
        owner = msg.sender;
        authorized[msg.sender] = true;`;
        
  // Initialize token data if token transfer nodes exist
  if (nodes.some(node => node.data.nodeType === 'transfer_token')) {
    constructor += `
        tokenName = "Generated Token";
        tokenSymbol = "GEN";
        totalTokenSupply = 1000000 * 10**18; // 1 million tokens
        tokenBalances[msg.sender] = totalTokenSupply; // Give all tokens to contract owner`;
  }
  
  constructor += `
    }
    
`;
  
  return constructor;
};

// Generate functions based on flowchart
const generateFunctions = (analysis, nodes, edges) => {
  let functions = '';
  
  // Generate main workflow function
  functions += generateMainWorkflow(analysis, nodes, edges);
  
  // Generate specific functions for each node type
  nodes.forEach(node => {
    functions += generateNodeFunction(node, nodes, edges);
  });
  
  return functions;
};

// Generate the main workflow function
const generateMainWorkflow = (analysis, nodes, edges) => {
  const entryPoint = analysis.entryPoints[0];
  if (!entryPoint) {
    return `    // Main workflow - No entry point found
    function executeWorkflow() public onlyAuthorized {
        // Add your workflow logic here
    }
    
`;
  }
  
  return `    // Main workflow execution
    function executeWorkflow() public onlyAuthorized {
        // Starting from: ${entryPoint.data.label}
        ${generateNodeExecution(entryPoint, nodes, edges, '        ')}
    }
    
`;
};

// Generate execution logic for a specific node
const generateNodeExecution = (node, nodes, edges, indent = '    ') => {
  let execution = `${indent}// Execute: ${node.data.label}\n`;
  
  switch (node.data.nodeType) {
    case 'asset_transfer_detected':
      execution += `${indent}// Trigger: Asset transfer detection\n`;
      execution += `${indent}// Properties: ${JSON.stringify(node.data.properties)}\n`;
      break;
      
    case 'dao_voting':
      execution += `${indent}// DAO Voting process\n`;
      execution += `${indent}uint256 proposalId = createProposal("${node.data.properties?.description || 'Generated proposal'}");\n`;
      break;
      
    case 'transfer_token':
      execution += `${indent}// Transfer tokens\n`;
      const toAddress = node.data.properties?.to_address || '0x742a4c0E7a1A0B9f08b6E7A0b9f08b6E7A0b9f08';
      const amount = node.data.properties?.amount || '100';
      execution += `${indent}transferTokens(${toAddress}, ${amount});\n`;
      break;
      
    case 'freeze_asset':
      execution += `${indent}// Freeze asset\n`;
      execution += `${indent}freezeAsset(${node.data.properties?.asset_id || '0'});\n`;
      break;
      
    case 'if_else_logic':
      execution += `${indent}// Conditional logic\n`;
      execution += `${indent}if (checkCondition(${node.data.properties?.condition || 'true'})) {\n`;
      
      // Find true/false branches
      const trueBranch = edges.find(edge => edge.source === node.id && edge.label === 'true');
      const falseBranch = edges.find(edge => edge.source === node.id && edge.label === 'false');
      
      if (trueBranch) {
        const nextNode = nodes.find(n => n.id === trueBranch.target);
        if (nextNode) {
          execution += generateNodeExecution(nextNode, nodes, edges, indent + '    ');
        }
      }
      execution += `${indent}} else {\n`;
      if (falseBranch) {
        const nextNode = nodes.find(n => n.id === falseBranch.target);
        if (nextNode) {
          execution += generateNodeExecution(nextNode, nodes, edges, indent + '    ');
        }
      }
      execution += `${indent}}\n`;
      return execution;
      
    default:
      execution += `${indent}// Generic node execution\n`;
      execution += `${indent}// TODO: Implement ${node.data.nodeType}\n`;
  }
  
  // Continue to next nodes
  const nextEdges = edges.filter(edge => edge.source === node.id && !['true', 'false'].includes(edge.label));
  nextEdges.forEach(edge => {
    const nextNode = nodes.find(n => n.id === edge.target);
    if (nextNode) {
      execution += generateNodeExecution(nextNode, nodes, edges, indent);
    }
  });
  
  return execution;
};

// Generate individual functions for nodes
const generateNodeFunction = (node, nodes, edges) => {
  switch (node.data.nodeType) {
    case 'dao_voting':
      return `    // DAO Voting functions
    function createProposal(string memory description) public onlyAuthorized returns (uint256) {
        uint256 proposalId = proposalCounter++;
        proposals[proposalId] = Proposal({
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + 7 days,
            executed: false,
            proposer: msg.sender
        });
        
        emit ProposalCreated(proposalId, description);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) public nonReentrant {
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(proposals[proposalId].deadline > block.timestamp, "Voting ended");
        require(proposalId < proposalCounter, "Proposal does not exist");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposals[proposalId].votesFor++;
        } else {
            proposals[proposalId].votesAgainst++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }
    
`;

    case 'transfer_token':
      return `    // Token transfer function
    function transferTokens(address to, uint256 amount) public onlyAuthorized nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(tokenBalances[msg.sender] >= amount, "Insufficient balance");
        
        tokenBalances[msg.sender] -= amount;
        tokenBalances[to] += amount;
        
        emit TokenTransferred(to, amount);
    }
    
    function mintTokens(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        tokenBalances[to] += amount;
        totalTokenSupply += amount;
        
        emit TokenTransferred(to, amount);
    }
    
`;

    case 'freeze_asset':
      return `    // Asset freezing function
    function freezeAsset(uint256 assetId) public onlyAuthorized nonReentrant {
        require(assetId < assetCounter, "Asset does not exist");
        require(!frozenAssets[assetId], "Already frozen");
        
        frozenAssets[assetId] = true;
        emit AssetFrozen(assetId);
    }
    
    function unfreezeAsset(uint256 assetId) public onlyOwner {
        require(assetId < assetCounter, "Asset does not exist");
        require(frozenAssets[assetId], "Asset not frozen");
        
        frozenAssets[assetId] = false;
    }
    
`;

    case 'create_asset':
      return `    // Asset creation function
    function createAsset(string memory name, uint256 totalSupply) public onlyAuthorized returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(totalSupply > 0, "Total supply must be positive");
        
        uint256 assetId = assetCounter++;
        assets[assetId] = Asset({
            name: name,
            totalSupply: totalSupply,
            creator: msg.sender,
            frozen: false
        });
        
        emit AssetCreated(assetId, name, totalSupply);
        return assetId;
    }
    
`;

    default:
      return '';
  }
};

// Generate utility functions
const generateUtilityFunctions = () => {
  return `    // Utility functions
    function addAuthorized(address user) public onlyOwner {
        require(user != address(0), "Invalid address");
        authorized[user] = true;
    }
    
    function removeAuthorized(address user) public onlyOwner {
        authorized[user] = false;
    }
    
    function checkCondition(bool condition) public pure returns (bool) {
        return condition;
    }
    
    // Token utility functions
    function getTokenBalance(address account) public view returns (uint256) {
        return tokenBalances[account];
    }
    
    function getTotalSupply() public view returns (uint256) {
        return totalTokenSupply;
    }
    
    // Asset utility functions
    function getAssetInfo(uint256 assetId) public view returns (string memory name, uint256 supply, address creator, bool frozen) {
        require(assetId < assetCounter, "Asset does not exist");
        Asset memory asset = assets[assetId];
        return (asset.name, asset.totalSupply, asset.creator, asset.frozen);
    }
    
    // Proposal utility functions
    function getProposalInfo(uint256 proposalId) public view returns (string memory description, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed) {
        require(proposalId < proposalCounter, "Proposal does not exist");
        Proposal memory proposal = proposals[proposalId];
        return (proposal.description, proposal.votesFor, proposal.votesAgainst, proposal.deadline, proposal.executed);
    }
    
    // Emergency functions
    function pause() public onlyOwner {
        // Emergency pause functionality can be implemented here
    }
    
    function unpause() public onlyOwner {
        // Emergency unpause functionality can be implemented here
    }
    
    // Fallback function to receive Ether
    receive() external payable {}
`;
}; 