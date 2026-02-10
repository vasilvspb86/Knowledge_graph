import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import type { GraphNode, GraphEdge } from '@/types/graph';

export interface ConceptNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  nodeStatus: 'accepted' | 'user-added' | 'root';
}

export interface SuggestionNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  reasonType: string;
  reasonText: string;
}

export interface RelationEdgeData extends Record<string, unknown> {
  relationType: string;
  label: string;
}

export function toReactFlowNode(node: GraphNode): RFNode {
  if (node.status === 'ai-suggested') {
    return {
      id: node.id,
      type: 'suggestion',
      position: node.position,
      data: {
        label: node.label,
        description: node.description,
        reasonType: node.reasonType || 'related-concept',
        reasonText: node.reasonText || '',
      } satisfies SuggestionNodeData,
    };
  }

  return {
    id: node.id,
    type: node.status === 'root' ? 'root' : 'concept',
    position: node.position,
    data: {
      label: node.label,
      description: node.description,
      nodeStatus: node.status,
    } satisfies ConceptNodeData,
  };
}

export function toReactFlowEdge(edge: GraphEdge, isSuggestion: boolean): RFEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'relation',
    animated: isSuggestion,
    data: {
      relationType: edge.relationType,
      label: edge.label,
    } satisfies RelationEdgeData,
  };
}

export function formatGraphSnapshot(nodes: GraphNode[], edges: GraphEdge[]): string {
  const nodeLines = nodes
    .filter((n) => n.status !== 'ai-suggested')
    .map((n) => {
      const statusTag = n.status === 'root' ? 'Root' : n.status === 'user-added' ? 'User-Added' : 'Accepted';
      return `- [${statusTag}] "${n.label}" — ${n.description}`;
    });

  const edgeLines = edges
    .filter((e) => {
      const targetNode = nodes.find((n) => n.id === e.target);
      return targetNode && targetNode.status !== 'ai-suggested';
    })
    .map((e) => {
      const source = nodes.find((n) => n.id === e.source);
      const target = nodes.find((n) => n.id === e.target);
      return `- "${source?.label}" --[${e.label}]--> "${target?.label}"`;
    });

  let result = 'Nodes:\n' + nodeLines.join('\n');
  if (edgeLines.length > 0) {
    result += '\n\nEdges:\n' + edgeLines.join('\n');
  }
  return result;
}
