import { createContext, useContext, useReducer } from 'react';

// Initial state for the board
const initialState = {
  nodes: [],
  edges: [],
  selectedNode: null,
};

// Action types
const ADD_NODE = 'ADD_NODE';
const REMOVE_NODE = 'REMOVE_NODE';
const ADD_EDGE = 'ADD_EDGE';
const REMOVE_EDGE = 'REMOVE_EDGE';
const SET_SELECTED_NODE = 'SET_SELECTED_NODE';
const UPDATE_NODE_PROPERTIES = 'UPDATE_NODE_PROPERTIES';

// Reducer function to manage state changes
const boardReducer = (state, action) => {
  switch (action.type) {
    case ADD_NODE:
      return { ...state, nodes: [...state.nodes, action.payload] };
    case REMOVE_NODE:
      return { ...state, nodes: state.nodes.filter(node => node.id !== action.payload) };
    case ADD_EDGE:
      return { ...state, edges: [...state.edges, action.payload] };
    case REMOVE_EDGE:
      return { ...state, edges: state.edges.filter(edge => edge.id !== action.payload) };
    case SET_SELECTED_NODE:
      return { ...state, selectedNode: action.payload };
    case UPDATE_NODE_PROPERTIES:
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id ? { ...node, properties: action.payload.properties } : node
        ),
      };
    default:
      return state;
  }
};

// Create context for the board store
const BoardContext = createContext();

// Provider component to wrap the application
export const BoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const addNode = (node) => dispatch({ type: ADD_NODE, payload: node });
  const removeNode = (nodeId) => dispatch({ type: REMOVE_NODE, payload: nodeId });
  const addEdge = (edge) => dispatch({ type: ADD_EDGE, payload: edge });
  const removeEdge = (edgeId) => dispatch({ type: REMOVE_EDGE, payload: edgeId });
  const setSelectedNode = (nodeId) => dispatch({ type: SET_SELECTED_NODE, payload: nodeId });
  const updateNodeProperties = (id, properties) => dispatch({ type: UPDATE_NODE_PROPERTIES, payload: { id, properties } });

  return (
    <BoardContext.Provider value={{ state, addNode, removeNode, addEdge, removeEdge, setSelectedNode, updateNodeProperties }}>
      {children}
    </BoardContext.Provider>
  );
};

// Custom hook to use the board store
export const useBoardStore = () => {
  return useContext(BoardContext);
};