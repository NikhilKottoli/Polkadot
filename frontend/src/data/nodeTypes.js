// src/data/nodeTypes.js
import {
  Zap,
  Database,
  GitBranch,
  Bridge,
  Send,
  Clock,
  Wallet,
  Vote,
  FileText,
  Globe,
  Calculator,
  Timer,
  RotateCcw,
  Filter,
  MessageSquare,
  Mail,
  Webhook,
  Sheet,
} from "lucide-react";

export const NODE_CATEGORIES = {
  TRIGGER: "trigger",
  ACTION: "action",
  LOGIC: "logic",
  BRIDGE: "bridge",
  OUTPUT: "output",
};

export const NODE_TYPES = {
  // Trigger Nodes
  NEW_ASSET_CREATED: {
    id: "new_asset_created",
    name: "New Asset Created",
    category: NODE_CATEGORIES.TRIGGER,
    icon: Database,
    color: "bg-green-500",
    inputs: [],
    outputs: ["asset_data"],
    properties: {
      assetHub: { type: "select", label: "Asset Hub", required: true },
      assetType: { type: "text", label: "Asset Type Filter" },
    },
  },
  ASSET_TRANSFER_DETECTED: {
    id: "asset_transfer_detected",
    name: "Asset Transfer Detected",
    category: NODE_CATEGORIES.TRIGGER,
    icon: Send,
    color: "bg-green-500",
    inputs: [],
    outputs: ["transfer_data"],
    properties: {
      address: { type: "text", label: "Watch Address", required: true },
      assetId: { type: "text", label: "Asset ID" },
      minAmount: { type: "number", label: "Minimum Amount" },
    },
  },
  BALANCE_THRESHOLD: {
    id: "balance_threshold",
    name: "Balance Threshold",
    category: NODE_CATEGORIES.TRIGGER,
    icon: Wallet,
    color: "bg-green-500",
    inputs: [],
    outputs: ["balance_data"],
    properties: {
      address: { type: "text", label: "Address", required: true },
      threshold: { type: "number", label: "Threshold Amount", required: true },
      operator: {
        type: "select",
        label: "Operator",
        options: [">", "<", ">=", "<=", "=="],
      },
    },
  },
  GOVERNANCE_PROPOSAL: {
    id: "governance_proposal",
    name: "Governance Proposal",
    category: NODE_CATEGORIES.TRIGGER,
    icon: Vote,
    color: "bg-green-500",
    inputs: [],
    outputs: ["proposal_data"],
    properties: {
      network: { type: "select", label: "Network", required: true },
      proposalType: { type: "select", label: "Proposal Type" },
    },
  },
  TIME_TRIGGER: {
    id: "time_trigger",
    name: "Time Trigger",
    category: NODE_CATEGORIES.TRIGGER,
    icon: Clock,
    color: "bg-green-500",
    inputs: [],
    outputs: ["timestamp"],
    properties: {
      interval: {
        type: "select",
        label: "Interval",
        options: ["1m", "5m", "15m", "1h", "1d"],
      },
      cron: { type: "text", label: "Cron Expression" },
    },
  },

  // Action Nodes
  TRANSFER_ASSET: {
    id: "transfer_asset",
    name: "Transfer Asset",
    category: NODE_CATEGORIES.ACTION,
    icon: Send,
    color: "bg-blue-500",
    inputs: ["trigger_data"],
    outputs: ["transaction_hash"],
    properties: {
      toAddress: { type: "text", label: "To Address", required: true },
      amount: { type: "number", label: "Amount", required: true },
      assetId: { type: "text", label: "Asset ID" },
    },
  },
  MINT_BURN_ASSET: {
    id: "mint_burn_asset",
    name: "Mint/Burn Asset",
    category: NODE_CATEGORIES.ACTION,
    icon: Database,
    color: "bg-blue-500",
    inputs: ["trigger_data"],
    outputs: ["transaction_hash"],
    properties: {
      action: {
        type: "select",
        label: "Action",
        options: ["mint", "burn"],
        required: true,
      },
      amount: { type: "number", label: "Amount", required: true },
      assetId: { type: "text", label: "Asset ID", required: true },
    },
  },
  GOVERNANCE_VOTE: {
    id: "governance_vote",
    name: "Execute Vote",
    category: NODE_CATEGORIES.ACTION,
    icon: Vote,
    color: "bg-blue-500",
    inputs: ["proposal_data"],
    outputs: ["vote_hash"],
    properties: {
      vote: {
        type: "select",
        label: "Vote",
        options: ["aye", "nay"],
        required: true,
      },
      conviction: {
        type: "select",
        label: "Conviction",
        options: ["None", "0.1x", "1x", "2x", "3x", "4x", "5x", "6x"],
      },
    },
  },

  // Logic Nodes
  IF_ELSE: {
    id: "if_else",
    name: "If/Else Condition",
    category: NODE_CATEGORIES.LOGIC,
    icon: GitBranch,
    color: "bg-purple-500",
    inputs: ["input_data"],
    outputs: ["true_output", "false_output"],
    properties: {
      field: { type: "text", label: "Field to Check", required: true },
      operator: {
        type: "select",
        label: "Operator",
        options: ["==", "!=", ">", "<", ">=", "<="],
        required: true,
      },
      value: { type: "text", label: "Compare Value", required: true },
    },
  },
  DELAY: {
    id: "delay",
    name: "Delay",
    category: NODE_CATEGORIES.LOGIC,
    icon: Timer,
    color: "bg-purple-500",
    inputs: ["input_data"],
    outputs: ["delayed_output"],
    properties: {
      duration: { type: "number", label: "Duration (seconds)", required: true },
    },
  },
  MATH_OPERATION: {
    id: "math_operation",
    name: "Math Operation",
    category: NODE_CATEGORIES.LOGIC,
    icon: Calculator,
    color: "bg-purple-500",
    inputs: ["number_input"],
    outputs: ["result"],
    properties: {
      operation: {
        type: "select",
        label: "Operation",
        options: ["+", "-", "*", "/", "%"],
        required: true,
      },
      operand: { type: "number", label: "Operand", required: true },
    },
  },

  // Bridge Nodes
  EVM_BRIDGE: {
    id: "evm_bridge",
    name: "EVM Chain Bridge",
    category: NODE_CATEGORIES.BRIDGE,
    icon: Bridge,
    color: "bg-orange-500",
    inputs: ["substrate_data"],
    outputs: ["evm_data"],
    properties: {
      evmChain: {
        type: "select",
        label: "EVM Chain",
        options: ["moonbeam", "ethereum", "polygon"],
        required: true,
      },
      contractAddress: { type: "text", label: "Contract Address" },
    },
  },
  ORACLE_NODE: {
    id: "oracle_node",
    name: "Oracle Data",
    category: NODE_CATEGORIES.BRIDGE,
    icon: Globe,
    color: "bg-orange-500",
    inputs: ["trigger_data"],
    outputs: ["oracle_data"],
    properties: {
      oracleProvider: {
        type: "select",
        label: "Oracle Provider",
        options: ["chainlink", "band"],
        required: true,
      },
      dataFeed: { type: "text", label: "Data Feed", required: true },
    },
  },

  // Output Nodes
  WEBHOOK: {
    id: "webhook",
    name: "Webhook",
    category: NODE_CATEGORIES.OUTPUT,
    icon: Webhook,
    color: "bg-red-500",
    inputs: ["data"],
    outputs: [],
    properties: {
      url: { type: "text", label: "Webhook URL", required: true },
      method: {
        type: "select",
        label: "Method",
        options: ["POST", "PUT", "PATCH"],
        required: true,
      },
      headers: { type: "textarea", label: "Headers (JSON)" },
    },
  },
  DISCORD_MESSAGE: {
    id: "discord_message",
    name: "Discord Message",
    category: NODE_CATEGORIES.OUTPUT,
    icon: MessageSquare,
    color: "bg-red-500",
    inputs: ["message_data"],
    outputs: [],
    properties: {
      webhookUrl: {
        type: "text",
        label: "Discord Webhook URL",
        required: true,
      },
      message: { type: "textarea", label: "Message Template", required: true },
    },
  },
  EMAIL_NOTIFICATION: {
    id: "email_notification",
    name: "Email Notification",
    category: NODE_CATEGORIES.OUTPUT,
    icon: Mail,
    color: "bg-red-500",
    inputs: ["email_data"],
    outputs: [],
    properties: {
      to: { type: "text", label: "To Email", required: true },
      subject: { type: "text", label: "Subject", required: true },
      body: { type: "textarea", label: "Email Body", required: true },
    },
  },
};

export const getNodesByCategory = (category) => {
  return Object.values(NODE_TYPES).filter((node) => node.category === category);
};

export const getNodeType = (nodeId) => {
  return NODE_TYPES[nodeId];
};
