import { createContext, useContext, useReducer } from 'react';

const BoardContext = createContext();

const initialState = {
  nodes: [],
  edges: [],
  selectedNode: null,
};

const boardReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
      };
    case 'REMOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
      };
    case 'ADD_EDGE':
      return {
        ...state,
        edges: [...state.edges, action.payload],
      };
    case 'REMOVE_EDGE':
      return {
        ...state,
        edges: state.edges.filter(edge => edge.id !== action.payload),
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
          node.id === action.payload.id ? { ...node, ...action.payload.properties } : node
        ),
      };
    default:
      return state;
  }
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

  return (
    <BoardContext.Provider value={{ state, addNode, removeNode, addEdge, removeEdge, setSelectedNode, updateNodeProperties }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  return useContext(BoardContext);
};