// AI Service for OpenAI Integration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Validate API key is available
if (!OPENAI_API_KEY) {
  console.error('❌ [AIService] VITE_OPENAI_API_KEY not found in environment variables');
}

// Available node types for the AI to use
const AVAILABLE_NODE_TYPES = {
  // Trigger nodes
  triggers: [
    "asset_transfer_detected",
    "new_asset_created", 
    "balance_change_detected",
    "governance_proposal",
    "scheduled_time",
    "webhook_trigger",
    "price_threshold"
  ],
  // Action nodes
  actions: [
    "transfer_token",
    "create_asset",
    "mint_asset",
    "freeze_asset",
    "revive_asset",
    "burn_token",
    "dao_voting",
    "send_webhook",
    "send_email"
  ],
  // Logic nodes
  logic: [
    "if_else_logic",
    "math_operation",
    "data_formatter",
    "for_loop",
    "while_loop",
    "switch_logic",
    "parallel_execution"
  ],
  // Bridge nodes
  bridge: [
    "polkadot_bridge",
    "token_swap"
  ],
  // Wallet nodes
  wallet: [
    "sign_transaction",
    "generate_wallet"
  ],
  // AI nodes
  ai: [
    "openai_completion"
  ]
};

// System prompt for the AI to understand how to create flowcharts
const SYSTEM_PROMPT = `You are an expert in creating blockchain workflow flowcharts using a visual node-based system. 

AVAILABLE NODE TYPES:
${Object.entries(AVAILABLE_NODE_TYPES).map(([category, nodes]) => 
  `${category.toUpperCase()}: ${nodes.join(', ')}`
).join('\n')}

RULES:
1. Always start with a trigger node
2. Use logic nodes for decision-making (if_else_logic, switch_logic)
3. Connect nodes logically with proper sequence
4. Each node must have realistic property values
5. Position nodes left-to-right in execution order
6. Use appropriate spacing (200px horizontal, 100px vertical offsets)

RESPONSE FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "nodes": [
    {
      "id": "node_1",
      "type": "custom",
      "position": { "x": 100, "y": 200 },
      "data": {
        "nodeType": "asset_transfer_detected",
        "label": "Detect Asset Transfer",
        "category": "trigger",
        "description": "Monitors for incoming asset transfers",
        "properties": {
          "asset_id": "DOT",
          "min_amount": 100,
          "from_address": ""
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1_2",
      "source": "node_1",
      "target": "node_2",
      "label": "detected",
      "animated": true
    }
  ]
}

KEY REQUIREMENTS:
- Start X position at 100, increment by 300 for each column
- Y position: main flow at 200, branches at 100/300
- Always include realistic property values
- Use proper node types from the available list
- Create logical workflow connections
- Include proper edge labels (especially for logic nodes: "true"/"false")`;

export const generateFlowchartFromPrompt = async (prompt) => {
  try {
    console.log('🤖 [AIService] Starting flowchart generation');
    console.log('🤖 [AIService] Input prompt:', prompt);
    console.log('🤖 [AIService] Prompt length:', prompt.length);
    
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }
    
    console.log('🤖 [AIService] API Key configured:', OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('🤖 [AIService] Making request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Create a blockchain workflow flowchart for: "${prompt}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    console.log('🤖 [AIService] Response status:', response.status);
    console.log('🤖 [AIService] Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ [AIService] API request failed with status:', response.status);
      const error = await response.json();
      console.error('❌ [AIService] API error response:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    console.log('🤖 [AIService] Parsing response...');
    const data = await response.json();
    console.log('🤖 [AIService] Full API response:', data);
    
    const content = data.choices[0].message.content.trim();
    console.log('🤖 [AIService] Raw AI response content:', content);
    console.log('🤖 [AIService] Content length:', content.length);
    
    // Parse the JSON response
    let flowchartData;
    try {
      console.log('🤖 [AIService] Attempting to parse JSON...');
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🤖 [AIService] Found JSON match, parsing...');
        console.log('🤖 [AIService] JSON match:', jsonMatch[0]);
        flowchartData = JSON.parse(jsonMatch[0]);
      } else {
        console.log('🤖 [AIService] No JSON match found, parsing entire content...');
        flowchartData = JSON.parse(content);
      }
      console.log('🤖 [AIService] Successfully parsed JSON:', flowchartData);
    } catch (parseError) {
      console.error('❌ [AIService] Failed to parse AI response as JSON:', parseError);
      console.error('❌ [AIService] Parse error details:', parseError.message);
      console.error('❌ [AIService] Content that failed to parse:', content);
      throw new Error('AI response was not valid JSON');
    }

    // Validate the response structure
    console.log('🤖 [AIService] Validating response structure...');
    if (!flowchartData.nodes || !Array.isArray(flowchartData.nodes)) {
      console.error('❌ [AIService] Missing or invalid nodes array');
      console.error('❌ [AIService] flowchartData.nodes:', flowchartData.nodes);
      throw new Error('AI response missing valid nodes array');
    }

    if (!flowchartData.edges || !Array.isArray(flowchartData.edges)) {
      console.warn('⚠️ [AIService] Missing or invalid edges array, using empty array');
      flowchartData.edges = [];
    }

    console.log('🤖 [AIService] Processing nodes...');
    console.log('🤖 [AIService] Original nodes count:', flowchartData.nodes.length);
    
    // Add sequence numbers to nodes
    flowchartData.nodes = flowchartData.nodes.map((node, index) => ({
      ...node,
      sequence: index + 1,
      id: node.id || `node_${Date.now()}_${index}`
    }));

    console.log('🤖 [AIService] Processing edges...');
    console.log('🤖 [AIService] Original edges count:', flowchartData.edges.length);
    
    // Ensure edges have proper IDs
    flowchartData.edges = flowchartData.edges.map((edge, index) => ({
      ...edge,
      id: edge.id || `edge_${Date.now()}_${index}`,
      animated: true,
      style: { stroke: "#666666", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#666666" }
    }));

    console.log('✅ [AIService] Successfully generated flowchart data');
    console.log('✅ [AIService] Final nodes count:', flowchartData.nodes.length);
    console.log('✅ [AIService] Final edges count:', flowchartData.edges.length);
    console.log('✅ [AIService] Final flowchart data:', flowchartData);
    
    return {
      success: true,
      data: flowchartData
    };

  } catch (error) {
    console.error('❌ [AIService] AI flowchart generation failed');
    console.error('❌ [AIService] Error message:', error.message);
    console.error('❌ [AIService] Error stack:', error.stack);
    console.error('❌ [AIService] Full error object:', error);
    
    console.log('🔄 [AIService] Generating fallback flowchart...');
    const fallback = generateFallbackFlowchart(prompt);
    console.log('🔄 [AIService] Fallback flowchart:', fallback);
    
    return {
      success: false,
      error: error.message,
      fallback: fallback
    };
  }
};

// Fallback flowchart if AI fails
const generateFallbackFlowchart = (prompt) => {
  const fallbackNode = {
    id: `fallback_${Date.now()}`,
    type: "custom",
    position: { x: 200, y: 200 },
    sequence: 1,
    data: {
      nodeType: "webhook_trigger",
      label: "Manual Trigger",
      category: "trigger",
      description: `Fallback trigger for: ${prompt}`,
      properties: {
        webhook_url: "https://example.com/webhook",
        auth_required: false
      }
    }
  };

  return {
    nodes: [fallbackNode],
    edges: []
  };
};

// Test prompts for development
export const SAMPLE_PROMPTS = [
  "Create a DAO voting system that freezes an asset when vote passes",
  "Build an automated token transfer when balance reaches 1000 DOT",
  "Setup a governance proposal workflow with email notifications",
  "Create a DeFi swap automation when price hits threshold",
  "Build an asset minting system with approval workflow"
];

// Solidity contract generation
const SOLIDITY_SYSTEM_PROMPT = `You are an expert Solidity smart contract developer. Generate complete, secure, and well-documented Solidity contracts.

CRITICAL REQUIREMENTS:
1. Always include SPDX license identifier
2. Use pragma solidity ^0.8.25 or compatible version
3. DO NOT use any external imports (no @openzeppelin, no external contracts)
4. Implement all functionality directly within the contract
5. DO NOT use markdown formatting - return ONLY raw Solidity code
6. Follow best practices for security
7. Include comprehensive comments
8. Add proper error handling

SECURITY IMPLEMENTATION:
- Implement reentrancy guards manually using bool _locked pattern
- Implement access control using address owner and mapping(address => bool) authorized
- Validate all inputs properly
- Use safe math operations (Solidity 0.8+ has built-in overflow protection)
- Handle edge cases

SELF-CONTAINED FEATURES:
- For tokens: implement balances mapping directly
- For access control: implement owner/authorized patterns manually
- For reentrancy: implement _locked boolean guard manually
- For pausable: implement paused state manually

RESPONSE FORMAT:
Return ONLY the Solidity contract code without any markdown formatting, explanations, or code blocks. Start directly with "// SPDX-License-Identifier".

CONTRACT STRUCTURE EXAMPLE:
- Clear variable declarations
- Built-in modifiers (onlyOwner, nonReentrant)
- Well-organized functions
- Event definitions
- Self-contained implementation`;

// Add a function to clean AI-generated Solidity code
const cleanAIGeneratedCode = (code) => {
  // Remove markdown code blocks
  code = code.replace(/```solidity\n?/g, '');
  code = code.replace(/```\n?/g, '');
  
  // Remove any explanatory text before the contract
  const contractStart = code.indexOf('// SPDX-License-Identifier');
  if (contractStart > 0) {
    code = code.substring(contractStart);
  }
  
  // Remove any explanatory text after the contract
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace > 0) {
    code = code.substring(0, lastBrace + 1);
  }
  
  // Remove any extra whitespace
  code = code.trim();
  
  // Ensure proper line endings
  code = code.replace(/\r\n/g, '\n');
  
  return code;
};

export const generateSolidityContract = async (prompt) => {
  try {
    console.log('🔨 [Solidity] Starting contract generation');
    console.log('🔨 [Solidity] Input prompt:', prompt);
    console.log('🔨 [Solidity] Prompt length:', prompt.length);
    
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }
    
    console.log('🔨 [Solidity] Making request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: SOLIDITY_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Create a Solidity smart contract for: "${prompt}"`
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent code
        max_tokens: 2500
      })
    });

    console.log('🔨 [Solidity] Response status:', response.status);
    console.log('🔨 [Solidity] Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ [Solidity] API request failed with status:', response.status);
      const error = await response.json();
      console.error('❌ [Solidity] API error response:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    console.log('🔨 [Solidity] Parsing response...');
    const data = await response.json();
    console.log('🔨 [Solidity] Full API response:', data);
    
    let contractCode = data.choices[0].message.content.trim();
    
    // Clean any markdown artifacts from AI response
    contractCode = cleanAIGeneratedCode(contractCode);
    
    console.log('🔨 [Solidity] Generated contract length:', contractCode.length);
    console.log('🔨 [Solidity] Generated contract preview:', contractCode.substring(0, 200) + '...');

    return {
      success: true,
      contractCode: contractCode
    };

  } catch (error) {
    console.error('❌ [Solidity] Contract generation failed');
    console.error('❌ [Solidity] Error message:', error.message);
    console.error('❌ [Solidity] Error stack:', error.stack);
    
    // Fallback contract
    const contractName = prompt.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('').replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedContract';
    const fallbackContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ${contractName}
 * @dev Self-contained fallback contract generated for: ${prompt}
 */
contract ${contractName} {
    // Access control
    address public owner;
    mapping(address => bool) public authorized;
    
    // Reentrancy guard
    bool private _locked;
    
    // State variables
    mapping(address => uint256) public balances;
    uint256 public totalSupply;
    
    // Events
    event ContractCreated(address indexed owner, string description);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    
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
    
    constructor() {
        owner = msg.sender;
        authorized[msg.sender] = true;
        totalSupply = 1000000 * 10**18;
        balances[msg.sender] = totalSupply;
        emit ContractCreated(owner, "${prompt}");
    }
    
    // Basic functionality
    function transfer(address to, uint256 amount) public nonReentrant returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function addAuthorized(address user) public onlyOwner {
        require(user != address(0), "Invalid address");
        authorized[user] = true;
    }
    
    function removeAuthorized(address user) public onlyOwner {
        authorized[user] = false;
    }
    
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
    
    // Fallback function
    receive() external payable {}
}`;

    console.log('🔄 [Solidity] Generated fallback contract');
    
    return {
      success: false,
      error: error.message,
      contractCode: fallbackContract
    };
  }
};

// Sample Solidity prompts
export const SOLIDITY_SAMPLE_PROMPTS = [
  "ERC-20 token with minting and burning capabilities",
  "Multi-signature wallet contract",
  "Simple voting DAO with proposal system",
  "NFT marketplace with royalties",
  "Decentralized escrow service",
  "Time-locked treasury contract",
  "Staking contract with rewards distribution"
]; 