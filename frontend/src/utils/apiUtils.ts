import { Node, Edge } from 'reactflow';

interface WorkflowPayload {
  nodes: Node[];
  edges: Edge[];
}

export async function executeWorkflow(payload: WorkflowPayload): Promise<void> {
  const response = await fetch('http://localhost:3000/api/workflows/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to execute workflow');
  }
}