import { createContext, useContext, useReducer } from 'react';

const BoardContext = createContext();

const initialState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  executionOrder: [], // Track execution order
  dataDependencies: {}, // Track data flow between nodes
};

const boardReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        executionOrder: [...state.executionOrder, action.payload.id],
      };
    case 'REMOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        executionOrder: state.executionOrder.filter(id => id !== action.payload),
        dataDependencies: Object.fromEntries(
          Object.entries(state.dataDependencies)
            .filter(([key]) => !key.includes(action.payload))
        ),
      };
    case 'ADD_EDGE':
      // Update data dependencies when adding an edge
      const sourceNode = state.nodes.find(n => n.id === action.payload.source);
      const targetNode = state.nodes.find(n => n.id === action.payload.target);
      const newDependencies = {
        ...state.dataDependencies,
        [`${action.payload.source}->${action.payload.target}`]: {
          sourceType: sourceNode?.data?.nodeType,
          targetType: targetNode?.data?.nodeType,
          label: action.payload.label,
          dataFlow: {
            from: sourceNode?.data?.properties?.output || {},
            to: targetNode?.data?.properties?.input || {},
          },
        },
      };
      return {
        ...state,
        edges: [...state.edges, action.payload],
        dataDependencies: newDependencies,
      };
    case 'REMOVE_EDGE':
      const { [action.payload]: removed, ...remainingDependencies } = state.dataDependencies;
      return {
        ...state,
        edges: state.edges.filter(edge => edge.id !== action.payload),
        dataDependencies: remainingDependencies,
      };
    case 'SET_SELECTED_NODE':
      return {
        ...state,
        selectedNode: action.payload,
      };
    case 'UPDATE_NODE_PROPERTIES':
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id 
            ? { 
                ...node, 
                ...action.payload.properties,
                // Update execution order if sequence changed
                sequence: action.payload.properties.sequence || node.sequence,
              } 
            : node
        ),
      };
    case 'UPDATE_EXECUTION_ORDER':
      return {
        ...state,
        executionOrder: action.payload,
      };
    default:
      return state;
  }
};

// Helper function to detect cycles in the graph
const detectCycles = (nodes, edges) => {
  const visited = new Set();
  const recursionStack = new Set();

  const dfs = (nodeId) => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }
  return false;
};

// Helper function to perform topological sort
const topologicalSort = (nodes, edges) => {
  const visited = new Set();
  const temp = new Set();
  const order = [];

  const visit = (nodeId) => {
    if (temp.has(nodeId)) return; // Cycle detected
    if (visited.has(nodeId)) return;

    temp.add(nodeId);
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      visit(edge.target);
    }
    temp.delete(nodeId);
    visited.add(nodeId);
    order.unshift(nodeId);
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  }

  return order;
};

// Enhanced export function with support for loops and parallel flows
const exportFlowchartForCodegen = (nodes, edges, dataDependencies) => {
  // Helper to find outgoing edges for a node
  const getOutgoingEdges = (nodeId) => edges.filter(edge => edge.source === nodeId);
  
  // Helper to find incoming edges for a node
  const getIncomingEdges = (nodeId) => edges.filter(edge => edge.target === nodeId);
  
  // Helper to find root nodes (nodes with no incoming edges)
  const findRootNodes = () => nodes.filter(node => getIncomingEdges(node.id).length === 0);
  
  // Helper to build a node's next/branches structure
  const buildNodeNext = (nodeId) => {
    const outgoingEdges = getOutgoingEdges(nodeId);
    if (outgoingEdges.length === 0) return null;
    
    const node = nodes.find(n => n.id === nodeId);
    const isLogicNode = node?.data?.nodeType?.includes('logic');
    const isParallelNode = node?.data?.nodeType?.includes('parallel');
    
    if (isLogicNode) {
      // Logic node with true/false branches
      const branches = {};
      outgoingEdges.forEach(edge => {
        branches[edge.label] = {
          target: edge.target,
          dataFlow: dataDependencies[`${nodeId}->${edge.target}`]?.dataFlow || {},
        };
      });
      return { branches };
    } else if (isParallelNode) {
      // Parallel execution
      return {
        parallel: outgoingEdges.map(edge => ({
          target: edge.target,
          dataFlow: dataDependencies[`${nodeId}->${edge.target}`]?.dataFlow || {},
        })),
      };
    } else if (outgoingEdges.length > 1) {
      // Multiple outputs without specific logic
      return {
        next: outgoingEdges.map(edge => ({
          target: edge.target,
          label: edge.label,
          dataFlow: dataDependencies[`${nodeId}->${edge.target}`]?.dataFlow || {},
        })),
      };
    } else {
      // Linear flow
      return {
        next: {
          target: outgoingEdges[0].target,
          dataFlow: dataDependencies[`${nodeId}->${outgoingEdges[0].target}`]?.dataFlow || {},
        },
      };
    }
  };
  
  // Check for cycles (loops)
  const hasLoops = detectCycles(nodes, edges);
  
  // Get execution order
  const executionOrder = topologicalSort(nodes, edges);
  
  // Build the result structure
  const result = {
    nodes: [],
    hasLoops,
    executionOrder,
  };
  
  // Process each node
  const processNode = (nodeId, visited = new Set()) => {
    if (visited.has(nodeId)) return; // Avoid cycles
    visited.add(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const nodeData = {
      id: node.id,
      type: node.type,
      nodeType: node.data.nodeType,
      properties: node.data.properties,
      sequence: node.sequence,
      ...buildNodeNext(nodeId),
    };
    
    result.nodes.push(nodeData);
    
    // Recursively process next nodes
    const outgoingEdges = getOutgoingEdges(nodeId);
    outgoingEdges.forEach(edge => {
      processNode(edge.target, visited);
    });
  };
  
  // Start from root nodes
  const rootNodes = findRootNodes();
  rootNodes.forEach(root => processNode(root.id));
  
  return result;
};

export const BoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const addNode = (node) => {
    dispatch({ type: 'ADD_NODE', payload: node });
  };

  const removeNode = (nodeId) => {
    dispatch({ type: 'REMOVE_NODE', payload: nodeId });
  };

  const addEdge = (edge) => {
    dispatch({ type: 'ADD_EDGE', payload: edge });
  };

  const removeEdge = (edgeId) => {
    dispatch({ type: 'REMOVE_EDGE', payload: edgeId });
  };

  const setSelectedNode = (nodeId) => {
    dispatch({ type: 'SET_SELECTED_NODE', payload: nodeId });
  };

  const updateNodeProperties = (id, properties) => {
    dispatch({ type: 'UPDATE_NODE_PROPERTIES', payload: { id, properties } });
  };

  const updateExecutionOrder = (newOrder) => {
    dispatch({ type: 'UPDATE_EXECUTION_ORDER', payload: newOrder });
  };

  // Expose the export function
  const exportFlowchart = () => exportFlowchartForCodegen(state.nodes, state.edges, state.dataDependencies);

  return (
    <BoardContext.Provider value={{ 
      state, 
      addNode, 
      removeNode, 
      addEdge, 
      removeEdge, 
      setSelectedNode, 
      updateNodeProperties,
      updateExecutionOrder,
      exportFlowchart 
    }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  return useContext(BoardContext);
};