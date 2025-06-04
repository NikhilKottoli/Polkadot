import { useCallback } from "react";
import useBoardStore from "../../store/store";

export const useNodeOperations = () => {
  const {
    addNode,
    deleteNode,
    updateNode,
    duplicateNode,
    selectedNode,
    setSelectedNode,
  } = useBoardStore();

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

  const selectNode = useCallback(
    (nodeId) => {
      // If the same node is clicked, deselect it
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      } else {
        // Select the new node (this automatically deselects the previous one)
        setSelectedNode(nodeId);
      }
    },
    [selectedNode, setSelectedNode]
  );

  const handleNodeClick = useCallback(
    (event, node) => {
      event.stopPropagation();
      selectNode(node.id);
    },
    [selectNode]
  );

  const handleNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();

      // Select the node when right-clicked
      setSelectedNode(node.id);

      // Return context menu data for the component to handle
      return {
        nodeId: node.id,
        position: { x: event.clientX, y: event.clientY },
      };
    },
    [setSelectedNode]
  );

  const duplicateSelectedNode = useCallback(
    (nodeId) => {
      if (duplicateNode) {
        const newNodeId = duplicateNode(nodeId);
        setSelectedNode(newNodeId);
        return newNodeId;
      }
    },
    [duplicateNode, setSelectedNode]
  );

  const deleteSelectedNode = useCallback(
    (nodeId) => {
      deleteNode(nodeId);
      // Clear selection if the deleted node was selected
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
    },
    [deleteNode, selectedNode, setSelectedNode]
  );

  const resetNodeToDefaults = useCallback(
    (nodeId) => {
      updateNode(nodeId, {
        data: {
          properties: {},
          status: "pending",
        },
      });
    },
    [updateNode]
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

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return {
    createNode,
    deleteNode,
    updateNode,
    duplicateNode,
    updateNodeProperties,
    updateNodeLabel,
    updateNodeStatus,
    // New selection methods
    selectNode,
    selectedNode,
    handleNodeClick,
    handleNodeContextMenu,
    duplicateSelectedNode,
    deleteSelectedNode,
    resetNodeToDefaults,
    clearSelection,
  };
};
