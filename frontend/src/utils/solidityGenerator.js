// SPDX-License-Identifier: MIT
// Solidity Code Generator from Flowchart

// --- Node Type Registry ---
const NODE_TYPE_MAP = {
  // Triggers
  'asset_transfer_detected': {
    params: ['address from', 'address to', 'uint256 amount'],
    event: 'WorkflowTriggered(address indexed from, address indexed to, uint256 amount);'
  },
  'governance_proposal': {
    params: ['string description', 'address proposer'],
    event: 'GovernanceProposalTriggered(string description, address indexed proposer);'
  },
  // Actions
  'transfer_token': {
    state: 'mapping(address => uint256) public balances;',
    event: 'TokensTransferred(address indexed to, uint256 amount);',
    helper: `
    function _transferToken(address recipient, uint256 amount) internal {
        // Transfer logic here
        emit TokensTransferred(recipient, amount);
    }
    `
  },
  'create_asset': {
    struct: 'struct Asset { string name; uint256 totalSupply; address creator; }',
    state: 'mapping(uint256 => Asset) public assets;',
    event: 'AssetCreated(uint256 indexed assetId, string name, address indexed creator);',
    helper: `
    function _createAsset(string memory name, uint256 totalSupply) internal {
        // Asset creation logic here
        uint256 assetId = assetCounter++;
        assets[assetId] = Asset(name, totalSupply, msg.sender);
        emit AssetCreated(assetId, name, msg.sender);
    }
    `
  },
  // DAO Voting Example
  'dao_voting': {
    struct: 'struct Proposal { string description; uint256 votesFor; uint256 votesAgainst; bool executed; }',
    state: 'mapping(uint256 => Proposal) public proposals;\nuint256 public proposalCounter;',
    event: 'ProposalCreated(uint256 id);\nVoted(uint256 proposalId, bool vote);',
    helper: `
    function _createProposal(string memory description) internal {
        proposals[proposalCounter] = Proposal(description, 0, 0, false);
        emit ProposalCreated(proposalCounter);
        proposalCounter++;
    }
    function _vote(uint256 proposalId, bool support) internal {
        if (support) {
            proposals[proposalId].votesFor++;
        } else {
            proposals[proposalId].votesAgainst++;
        }
        emit Voted(proposalId, support);
    }
    `
  },
  // Add more node types as needed
};

// --- State Tracker ---
class StateTracker {
  constructor() {
    this.vars = new Set();
    this.events = new Set();
    this.structs = new Set();
    this.helpers = new Set();
  }
  addVariable(v) { if (v) this.vars.add(v); }
  addEvent(e) { if (e) this.events.add(e); }
  addStruct(s) { if (s) this.structs.add(s); }
  addHelper(h) { if (h) this.helpers.add(h); }
}

// --- Helper: Find node by ID ---
const findNodeById = (nodes, id) => nodes.find(node => node.id === id);

// --- Helper: Get outgoing edges ---
const getOutgoingEdges = (edges, nodeId) => edges.filter(e => e.source === nodeId);

// --- Main Solidity Code Generator ---
export const generateSolidityFromFlowchart = (nodes, edges, projectName = "GeneratedContract") => {
  const contractName = projectName.replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedContract';
  const state = new StateTracker();

  // Analyze all nodes for state, events, structs, helpers
  nodes.forEach(node => {
    const spec = NODE_TYPE_MAP[node.data.nodeType];
    if (spec) {
      if (spec.state) state.addVariable(spec.state);
      if (spec.event) state.addEvent(spec.event);
      if (spec.struct) state.addStruct(spec.struct);
      if (spec.helper) state.addHelper(spec.helper);
    }
  });

  // Find trigger node
  const triggerNode = nodes.find(n => n.data.category === 'trigger');
  if (!triggerNode) return "// No trigger node found\n";

  // Get trigger params
  const triggerSpec = NODE_TYPE_MAP[triggerNode.data.nodeType] || {};
  const params = triggerSpec.params || [];

  // Build main workflow body
  const workflowBody = generateExecutionPath(triggerNode.id, nodes, edges, '        ');

  // Assemble contract
  const contract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ${contractName}
 * @dev Smart contract generated from flowchart.
 */
contract ${contractName} {
    address public owner;
    mapping(address => bool) public authorized;
    bool private _locked;
    uint256 public assetCounter;

    ${Array.from(state.structs).join('\n    ')}

    ${Array.from(state.vars).join('\n    ')}

    ${Array.from(state.events).map(e => `event ${e}`).join('\n    ')}

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

    constructor() {
        owner = msg.sender;
        authorized[msg.sender] = true;
    }

    ${Array.from(state.helpers).join('\n    ')}

    function executeWorkflow(${params.join(', ')}) public onlyAuthorized nonReentrant {
${workflowBody}
    }
}
`;

  return contract;
};

// --- Recursively generate execution path ---
const generateExecutionPath = (nodeId, nodes, edges, indent) => {
  const node = findNodeById(nodes, nodeId);
  if (!node) return `${indent}// Node ${nodeId} not found\n`;

  let code = `${indent}// Executing node: ${node.data.label}\n`;
  code += generateNodeAction(node, indent);

  const outgoingEdges = getOutgoingEdges(edges, nodeId);

  if (node.data.nodeType === 'if_else_logic') {
    // Find true/false branches
    const trueEdge = outgoingEdges.find(e => e.label === 'true');
    const falseEdge = outgoingEdges.find(e => e.label === 'false');
    const condition = node.data.properties?.condition || "true";

    code += `${indent}if (${condition}) {\n`;
    if (trueEdge) {
      code += generateExecutionPath(trueEdge.target, nodes, edges, indent + '    ');
    }
    code += `${indent}} else {\n`;
    if (falseEdge) {
      code += generateExecutionPath(falseEdge.target, nodes, edges, indent + '    ');
    }
    code += `${indent}}\n`;
  } else if (outgoingEdges.length > 0) {
    // Follow the first edge for linear flows
    code += generateExecutionPath(outgoingEdges[0].target, nodes, edges, indent);
  }

  return code;
};

// --- Generate code for a single node action ---
const generateNodeAction = (node, indent) => {
  const props = node.data.properties || {};
  switch (node.data.nodeType) {
    case 'transfer_token':
      return `${indent}_transferToken(${props.recipient || 'address(0)'}, ${props.amount || 0});\n`;
    case 'create_asset':
      return `${indent}_createAsset("${props.name || 'New Asset'}", ${props.totalSupply || 0});\n`;
    case 'dao_voting':
      return `${indent}_createProposal("${props.description || 'Proposal'}");\n`;
    // Add more node type handlers here
    default:
      return `${indent}// No action defined for ${node.data.nodeType}\n`;
  }
};
