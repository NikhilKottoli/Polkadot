// hooks/useNodeOperations.js
import { useCallback } from "react";
import useBoardStore from "../store/boardStore";

export const useNodeOperations = () => {
  const { addNode, deleteNode, updateNode, duplicateNode, getCurrentProject } =
    useBoardStore();

  const createNodeOnTap = useCallback(
    (nodeType, position, additionalData = {}) => {
      const currentProject = getCurrentProject();
      if (!currentProject) return null;

      const nodeId = `node_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newNode = {
        id: nodeId,
        type: "custom",
        position,
        data: {
          category: nodeType,
          nodeIcon: getNodeIcon(nodeType),
          label: `${nodeType} Node`,
          description: `New ${nodeType} node`,
          properties: {},
          status: "pending",
          nodeType: nodeType,
          ...additionalData,
        },
      };

      addNode(newNode);
      return nodeId;
    },
    [addNode, getCurrentProject]
  );

  const addNodeBetweenEdge = useCallback(
    (edgeId, nodeType, additionalData = {}) => {
      const currentProject = getCurrentProject();
      if (!currentProject) return null;

      const edges = currentProject.edges;
      const targetEdge = edges.find((edge) => edge.id === edgeId);

      if (!targetEdge) return null;

      // Calculate position between source and target nodes
      const sourceNode = currentProject.nodes.find(
        (n) => n.id === targetEdge.source
      );
      const targetNode = currentProject.nodes.find(
        (n) => n.id === targetEdge.target
      );

      if (!sourceNode || !targetNode) return null;

      const position = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      };

      const nodeId = createNodeOnTap(nodeType, position, additionalData);

      if (nodeId) {
        // Remove original edge and create two new edges
        const { deleteEdge, onConnect } = useBoardStore.getState();

        deleteEdge(edgeId);

        // Connect source to new node
        onConnect({
          source: targetEdge.source,
          target: nodeId,
          sourceHandle: targetEdge.sourceHandle,
        });

        // Connect new node to target
        onConnect({
          source: nodeId,
          target: targetEdge.target,
          targetHandle: targetEdge.targetHandle,
        });
      }

      return nodeId;
    },
    [createNodeOnTap, getCurrentProject]
  );

  const getNodeIcon = (nodeType) => {
    const iconMap = {
      trigger: "🚀",
      action: "⚡",
      condition: "🔀",
      data: "📊",
      output: "📤",
      input: "📥",
      process: "⚙️",
      api: "🌐",
      database: "🗄️",
      notification: "🔔",
    };
    return iconMap[nodeType] || "🔧";
  };

  return {
    createNodeOnTap,
    addNodeBetweenEdge,
    deleteNode,
    updateNode,
    duplicateNode,
  };
};
