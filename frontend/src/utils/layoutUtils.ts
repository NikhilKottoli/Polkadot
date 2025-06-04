import { Node, Edge } from 'reactflow';
import { hierarchy, tree } from 'd3-hierarchy';

interface TreeNode {
  id: string;
  children?: TreeNode[];
  data: any;
}

const HORIZONTAL_SPACING = 150;
const VERTICAL_SPACING = 100;

export function calculateLayout(nodes: Node[], edges: Edge[]) {
  // Create a hierarchical structure from nodes and edges
  const nodeMap = new Map(nodes.map(node => [node.id, { ...node, children: [] }]));
  
  // Find the root node (node with no incoming edges)
  const edgesByTarget = new Map();
  edges.forEach(edge => {
    const targets = edgesByTarget.get(edge.target) || [];
    targets.push(edge.source);
    edgesByTarget.set(edge.target, targets);
  });

  const root = nodes.find(node => !edgesByTarget.has(node.id));
  if (!root) return nodes;

  // Create positions map
  const positions = new Map<string, { x: number, y: number }>();
  let currentY = 0;

  function layoutNode(nodeId: string, xOffset = 0) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || positions.has(nodeId)) return;

    // Set base position
    positions.set(nodeId, { x: xOffset, y: currentY });

    // Find child nodes through edges
    const childEdges = edges.filter(edge => edge.source === nodeId);
    
    if (node.type === 'conditional') {
      // Handle conditional node branches with vertical offset
      const trueEdge = childEdges.find(edge => edge.sourceHandle === 'true');
      const falseEdge = childEdges.find(edge => edge.sourceHandle === 'false');

      if (trueEdge) {
        currentY -= VERTICAL_SPACING;
        layoutNode(trueEdge.target, xOffset + HORIZONTAL_SPACING);
        currentY += VERTICAL_SPACING;
      }
      
      if (falseEdge) {
        currentY += VERTICAL_SPACING;
        layoutNode(falseEdge.target, xOffset + HORIZONTAL_SPACING);
        currentY -= VERTICAL_SPACING;
      }
    } else if (node.type === 'loop') {
      // Handle loop node branches
      const doneEdge = childEdges.find(edge => edge.sourceHandle === 'done');
      const loopEdge = childEdges.find(edge => edge.sourceHandle === 'loop');

      if (doneEdge) layoutNode(doneEdge.target, xOffset + HORIZONTAL_SPACING);
      
      if (loopEdge) {
        currentY += VERTICAL_SPACING;
        layoutNode(loopEdge.target, xOffset + HORIZONTAL_SPACING);
        currentY -= VERTICAL_SPACING;
      }
    } else {
      // Handle regular nodes
      childEdges.forEach(edge => {
        layoutNode(edge.target, xOffset + HORIZONTAL_SPACING);
      });
    }
  }

  // Start layout from root
  layoutNode(root.id);

  // Update node positions
  return nodes.map(node => {
    const position = positions.get(node.id);
    if (position) {
      return {
        ...node,
        position: {
          x: position.x,
          y: position.y
        }
      };
    }
    return node;
  });
}