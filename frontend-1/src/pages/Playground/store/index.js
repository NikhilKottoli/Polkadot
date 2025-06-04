import { createContext, useContext, useReducer } from 'react';
import boardReducer from './boardStore';

const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, {
    nodes: [],
    edges: [],
    selectedNode: null,
  });

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  return useContext(BoardContext);
};