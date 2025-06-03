import create from 'zustand';

const useBoardStore = create((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
  })),

  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge],
  })),

  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId),
  })),

  setSelectedNode: (node) => set({ selectedNode: node }),

  updateNodeProperties: (nodeId, properties) => set((state) => ({
    nodes: state.nodes.map((node) => 
      node.id === nodeId ? { ...node, properties: { ...node.properties, ...properties } } : node
    ),
  })),
}));

export default useBoardStore;