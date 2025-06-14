import telegramCodegen from './telegramCodegen';

class FlowchartToSolidity {
  constructor() {
    this.contractName = 'GeneratedContract';
    this.nodes = [];
    this.edges = [];
  }

  // Initialize with flowchart data
  initialize(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
  }

  // Convert flowchart to Solidity code
  async generateCode() {
    // Generate contract header
    let code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ${this.contractName} {
    // Import Telegram contract
    TelegramContract telegram;
    
    // Contract owner
    address private owner;
    
    constructor(address telegramContractAddress) {
        owner = msg.sender;
        telegram = TelegramContract(telegramContractAddress);
    }
    
    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Main function to execute the workflow
    function executeWorkflow() external onlyOwner {
`;

    // Process nodes in sequence
    const processedNodes = new Set();
    const startNodes = this.nodes.filter(node => 
      !this.edges.some(edge => edge.target === node.id)
    );

    for (const startNode of startNodes) {
      code += this.processNode(startNode, processedNodes);
    }

    // Close the contract
    code += `
    }
}`;

    return code;
  }

  // Process a single node and its connections
  processNode(node, processedNodes) {
    if (processedNodes.has(node.id)) {
      return '';
    }
    processedNodes.add(node.id);

    let code = '';

    // Generate code based on node type
    switch (node.data.nodeType) {
      case 'send_telegram':
        code += telegramCodegen.generateNodeCode(node);
        break;
      // Add other node types here
      default:
        code += `// Process ${node.data.nodeType} node\n`;
    }

    // Process connected nodes
    const outgoingEdges = this.edges.filter(edge => edge.source === node.id);
    for (const edge of outgoingEdges) {
      const targetNode = this.nodes.find(n => n.id === edge.target);
      if (targetNode) {
        code += this.processNode(targetNode, processedNodes);
      }
    }

    return code;
  }

  // Generate deployment code
  generateDeploymentCode() {
    return `
    // Deploy Telegram contract first
    ${telegramCodegen.generateDeploymentCode()}
    
    // Deploy generated contract
    const contract = await ethers.getContractFactory("${this.contractName}");
    const instance = await contract.deploy(telegram.address);
    await instance.deployed();
    `;
  }
}

 