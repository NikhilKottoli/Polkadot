import { useCallback } from "react";
import useBoardStore from "./store";

export const useNodeOperations = () => {
  const { addNode, deleteNode, updateNode, duplicateNode } = useBoardStore();

  const createNode = useCallback(
    (nodeType, position) => {
      const newNode = {
        id: `node_${Date.now()}`,
        type: "custom",
        position,
        data: {
          category: nodeType,
          nodeIcon: "🔧",
          label: `New ${nodeType} Node`,
          description: "Configure this node",
          properties: {},
          status: "pending",
          nodeType: nodeType,
        },
      };

      addNode(newNode);
      return newNode.id;
    },
    [addNode]
  );

  const updateNodeProperties = useCallback(
    (nodeId, properties) => {
      updateNode(nodeId, {
        data: { properties },
      });
    },
    [updateNode]
  );

  const updateNodeLabel = useCallback(
    (nodeId, label) => {
      updateNode(nodeId, {
        data: { label },
      });
    },
    [updateNode]
  );

  const updateNodeStatus = useCallback(
    (nodeId, status) => {
      updateNode(nodeId, {
        data: { status },
      });
    },
    [updateNode]
  );

  return {
    createNode,
    deleteNode,
    updateNode,
    duplicateNode,
    updateNodeProperties,
    updateNodeLabel,
    updateNodeStatus,
  };
};
