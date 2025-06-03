import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from "@xyflow/react";

import { NODE_TYPES } from "../pages/Playground/components/Node/NodeTypes";
import {
  initialEdges,
  initialNodes,
} from "../pages/Playground/components/Examples/examples";

// Utility function to generate unique IDs
const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default edge styles
const defaultEdgeStyle = {
  animated: true,
  style: { stroke: "#666666", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#666666" },
};

// Node category colors for edges
const categoryColors = {
  trigger: "#6366f1",
  logic: "#10b981",
  action: "#f59e0b",
  bridge: "#ec4899",
  ai: "#8b5cf6",
  wallet: "#06b6d4",
};

const useFlowStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Core Flow State
      nodes: initialNodes,
      edges: initialEdges,
      NODE_TYPES,

      // UI State
      selectedNode: null,
      selectedEdge: null,
      selectedNodes: [],
      selectedElements: [],
      isConnecting: false,
      connectionNodeId: null,
      connectionHandleId: null,

      // Flow Settings
      snapToGrid: false,
      snapGrid: [20, 20],
      panOnScroll: true,
      selectionOnDrag: true,
      panOnDrag: [1, 2],
      fitViewOnInit: true,

      // Node Management Actions
      setNodes: (nodes) => set({ nodes }, false, "setNodes"),

      setEdges: (edges) => set({ edges }, false, "setEdges"),

      onNodesChange: (changes) =>
        set(
          (state) => ({
            nodes: applyNodeChanges(changes, state.nodes),
          }),
          false,
          "onNodesChange"
        ),

      onEdgesChange: (changes) =>
        set(
          (state) => ({
            edges: applyEdgeChanges(changes, state.edges),
          }),
          false,
          "onEdgesChange"
        ),

      // Connection Management
      onConnect: (connection) =>
        set(
          (state) => {
            const sourceNode = state.nodes.find(
              (n) => n.id === connection.source
            );
            const targetNode = state.nodes.find(
              (n) => n.id === connection.target
            );

            // Get colors based on source node category
            const edgeColor = sourceNode?.data?.category
              ? categoryColors[sourceNode.data.category] || "#666666"
              : "#666666";

            const newEdge = {
              ...connection,
              id: `e${connection.source}-${connection.target}`,
              animated: true,
              style: { stroke: edgeColor, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
              label: sourceNode?.data?.category || "data",
            };

            return {
              edges: addEdge(newEdge, state.edges),
            };
          },
          false,
          "onConnect"
        ),

      // Manual Edge Creation
      createEdge: (source, target, options = {}) =>
        set(
          (state) => {
            const sourceNode = state.nodes.find((n) => n.id === source);
            const edgeColor = sourceNode?.data?.category
              ? categoryColors[sourceNode.data.category] || "#666666"
              : "#666666";

            const newEdge = {
              id: `e${source}-${target}`,
              source,
              target,
              animated: true,
              style: { stroke: edgeColor, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
              label: sourceNode?.data?.category || "data",
              ...options,
            };

            return {
              edges: [...state.edges, newEdge],
            };
          },
          false,
          "createEdge"
        ),

      // Node CRUD Operations
      addNode: (nodeData) =>
        set(
          (state) => {
            const newNode = {
              id: generateId(),
              type: "custom",
              position: nodeData.position || { x: 100, y: 100 },
              data: {
                category: nodeData.category || "action",
                nodeIcon: nodeData.nodeIcon || "⚡",
                label: nodeData.label || "New Node",
                description: nodeData.description || "Node description",
                properties: nodeData.properties || {},
                status: "pending",
                nodeType: nodeData.nodeType || "custom_node",
                ...nodeData,
              },
            };

            return {
              nodes: [...state.nodes, newNode],
            };
          },
          false,
          "addNode"
        ),

      updateNode: (nodeId, updates) =>
        set(
          (state) => ({
            nodes: state.nodes.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    ...updates,
                    data: { ...node.data, ...updates.data },
                  }
                : node
            ),
          }),
          false,
          "updateNode"
        ),

      deleteNode: (nodeId) =>
        set(
          (state) => {
            const nodeToDelete = state.nodes.find((n) => n.id === nodeId);
            if (!nodeToDelete) return state;

            // Remove connected edges
            const connectedEdges = getConnectedEdges(
              [nodeToDelete],
              state.edges
            );
            const edgeIdsToRemove = connectedEdges.map((edge) => edge.id);

            return {
              nodes: state.nodes.filter((node) => node.id !== nodeId),
              edges: state.edges.filter(
                (edge) => !edgeIdsToRemove.includes(edge.id)
              ),
              selectedNode:
                state.selectedNode?.id === nodeId ? null : state.selectedNode,
            };
          },
          false,
          "deleteNode"
        ),

      duplicateNode: (nodeId) =>
        set(
          (state) => {
            const nodeToDuplicate = state.nodes.find((n) => n.id === nodeId);
            if (!nodeToDuplicate) return state;

            const newNode = {
              ...nodeToDuplicate,
              id: generateId(),
              position: {
                x: nodeToDuplicate.position.x + 50,
                y: nodeToDuplicate.position.y + 50,
              },
              data: {
                ...nodeToDuplicate.data,
                label: `${nodeToDuplicate.data.label} (Copy)`,
                status: "pending",
              },
            };

            return {
              nodes: [...state.nodes, newNode],
            };
          },
          false,
          "duplicateNode"
        ),

      // Edge Management
      updateEdge: (edgeId, updates) =>
        set(
          (state) => ({
            edges: state.edges.map((edge) =>
              edge.id === edgeId ? { ...edge, ...updates } : edge
            ),
          }),
          false,
          "updateEdge"
        ),

      deleteEdge: (edgeId) =>
        set(
          (state) => ({
            edges: state.edges.filter((edge) => edge.id !== edgeId),
            selectedEdge:
              state.selectedEdge?.id === edgeId ? null : state.selectedEdge,
          }),
          false,
          "deleteEdge"
        ),

      // Selection Management
      setSelectedNode: (node) =>
        set({ selectedNode: node }, false, "setSelectedNode"),

      setSelectedEdge: (edge) =>
        set({ selectedEdge: edge }, false, "setSelectedEdge"),

      setSelectedNodes: (nodes) =>
        set({ selectedNodes: nodes }, false, "setSelectedNodes"),

      clearSelection: () =>
        set(
          {
            selectedNode: null,
            selectedEdge: null,
            selectedNodes: [],
            selectedElements: [],
          },
          false,
          "clearSelection"
        ),

      // Workflow Management
      loadWorkflow: (workflowData) =>
        set(
          {
            nodes: workflowData.nodes || [],
            edges: workflowData.edges || [],
          },
          false,
          "loadWorkflow"
        ),

      clearWorkflow: () =>
        set(
          {
            nodes: [],
            edges: [],
            selectedNode: null,
            selectedEdge: null,
            selectedNodes: [],
          },
          false,
          "clearWorkflow"
        ),

      resetToInitial: () =>
        set(
          {
            nodes: initialNodes,
            edges: initialEdges,
            selectedNode: null,
            selectedEdge: null,
            selectedNodes: [],
          },
          false,
          "resetToInitial"
        ),

      // Node Status Management
      updateNodeStatus: (nodeId, status) =>
        set(
          (state) => ({
            nodes: state.nodes.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, status } }
                : node
            ),
          }),
          false,
          "updateNodeStatus"
        ),

      // Bulk Operations
      updateMultipleNodes: (nodeIds, updates) =>
        set(
          (state) => ({
            nodes: state.nodes.map((node) =>
              nodeIds.includes(node.id)
                ? {
                    ...node,
                    ...updates,
                    data: { ...node.data, ...updates.data },
                  }
                : node
            ),
          }),
          false,
          "updateMultipleNodes"
        ),

      deleteMultipleNodes: (nodeIds) =>
        set(
          (state) => {
            const nodesToDelete = state.nodes.filter((n) =>
              nodeIds.includes(n.id)
            );
            const connectedEdges = getConnectedEdges(
              nodesToDelete,
              state.edges
            );
            const edgeIdsToRemove = connectedEdges.map((edge) => edge.id);

            return {
              nodes: state.nodes.filter((node) => !nodeIds.includes(node.id)),
              edges: state.edges.filter(
                (edge) => !edgeIdsToRemove.includes(edge.id)
              ),
              selectedNodes: [],
            };
          },
          false,
          "deleteMultipleNodes"
        ),

      // Utility Functions
      getNodeById: (nodeId) => {
        const state = get();
        return state.nodes.find((node) => node.id === nodeId);
      },

      getEdgeById: (edgeId) => {
        const state = get();
        return state.edges.find((edge) => edge.id === edgeId);
      },

      getNodesByCategory: (category) => {
        const state = get();
        return state.nodes.filter((node) => node.data.category === category);
      },

      getConnectedNodes: (nodeId) => {
        const state = get();
        const node = state.nodes.find((n) => n.id === nodeId);
        if (!node) return { incomers: [], outgoers: [] };

        return {
          incomers: getIncomers(node, state.nodes, state.edges),
          outgoers: getOutgoers(node, state.nodes, state.edges),
        };
      },

      // Connection State Management
      setConnectionState: (isConnecting, nodeId = null, handleId = null) =>
        set(
          {
            isConnecting,
            connectionNodeId: nodeId,
            connectionHandleId: handleId,
          },
          false,
          "setConnectionState"
        ),

      // Flow Settings
      updateFlowSettings: (settings) =>
        set(
          (state) => ({ ...state, ...settings }),
          false,
          "updateFlowSettings"
        ),

      // Export/Import
      exportFlow: () => {
        const state = get();
        return {
          nodes: state.nodes,
          edges: state.edges,
          viewport: state.viewport || { x: 0, y: 0, zoom: 1 },
        };
      },

      importFlow: (flowData) =>
        set(
          {
            nodes: flowData.nodes || [],
            edges: flowData.edges || [],
            selectedNode: null,
            selectedEdge: null,
            selectedNodes: [],
          },
          false,
          "importFlow"
        ),

      // Node Validation
      validateNode: (nodeId) => {
        const state = get();
        const node = state.nodes.find((n) => n.id === nodeId);
        if (!node) return { isValid: false, errors: ["Node not found"] };

        const errors = [];

        // Basic validation
        if (!node.data.label || node.data.label.trim() === "") {
          errors.push("Node label is required");
        }

        if (!node.data.category) {
          errors.push("Node category is required");
        }

        // Category-specific validation
        if (node.data.category === "trigger" && !node.data.properties) {
          errors.push("Trigger nodes require properties");
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },

      // Workflow Validation
      validateWorkflow: () => {
        const state = get();
        const errors = [];

        // Check for isolated nodes
        const isolatedNodes = state.nodes.filter((node) => {
          const connectedEdges = state.edges.filter(
            (edge) => edge.source === node.id || edge.target === node.id
          );
          return connectedEdges.length === 0;
        });

        if (isolatedNodes.length > 0) {
          errors.push(`Found ${isolatedNodes.length} isolated node(s)`);
        }

        // Check for cycles (basic detection)
        // This is a simplified cycle detection - you might want more sophisticated logic
        const hasInfiniteLoop = state.nodes.some((node) => {
          const visited = new Set();
          const stack = [node.id];

          while (stack.length > 0) {
            const currentId = stack.pop();
            if (visited.has(currentId)) return true;

            visited.add(currentId);
            const outgoingEdges = state.edges.filter(
              (e) => e.source === currentId
            );
            outgoingEdges.forEach((edge) => stack.push(edge.target));
          }

          return false;
        });

        if (hasInfiniteLoop) {
          errors.push("Potential infinite loop detected in workflow");
        }

        return {
          isValid: errors.length === 0,
          errors,
          nodeCount: state.nodes.length,
          edgeCount: state.edges.length,
        };
      },
    })),
    {
      name: "flow-store",
      serialize: {
        map: true,
      },
    }
  )
);

// Selectors for common use cases
export const useNodes = () => useFlowStore((state) => state.nodes);
export const useEdges = () => useFlowStore((state) => state.edges);
export const useSelectedNode = () =>
  useFlowStore((state) => state.selectedNode);
export const useSelectedEdge = () =>
  useFlowStore((state) => state.selectedEdge);
export const useFlowActions = () =>
  useFlowStore((state) => ({
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNode: state.addNode,
    updateNode: state.updateNode,
    deleteNode: state.deleteNode,
    setSelectedNode: state.setSelectedNode,
    clearSelection: state.clearSelection,
  }));

export default useFlowStore;
