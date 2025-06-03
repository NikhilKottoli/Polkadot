import CustomNode from "./components/Node/CustomNode";

// Example nodes data
export const initialNodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 50, y: 50 },
    data: {
      category: "trigger",
      nodeIcon: "🪙",
      label: "Asset Transfer Detected",
      description: "Monitors on-chain asset transfers in real-time",
      properties: {
        chain: "Polkadot",
        asset: "DOT",
        threshold: "100",
      },
      status: "active",
    },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 450, y: 50 },
    data: {
      category: "action",
      nodeIcon: "💥",
      label: "Burn Token",
      description: "Burns specified amount of tokens from account",
      properties: {
        amount: "50",
        token: "USDT",
      },
      status: "pending",
    },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 50, y: 300 },
    data: {
      category: "logic",
      nodeIcon: "🧠",
      label: "If/Else Logic",
      description: "Conditional branching based on input data",
      properties: {
        condition: "amount > 100",
        branches: 2,
      },
      status: "active",
    },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 450, y: 300 },
    data: {
      category: "bridge",
      nodeIcon: "🔗",
      label: "Polkadot Bridge",
      description: "Cross-chain asset transfer via bridge",
      properties: {
        from: "AssetHub",
        to: "Moonbeam",
        fee: "0.1 DOT",
      },
      status: "active",
    },
  },
  {
    id: "5",
    type: "custom",
    position: { x: 250, y: 550 },
    data: {
      category: "wallet",
      nodeIcon: "🔐",
      label: "Sign Transaction",
      description: "Request user signature for transaction",
      properties: {
        method: "WalletConnect",
        timeout: "30s",
      },
      status: "waiting",
    },
  },
  {
    id: "6",
    type: "custom",
    position: { x: 650, y: 200 },
    data: {
      category: "ai",
      label: "AI Assistant",
      description: "Process data using AI models",
      properties: {
        model: "GPT-4",
        temperature: "0.7",
      },
      status: "active",
    },
  },
];

// Enhanced edges with better styling
export const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#6366f1" },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#10b981" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#f59e0b" },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#6366f1" },
  },
  {
    id: "e2-6",
    source: "2",
    target: "6",
    animated: true,
    style: { stroke: "#ec4899", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#ec4899" },
  },
];

export const panOnDrag = [1, 2];

// Define custom node types
export const nodeTypes = {
  custom: CustomNode,
};
