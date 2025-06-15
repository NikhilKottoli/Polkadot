// AI Service for Gemini Integration
const GEMINI_API_KEY = "AIzaSyANwL7_uwatlyvU3wDyGcFwoSSkpkdBEhY";

// Validate API key is available
if (!GEMINI_API_KEY) {
  console.error('❌ [AIService] GEMINI_API_KEY not found');
} else {
  console.log('✅ [AIService] Gemini API configured successfully');
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
    "send_email",
    "send_telegram",
    "xcm_message"
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
    "gemini_completion"
  ]
};

// System prompt for the AI to understand how to create flowcharts
const SYSTEM_PROMPT = `You are an expert in creating blockchain workflow flowcharts using a visual node-based system. 

AVAILABLE NODE TYPES:
${Object.entries(AVAILABLE_NODE_TYPES).map(([category, nodes]) => 
  `${category.toUpperCase()}: ${nodes.join(', ')}`
).join('\n')}

Rules:

Always start with a trigger node.

Use logic nodes for all decision points (if_else_logic, switch_logic).

Connect nodes in a logical, left-to-right sequence.

Each node must have realistic, specific property values (e.g., real asset IDs, addresses, durations).

Position nodes with x starting at 100 and increasing by 300 for each column; y at 200 for the main flow, 100 or 300 for branches.

Label all edges clearly, especially for logic nodes (e.g., "true", "false").

Avoid placeholders or generic values like "TODO" or "VALUE".

Ensure no floating or disconnected nodes or edges.

Use no more than 5 consecutive action nodes without a logic or security node.

Response format:
Return ONLY valid JSON with this structure:
{
"nodes": [
{
"id": "node_1",
"type": "custom",
"position": { "x": 100, "y": 200 },
"data": {
"nodeType": "governance_proposal",
"label": "Revive Asset Proposal",
"category": "trigger",
"description": "Proposal to revive inactive asset",
"properties": {
"asset_id": "DOT-123",
"proposer": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
}
}
],
"edges": [
{
"id": "edge_1_2",
"source": "node_1",
"target": "node_2",
"label": "submitted",
"animated": true
}
]
}

Your output must be plain JSON, no explanations or extra text.`;

export const generateFlowchartFromPrompt = async (prompt) => {
  try {
    console.log('🤖 [AIService] Starting flowchart generation with Gemini');
    console.log('🤖 [AIService] Input prompt:', prompt);
    console.log('🤖 [AIService] Prompt length:', prompt.length);
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured.');
    }
    
    console.log('🤖 [AIService] API Key configured:', GEMINI_API_KEY ? 'Yes' : 'No');
    console.log('🤖 [AIService] Making request to Gemini API...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nCreate a blockchain workflow flowchart for: "${prompt}"`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    console.log('🤖 [AIService] Response status:', response.status);
    console.log('🤖 [AIService] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AIService] Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    console.log('🤖 [AIService] Parsing response...');
    const data = await response.json();
    console.log('🤖 [AIService] Full API response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ [AIService] Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text.trim();
    console.log('🤖 [AIService] Raw AI response content:', content);
    console.log('🤖 [AIService] Content length:', content.length);
    
    // Parse the JSON response
    let flowchartData;
    try {
      console.log('🤖 [AIService] Attempting to parse JSON...');
      // Clean the response - remove any markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🤖 [AIService] Found JSON match, parsing...');
        flowchartData = JSON.parse(jsonMatch[0]);
      } else {
        console.log('🤖 [AIService] No JSON match found, parsing entire content...');
        flowchartData = JSON.parse(cleanedContent);
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
const SOLIDITY_SYSTEM_PROMPT = `You are an expert Solidity smart contract developer specializing in PolkaVM and AssetHub. Generate complete, functional, secure smart contracts that perform REAL WORK and provide detailed Telegram notifications.

CRITICAL REQUIREMENTS:
1. Always include SPDX license identifier
2. Use pragma solidity ^0.8.25;
3. DO NOT use any external imports (no @openzeppelin, no external contracts)
4. Implement all functionality directly within the contract for self-containment
5. DO NOT use markdown formatting - return ONLY raw Solidity code
6. Follow best practices for security and include comprehensive comments
7. ALWAYS include the SendTelegram event for workflow notifications: event SendTelegram(string message, address indexed user);
8. ALWAYS include the XCMSent event for XCM notifications: event XCMSent(string targetChain, bytes xcmCallData);
9. MANDATORY: Include executeWorkflow function that performs actual operations and emits detailed results

FLOWCHART-BASED IMPLEMENTATION REQUIREMENTS:
- Analyze the provided flowchart nodes and edges to understand the exact workflow
- Implement each node as a distinct operation in the contract
- Follow the edge connections to determine execution order and flow control
- Use loops when nodes indicate repetitive operations (e.g., "create multiple assets")
- ONLY emit SendTelegram when there is a "send_telegram" node in the flowchart

NODE-SPECIFIC IMPLEMENTATION RULES:
- TRIGGER NODES: Start the workflow, emit "Workflow Started" with trigger details
- ACTION NODES: Perform actual operations (create asset, transfer, mint, etc.) and emit results
- LOGIC NODES: Implement if/else, loops, conditions and emit flow control status
- BRIDGE NODES: Handle cross-chain operations and emit transaction details
- WALLET NODES: Generate addresses, sign transactions and emit wallet info
- AI NODES: Process data and emit AI operation results
- XCM NODES: For "xcm_message" nodes, generate a placeholder for the XCM call. The real implementation will be provided by the PolkaVM environment. Emit an event with the XCM details.
  - Example: \`emit XCMSent(targetChain, xcmCallData);\`, where \`targetChain\` and \`xcmCallData\` are derived from the node's properties.

TELEGRAM EMISSION PATTERN:
- Each node execution = one SendTelegram event
- Include node type, operation details, results, and execution order
- For loops: emit notification for each iteration with counter
- For conditions: emit which branch was taken and why
- For errors: emit failure details and recovery actions

TELEGRAM MESSAGE FORMAT REQUIREMENTS:
- Use string concatenation with abi.encodePacked() wrapped in string()
- Include operation type, all relevant IDs/amounts, participant addresses
- Format messages to be informative for monitoring dashboards
- Example: "Asset Created! ID: 123, Name: MyToken, Symbol: MTK, Supply: 1000000, Creator: 0x742d35..."

COMPILATION ERROR PREVENTION:
- NEVER use toString() on addresses or numbers without proper conversion
- NEVER use Strings.toString() without importing - implement manual conversion if needed  
- NEVER assign abi.encodePacked() directly to string - use string(abi.encodePacked()) for conversion
- For string concatenation: string(abi.encodePacked(str1, str2)) NOT abi.encodePacked(str1, str2)
- For number to string conversion: implement uint2str() function or use manual conversion
- Always ensure type compatibility (bytes vs string vs uint256)
- Always close all brackets and parentheses properly
- Use correct visibility specifiers (public, private, internal, external)
- Ensure all events are properly declared before use
- When concatenating strings with numbers, convert numbers to strings first

POLKAVM & ASSETHUB OPTIMIZATIONS:
- Target PolkaVM: Generate efficient code considering its RISC-V architecture. Avoid EVM-specific opcodes or patterns that are inefficient on PolkaVM.
- AssetHub Integration: When the workflow involves assets (creation, transfer, freezing), assume interaction with AssetHub's native assets. Use placeholders for asset IDs where specific IDs are not provided in the flowchart (e.g., uint256 assetId).
- Enhanced Limits: Leverage PolkaVM's larger contract size limit (up to 100KB) to create more complex and feature-rich contracts where appropriate, without sacrificing clarity.
- Gas Efficiency: Write gas-conscious code. Use efficient data types and minimize state writes.

SECURITY IMPLEMENTATION:
- Implement reentrancy guards manually using a '_locked' boolean pattern
- Implement access control using an 'owner' address and appropriate modifiers (e.g., 'onlyOwner')
- Validate all inputs properly
- Use safe math operations (Solidity 0.8+ has built-in overflow protection)
- Handle edge cases thoroughly

MANDATORY FUNCTION TEMPLATES:
Every contract MUST include these exact functions:

1. ExecuteWorkflow function that implements the EXACT flowchart logic:
function executeWorkflow(string memory message) public {
    // MUST implement the workflow based on the provided flowchart nodes and edges
    // MUST follow the node sequence and connections from the flowchart
    // ONLY emit SendTelegram when there is a "send_telegram" node in the flowchart
    
    // Example implementation pattern:
    // for (uint i = 0; i < nodes.length; i++) {
    //     if (nodes[i].type == "create_asset") {
    //         uint256 assetId = createAsset(nodes[i].properties);
    //         // Store result for potential telegram node
    //     }
    //     else if (nodes[i].type == "send_telegram") {
    //         // ONLY NOW emit SendTelegram with accumulated results
    //         emit SendTelegram(string(abi.encodePacked(
    //             "Workflow Results: ",
    //             "Assets Created: ", uint2str(assetsCreated), ", ",
    //             "Total Operations: ", uint2str(operationsCount)
    //         )), msg.sender);
    //     }
    //     else if (nodes[i].type == "for_loop") {
    //         // Implement loop logic based on node properties
    //     }
    // }
    
    // IMPLEMENTATION RULES:
    // - Each trigger node starts the workflow (no telegram emission)
    // - Each action node performs operations (store results, no telegram)
    // - Each logic node controls flow (no telegram emission)
    // - ONLY "send_telegram" nodes emit SendTelegram events
    // - Accumulate operation results to send in telegram messages
    // - Use loops for repetitive nodes (e.g., "create 5 assets")
    
    // For testing purposes only (remove when implementing real flowchart):
    emit SendTelegram(message, msg.sender);
}

2. Helper function for uint to string conversion:
function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
        return "0";
    }
    uint j = _i;
    uint len;
    while (j != 0) {
        len++;
        j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len;
    while (_i != 0) {
        k = k-1;
        uint8 temp = (48 + uint8(_i - _i / 10 * 10));
        bytes1 b1 = bytes1(temp);
        bstr[k] = b1;
        _i /= 10;
    }
    return string(bstr);
}

3. Helper function for address to string conversion:
function addressToString(address _addr) internal pure returns (string memory) {
    bytes32 value = bytes32(uint256(uint160(_addr)));
    bytes memory alphabet = "0123456789abcdef";
    bytes memory str = new bytes(42);
    str[0] = '0';
    str[1] = 'x';
    for (uint256 i = 0; i < 20; i++) {
        str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
        str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
    }
    return string(str);
}

4. WORKFLOW-SPECIFIC IMPLEMENTATION REQUIREMENTS:
- Asset Creation: Contract must actually create assets and emit details (ID, name, symbol, supply, creator)
- Asset Transfer: Contract must handle transfers and emit sender, receiver, amount, asset ID
- Governance: Contract must implement voting and emit proposal details, vote counts, results
- DeFi: Contract must implement swaps/liquidity and emit trade details, prices, amounts
- Each operation must emit comprehensive Telegram messages with ALL relevant data

5. Safe string concatenation examples:
// Correct: string memory result = string(abi.encodePacked("Asset ID: ", uint2str(123)));
// Correct: string memory result = string(abi.encodePacked("Creator: ", addressToString(msg.sender)));
// WRONG: string memory result = abi.encodePacked("Hello ", "World"); // This causes compilation error

RESPONSE FORMAT:
Return ONLY the Solidity contract code. Start directly with "// SPDX-License-Identifier".`;

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
  
  // Fix common compilation errors
  // Fix: abi.encodePacked() assigned to string without conversion
  code = code.replace(
    /string memory (\w+) = abi\.encodePacked\(/g, 
    'string memory $1 = string(abi.encodePacked('
  );
  
  // Fix: Missing closing parentheses for string conversion
  const lines = code.split('\n');
  const fixedLines = lines.map(line => {
    // Count string(abi.encodePacked( occurrences and ensure they're closed properly
    if (line.includes('string(abi.encodePacked(') && !line.includes('));')) {
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens > closeParens && line.endsWith(');')) {
        // Add missing closing parenthesis before the semicolon
        return line.replace(/\);$/, '));');
      }
    }
    return line;
  });
  code = fixedLines.join('\n');
  
  // Remove any extra whitespace
  code = code.trim();
  
  // Ensure proper line endings
  code = code.replace(/\r\n/g, '\n');
  
  return code;
};

export const generateSolidityContract = async (prompt) => {
  try {
    console.log('🔨 [Solidity] Starting contract generation with Gemini');
    console.log('🔨 [Solidity] Input prompt:', prompt);
    console.log('🔨 [Solidity] Prompt length:', prompt.length);
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured.');
    }
    
    console.log('🔨 [Solidity] Making request to Gemini API...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SOLIDITY_SYSTEM_PROMPT}\n\nCreate a Solidity smart contract for: "${prompt}"`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      }),
    });

    console.log('🔨 [Solidity] Response status:', response.status);
    console.log('🔨 [Solidity] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Solidity] Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    console.log('🔨 [Solidity] Parsing response...');
    const data = await response.json();
    console.log('🔨 [Solidity] Full API response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ [Solidity] Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    let contractCode = data.candidates[0].content.parts[0].text.trim();
    
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
    event SendTelegram(string message, address indexed user);
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
        emit ContractCreated(owner, "Fallback Contract");
    }
    
    // MANDATORY: executeWorkflow function that implements flowchart nodes
    function executeWorkflow(string memory message) public {
        // Example workflow: Demonstrate node-by-node execution pattern
        
        // Node 1: Trigger - Workflow Started
        emit SendTelegram(string(abi.encodePacked(
            "Node 1 Executed: Workflow Started - ",
            "Trigger: Manual Execution, ",
            "User: ", addressToString(msg.sender), ", ",
            "Timestamp: ", uint2str(block.timestamp)
        )), msg.sender);
        
        // Node 2: Action - Create multiple assets (loop example)
        for (uint i = 0; i < 3; i++) {
            uint256 assetAmount = 1000 * (i + 1) * 10**18;
            totalSupply += assetAmount;
            balances[msg.sender] += assetAmount;
            
            emit SendTelegram(string(abi.encodePacked(
                "Node 2 Executed: Asset Creation Loop - ",
                "Iteration: ", uint2str(i + 1), " of 3, ",
                "Amount: ", uint2str(assetAmount / 10**18), " tokens, ",
                "Running Total: ", uint2str(totalSupply / 10**18), " tokens"
            )), msg.sender);
            
            emit Transfer(address(0), msg.sender, assetAmount);
        }
        
        // Node 3: Logic - Check balance condition
        bool hasEnoughBalance = balances[msg.sender] >= 5000 * 10**18;
        emit SendTelegram(string(abi.encodePacked(
            "Node 3 Executed: Balance Check - ",
            "Condition: Balance >= 5000, ",
            "Result: ", hasEnoughBalance ? "TRUE" : "FALSE", ", ",
            "Current Balance: ", uint2str(balances[msg.sender] / 10**18), " tokens"
        )), msg.sender);
        
        // Node 4: Final Action - Workflow completion
        emit SendTelegram(string(abi.encodePacked(
            "Node 4 Executed: Workflow Completed - ",
            "Total Nodes: 4, ",
            "Final Balance: ", uint2str(balances[msg.sender] / 10**18), " tokens, ",
            "Status: SUCCESS"
        )), msg.sender);
    }
    
    // Helper function for uint to string conversion
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    // Helper function for address to string conversion
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
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

export const generateSolidityFromFlowchartAI = async (nodes, edges, contractName) => {
  try {
    console.log('🤖 [AIService] Starting Solidity generation from flowchart with Gemini');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured.');
    }

    // Simplify nodes and edges for the prompt
    const simplifiedNodes = nodes.map(n => ({
      id: n.id,
      type: n.data.nodeType,
      label: n.data.label,
      properties: n.data.properties,
    }));

    const simplifiedEdges = edges.map(e => ({
      source: e.source,
      target: e.target,
      label: e.label || 'next',
    }));

    const flowchartJSON = JSON.stringify({ nodes: simplifiedNodes, edges: simplifiedEdges }, null, 2);

    const userPrompt = `Generate a complete, secure, and well-documented Solidity smart contract named ${contractName} that implements the EXACT workflow defined in this flowchart.

FLOWCHART ANALYSIS:
${flowchartJSON}

IMPLEMENTATION REQUIREMENTS:
1. Analyze each node in the flowchart and implement its specific functionality
2. Follow the edge connections to determine execution order
3. Implement loops for repetitive operations (if nodes indicate "create N assets", use a for loop)
4. ONLY emit SendTelegram when the flowchart contains a "send_telegram" node
5. Include node sequence numbers and operation results in Telegram messages
6. Handle conditional logic based on logic nodes (if_else_logic, switch_logic)
7. Implement proper error handling and emit failure notifications

TELEGRAM EMISSION STRATEGY:
- ONLY emit SendTelegram when the flowchart contains "send_telegram" nodes
- Accumulate workflow results and operation details to send when telegram node is reached
- If multiple "send_telegram" nodes exist, emit relevant data for each one
- If NO "send_telegram" nodes exist, do NOT emit any SendTelegram events
- Telegram messages should include comprehensive operation results up to that point

The contract should execute the flowchart logic step-by-step and provide comprehensive monitoring through Telegram notifications.`;

    console.log('🤖 [AIService] Making request to Gemini API for Solidity generation...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SOLIDITY_SYSTEM_PROMPT}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AIService] Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ [AIService] Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    let contractCode = data.candidates[0].content.parts[0].text.trim();
    contractCode = cleanAIGeneratedCode(contractCode);

    console.log('✅ [AIService] Successfully generated Solidity from flowchart with Gemini.');

    return {
      success: true,
      contractCode: contractCode
    };

  } catch (error) {
    console.error('❌ [AIService] AI Solidity generation from flowchart failed:', error);
    
    // Fallback contract with SendTelegram event
    const fallbackContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract ${contractName} {
    address public owner;
    
    event SendTelegram(string message, address indexed user);
    event WorkflowExecuted(address indexed user, string action);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function executeWorkflow(string memory message) public {
        // Demonstrate flowchart-based node execution
        uint256[] memory assetIds = new uint256[](3);
        
        // Node 1: Trigger (no telegram emission - just start workflow)
        emit WorkflowExecuted(msg.sender, "trigger_executed");
        
        // Node 2: Action (perform operations but don't emit telegram yet)
        uint256 operationsCount = 3;
        for (uint i = 0; i < operationsCount; i++) {
            assetIds[i] = (block.timestamp + i) % 10000;
            emit WorkflowExecuted(msg.sender, "asset_created");
            // Store results but don't emit SendTelegram
        }
        
        // Node 3: Send Telegram (ONLY NOW emit SendTelegram with all results)
        emit WorkflowExecuted(msg.sender, "telegram_sent");
        emit SendTelegram(string(abi.encodePacked(
            "Workflow Results: Created ", uint2str(operationsCount), " assets: ",
            "Asset IDs: ", uint2str(assetIds[0]), ", ", uint2str(assetIds[1]), ", ", uint2str(assetIds[2]), ". ",
            "Block: ", uint2str(block.number), ", ",
            "User: ", addressToString(msg.sender)
        )), msg.sender);
        
        // Note: If flowchart had NO send_telegram node, then NO SendTelegram would be emitted
    }
    
    // Helper function for uint to string conversion
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    // Helper function for address to string conversion
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
    
    function updateOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}`;

    return {
        success: false,
        error: error.message,
        contractCode: fallbackContract
    };
  }
};

export const generateRustFromSolidityFunction = async (solidityFunction) => {
  try {
    console.log('🤖 [AIService] Starting Rust generation from Solidity function with Gemini');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured.');
    }

    const userPrompt = `You are an expert Rust developer specializing in PolkaVM smart contracts. Convert the following Solidity function into a complete, secure, and well-documented Rust smart contract that can be deployed on PolkaVM.

Solidity Function:
\`\`\`solidity
${solidityFunction}
\`\`\`

CRITICAL REQUIREMENTS:
1.  Create a complete Rust smart contract, not just the function body.
2.  Use the \`#![no_std]\` and \`#![no_main]\` attributes.
3.  Include the necessary PolkaVM boilerplate, including \`deploy\` and \`call\` functions.
4.  The \`call\` function should handle the routing to the converted function.
5.  Use appropriate Rust data types that correspond to the Solidity types.
6.  Implement proper error handling.
7.  Return ONLY raw Rust code, no markdown formatting.

Example Output:
\`\`\`rust
#![no_main]
#![no_std]

use uapi::{HostFn, HostFnImpl as api, ReturnFlags};

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    // Safety: The unimp instruction is guaranteed to trap
    unsafe {
        core::arch::asm!("unimp");
        core::hint::unreachable_unchecked();
    }
}

/// This is the constructor which is called once per contract.
#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn deploy() {}

/// This is the regular entry point when the contract is called.
#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn call() {
    // Your implementation here
}

// Your converted function here
\`\`\`
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AIService] Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ [AIService] Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    let rustCode = data.candidates[0].content.parts[0].text.trim();
    rustCode = cleanAIGeneratedCode(rustCode);

    console.log('✅ [AIService] Successfully generated Rust from Solidity with Gemini.');

    return {
      success: true,
      rustCode: rustCode
    };

  } catch (error) {
    console.error('❌ [AIService] AI Rust generation from Solidity failed:', error);
    
    return {
        success: false,
        error: error.message,
        rustCode: `// Failed to generate Rust code: ${error.message}`
    };
  }
};

export const generateSolidityWrapper = async (rustContracts, contractName) => {
  try {
    console.log('🤖 [AIService] Starting Solidity wrapper generation with Gemini');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured.');
    }

    const contractInterfaces = rustContracts.map(c => `
interface I${c.name} {
  function ${c.functionSignature} external;
}
    `).join('');

    const contractInstances = rustContracts.map(c => `
  I${c.name} public ${c.name.toLowerCase()} = I${c.name}(${c.address});
    `).join('');

    const userPrompt = `You are an expert Solidity smart contract developer. Create a wrapper contract named ${contractName} that interacts with the following deployed Rust contracts.

Rust Contracts:
\`\`\`
${JSON.stringify(rustContracts, null, 2)}
\`\`\`

CRITICAL REQUIREMENTS:
1.  Create a complete Solidity smart contract that can be deployed.
2.  For each Rust contract, define an interface and create an instance of it using its deployed address.
3.  Create a public function for each function in the Rust contracts that calls the corresponding function in the Rust contract.
4.  Return ONLY raw Solidity code, no markdown formatting.

Example Output:
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

${contractInterfaces}

contract ${contractName} {
  ${contractInstances}

  // Wrapper functions here
}
\`\`\`
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AIService] Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ [AIService] Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    let contractCode = data.candidates[0].content.parts[0].text.trim();
    contractCode = cleanAIGeneratedCode(contractCode);

    console.log('✅ [AIService] Successfully generated Solidity wrapper with Gemini.');

    return {
      success: true,
      contractCode: contractCode
    };

  } catch (error) {
    console.error('❌ [AIService] AI Solidity wrapper generation failed:', error);
    
    return {
        success: false,
        error: error.message,
        contractCode: `// Failed to generate Solidity wrapper: ${error.message}`
    };
  }
}; 