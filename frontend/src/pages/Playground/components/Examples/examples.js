import CustomNode from "..//Node/CustomNode";

// Example nodes data

// Sample Workflow 1: Automated Asset Management
export const assetManagementWorkflow = [
  {
    id: "trigger_1",
    type: "custom",
    position: { x: 50, y: 100 },
    data: {
      category: "trigger",
      nodeIcon: "🪙",
      label: "Asset Transfer Detected",
      description: "Monitors large DOT transfers on Polkadot network",
      properties: {
        asset_id: "DOT",
        min_amount: "1000",
        from_address: "",
        to_address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      },
      status: "active",
      nodeType: "asset_transfer_detected",
    },
  },
  {
    id: "logic_1",
    type: "custom",
    position: { x: 350, y: 100 },
    data: {
      category: "logic",
      nodeIcon: "🧠",
      label: "Amount Threshold Check",
      description: "Check if transfer amount exceeds 5000 DOT",
      properties: {
        condition_type: "greater_than",
        compare_value: "5000",
        case_sensitive: false,
      },
      status: "active",
      nodeType: "if_else_logic",
    },
  },
  {
    id: "action_1",
    type: "custom",
    position: { x: 650, y: 50 },
    data: {
      category: "action",
      nodeIcon: "📤",
      label: "Alert Webhook",
      description: "Send high-value transfer alert to monitoring system",
      properties: {
        url: "https://api.example.com/alerts/high-value-transfer",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      status: "active",
      nodeType: "send_webhook",
    },
  },
  {
    id: "action_2",
    type: "custom",
    position: { x: 650, y: 150 },
    data: {
      category: "action",
      nodeIcon: "💥",
      label: "Auto Burn Tokens",
      description: "Automatically burn 1% of transferred amount",
      properties: {
        asset_id: "DOT",
        amount: "dynamic", // Will be calculated from trigger
        beneficiary: "",
      },
      status: "pending",
      nodeType: "burn_token",
    },
  },
];

// Sample Workflow 2: Cross-Chain DeFi Automation
export const defiAutomationWorkflow = [
  {
    id: "trigger_2",
    type: "custom",
    position: { x: 50, y: 300 },
    data: {
      category: "trigger",
      nodeIcon: "📈",
      label: "DOT Price Alert",
      description: "Trigger when DOT price drops below $6.50",
      properties: {
        asset_symbol: "DOT",
        threshold_price: 6.5,
        condition: "below",
      },
      status: "active",
      nodeType: "price_threshold",
    },
  },
  {
    id: "bridge_1",
    type: "custom",
    position: { x: 350, y: 300 },
    data: {
      category: "bridge",
      nodeIcon: "🖇️",
      label: "Buy The Dip",
      description: "Swap USDT for DOT on HydraDX when price drops",
      properties: {
        dex_protocol: "HydraDX",
        slippage_tolerance: 2,
        min_output_amount: 100,
      },
      status: "active",
      nodeType: "token_swap",
    },
  },
  {
    id: "bridge_2",
    type: "custom",
    position: { x: 650, y: 300 },
    data: {
      category: "bridge",
      nodeIcon: "🔗",
      label: "Bridge to Moonbeam",
      description: "Bridge purchased DOT to Moonbeam for staking",
      properties: {
        source_chain: "AssetHub",
        destination_chain: "Moonbeam",
        bridge_fee: 0.1,
      },
      status: "pending",
      nodeType: "polkadot_bridge",
    },
  },
  {
    id: "wallet_1",
    type: "custom",
    position: { x: 950, y: 300 },
    data: {
      category: "wallet",
      nodeIcon: "🔐",
      label: "Sign Bridge Transaction",
      description: "Request user signature for cross-chain transfer",
      properties: {
        require_confirmation: true,
        timeout_seconds: 120,
      },
      status: "waiting",
      nodeType: "sign_transaction",
    },
  },
];

// Sample Workflow 3: Governance Automation with AI
export const governanceAIWorkflow = [
  {
    id: "trigger_3",
    type: "custom",
    position: { x: 50, y: 500 },
    data: {
      category: "trigger",
      nodeIcon: "🗳️",
      label: "New Referendum",
      description: "Monitor new governance proposals on Polkadot",
      properties: {
        proposal_type: "referendum",
      },
      status: "active",
      nodeType: "governance_proposal",
    },
  },
  {
    id: "ai_1",
    type: "custom",
    position: { x: 350, y: 500 },
    data: {
      category: "ai",
      nodeIcon: "🧠",
      label: "Proposal Analysis",
      description: "Analyze proposal content using Gemini AI",
      properties: {
        model: "gemini-1.5-flash",
        max_tokens: 500,
        temperature: 0.3,
      },
      status: "active",
      nodeType: "gemini_completion",
    },
  },
  {
    id: "logic_2",
    type: "custom",
    position: { x: 650, y: 450 },
    data: {
      category: "logic",
      nodeIcon: "🧩",
      label: "Format Analysis",
      description: "Format AI analysis for notification",
      properties: {
        input_format: "json",
        output_format: "string",
        custom_template:
          "Governance Alert: {{title}}\nRecommendation: {{recommendation}}\nRisk Level: {{risk}}",
      },
      status: "active",
      nodeType: "data_formatter",
    },
  },
  {
    id: "action_3",
    type: "custom",
    position: { x: 650, y: 550 },
    data: {
      category: "action",
      nodeIcon: "📧",
      label: "Email Notification",
      description: "Send governance analysis to stakeholders",
      properties: {
        to_email: "governance@dao.org",
        subject: "New Polkadot Referendum Analysis",
        template:
          "Automated analysis of referendum {{proposal_id}} is ready for review.",
      },
      status: "pending",
      nodeType: "send_email",
    },
  },
];

// Sample Workflow 4: Scheduled Portfolio Rebalancing
export const portfolioRebalancingWorkflow = [
  {
    id: "trigger_4",
    type: "custom",
    position: { x: 50, y: 700 },
    data: {
      category: "trigger",
      nodeIcon: "🕒",
      label: "Weekly Rebalance",
      description: "Trigger portfolio rebalancing every Sunday at midnight",
      properties: {
        cron_expression: "0 0 * * 0",
        timezone: "UTC",
      },
      status: "active",
      nodeType: "scheduled_time",
    },
  },
  {
    id: "trigger_5",
    type: "custom",
    position: { x: 50, y: 800 },
    data: {
      category: "trigger",
      nodeIcon: "💰",
      label: "Balance Monitor",
      description: "Check current portfolio balance",
      properties: {
        account_address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        asset_id: "DOT",
        threshold_amount: 0,
      },
      status: "active",
      nodeType: "balance_change_detected",
    },
  },
  {
    id: "logic_3",
    type: "custom",
    position: { x: 350, y: 750 },
    data: {
      category: "logic",
      nodeIcon: "🧮",
      label: "Calculate Rebalance",
      description: "Calculate optimal portfolio distribution",
      properties: {
        operation: "multiply",
        decimal_places: 2,
      },
      status: "active",
      nodeType: "math_operation",
    },
  },
  {
    id: "action_4",
    type: "custom",
    position: { x: 650, y: 700 },
    data: {
      category: "action",
      nodeIcon: "🪙",
      label: "Rebalance Transfer",
      description: "Execute rebalancing transfers",
      properties: {
        to_address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        amount: 0, // Dynamic from calculation
        asset_id: "DOT",
        memo: "Weekly portfolio rebalancing",
      },
      status: "pending",
      nodeType: "transfer_token",
    },
  },
  {
    id: "action_5",
    type: "custom",
    position: { x: 650, y: 800 },
    data: {
      category: "action",
      nodeIcon: "📤",
      label: "Rebalance Report",
      description: "Send rebalancing summary report",
      properties: {
        url: "https://api.portfolio-tracker.com/rebalance-report",
        method: "POST",
        headers: { Authorization: "Bearer {{api_key}}" },
      },
      status: "pending",
      nodeType: "send_webhook",
    },
  },
];

// Sample Workflow 5: New Asset Creation Pipeline
export const assetCreationWorkflow = [
  {
    id: "trigger_6",
    type: "custom",
    position: { x: 50, y: 1000 },
    data: {
      category: "trigger",
      nodeIcon: "🧾",
      label: "New Asset Created",
      description: "Monitor new asset creation on AssetHub",
      properties: {
        creator_address: "",
        asset_name_pattern: "MEME*",
      },
      status: "active",
      nodeType: "new_asset_created",
    },
  },
  {
    id: "ai_2",
    type: "custom",
    position: { x: 350, y: 1000 },
    data: {
      category: "ai",
      nodeIcon: "🧠",
      label: "Asset Risk Analysis",
      description: "Analyze new asset metadata for risks",
      properties: {
        model: "gemini-1.5-flash",
        max_tokens: 300,
        temperature: 0.2,
      },
      status: "active",
      nodeType: "gemini_completion",
    },
  },
  {
    id: "logic_4",
    type: "custom",
    position: { x: 650, y: 950 },
    data: {
      category: "logic",
      nodeIcon: "🧠",
      label: "Risk Evaluation",
      description: "Evaluate if asset passes risk threshold",
      properties: {
        condition_type: "contains",
        compare_value: "HIGH_RISK",
        case_sensitive: false,
      },
      status: "active",
      nodeType: "if_else_logic",
    },
  },
  {
    id: "action_6",
    type: "custom",
    position: { x: 950, y: 900 },
    data: {
      category: "action",
      nodeIcon: "📧",
      label: "Risk Alert",
      description: "Alert about high-risk asset creation",
      properties: {
        to_email: "security@platform.com",
        subject: "HIGH RISK Asset Created",
        template: "Asset {{asset_id}} flagged as high risk. Review required.",
      },
      status: "pending",
      nodeType: "send_email",
    },
  },
  {
    id: "wallet_2",
    type: "custom",
    position: { x: 950, y: 1000 },
    data: {
      category: "wallet",
      nodeIcon: "🧾",
      label: "Generate Tracking Wallet",
      description: "Create dedicated wallet for asset monitoring",
      properties: {
        mnemonic_length: "12",
        derivation_path: "//asset-monitor",
      },
      status: "pending",
      nodeType: "generate_wallet",
    },
  },
];

// Enhanced edges for all workflows
export const workflowEdges = [
  // Asset Management Workflow
  {
    id: "e1-2",
    source: "trigger_1",
    target: "logic_1",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#6366f1" },
    label: "transfer_data",
  },
  {
    id: "e2-3",
    source: "logic_1",
    target: "action_1",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#10b981" },
    label: "true",
  },
  {
    id: "e2-4",
    source: "logic_1",
    target: "action_2",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#f59e0b" },
    label: "false",
  },

  // DeFi Automation Workflow
  {
    id: "e3-4",
    source: "trigger_2",
    target: "bridge_1",
    animated: true,
    style: { stroke: "#ec4899", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#ec4899" },
    label: "price_data",
  },
  {
    id: "e4-5",
    source: "bridge_1",
    target: "bridge_2",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#8b5cf6" },
    label: "output_token",
  },
  {
    id: "e5-6",
    source: "bridge_2",
    target: "wallet_1",
    animated: true,
    style: { stroke: "#06b6d4", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#06b6d4" },
    label: "bridged_asset",
  },

  // Governance AI Workflow
  {
    id: "e6-7",
    source: "trigger_3",
    target: "ai_1",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#f97316" },
    label: "proposal_data",
  },
  {
    id: "e7-8",
    source: "ai_1",
    target: "logic_2",
    animated: true,
    style: { stroke: "#84cc16", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#84cc16" },
    label: "completion_output",
  },
  {
    id: "e7-9",
    source: "ai_1",
    target: "action_3",
    animated: true,
    style: { stroke: "#14b8a6", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#14b8a6" },
    label: "completion_output",
  },

  // Portfolio Rebalancing Workflow
  {
    id: "e8-9",
    source: "trigger_4",
    target: "logic_3",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#6366f1" },
    label: "time_event",
  },
  {
    id: "e9-10",
    source: "trigger_5",
    target: "logic_3",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#10b981" },
    label: "balance_data",
  },
  {
    id: "e10-11",
    source: "logic_3",
    target: "action_4",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#f59e0b" },
    label: "result",
  },
  {
    id: "e10-12",
    source: "logic_3",
    target: "action_5",
    animated: true,
    style: { stroke: "#ec4899", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#ec4899" },
    label: "result",
  },

  // Asset Creation Workflow
  {
    id: "e11-12",
    source: "trigger_6",
    target: "ai_2",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#8b5cf6" },
    label: "asset_data",
  },
  {
    id: "e12-13",
    source: "ai_2",
    target: "logic_4",
    animated: true,
    style: { stroke: "#06b6d4", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#06b6d4" },
    label: "completion_output",
  },
  {
    id: "e13-14",
    source: "logic_4",
    target: "action_6",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#f97316" },
    label: "true",
  },
  {
    id: "e13-15",
    source: "logic_4",
    target: "wallet_2",
    animated: true,
    style: { stroke: "#84cc16", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#84cc16" },
    label: "false",
  },
];

// Combined initial nodes for demo
export const initialNodes = [
  ...assetManagementWorkflow,
  ...defiAutomationWorkflow,
  ...governanceAIWorkflow,
  ...portfolioRebalancingWorkflow,
  ...assetCreationWorkflow,
];

// Combined edges
export const initialEdges = workflowEdges;

// Pan and zoom settings
export const panOnDrag = [1, 2];

// Define custom node types
export const nodeTypes = {
  custom: CustomNode,
};

// Workflow descriptions for documentation
export const workflowDescriptions = {
  assetManagement: {
    title: "Automated Asset Management",
    description:
      "Monitors large asset transfers and automatically burns tokens or sends alerts based on transfer amounts.",
    nodes: [
      "Asset Transfer Detected",
      "Amount Threshold Check",
      "Alert Webhook",
      "Auto Burn Tokens",
    ],
    useCase: "Risk management and automatic token deflation",
  },
  defiAutomation: {
    title: "Cross-Chain DeFi Automation",
    description:
      "Automatically buys DOT when price drops, then bridges it to Moonbeam for staking.",
    nodes: [
      "DOT Price Alert",
      "Buy The Dip",
      "Bridge to Moonbeam",
      "Sign Bridge Transaction",
    ],
    useCase: "Automated DeFi trading and yield optimization",
  },
  governanceAI: {
    title: "AI-Powered Governance Analysis",
    description:
      "Uses AI to analyze new governance proposals and automatically sends formatted analysis to stakeholders.",
    nodes: [
      "New Referendum",
      "Proposal Analysis",
      "Format Analysis",
      "Email Notification",
    ],
    useCase: "Automated governance participation and analysis",
  },
  portfolioRebalancing: {
    title: "Scheduled Portfolio Rebalancing",
    description:
      "Automatically rebalances portfolio weekly based on predefined rules and sends execution reports.",
    nodes: [
      "Weekly Rebalance",
      "Balance Monitor",
      "Calculate Rebalance",
      "Rebalance Transfer",
      "Rebalance Report",
    ],
    useCase: "Automated portfolio management",
  },
  assetCreation: {
    title: "Asset Creation Monitoring Pipeline",
    description:
      "Monitors new asset creation, analyzes risk using AI, and takes appropriate actions based on risk level.",
    nodes: [
      "New Asset Created",
      "Asset Risk Analysis",
      "Risk Evaluation",
      "Risk Alert",
      "Generate Tracking Wallet",
    ],
    useCase: "Security monitoring and risk assessment",
  },
};

// Export utility functions
export const getWorkflowByName = (workflowName) => {
  const workflows = {
    assetManagement: assetManagementWorkflow,
    defiAutomation: defiAutomationWorkflow,
    governanceAI: governanceAIWorkflow,
    portfolioRebalancing: portfolioRebalancingWorkflow,
    assetCreation: assetCreationWorkflow,
  };
  return workflows[workflowName] || [];
};

export const getAllWorkflows = () => {
  return {
    assetManagement: assetManagementWorkflow,
    defiAutomation: defiAutomationWorkflow,
    governanceAI: governanceAIWorkflow,
    portfolioRebalancing: portfolioRebalancingWorkflow,
    assetCreation: assetCreationWorkflow,
  };
};
