// AI Service for OpenAI Integration
const OPENAI_API_KEY = "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";

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