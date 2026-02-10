export type NodeStatus = 'root' | 'accepted' | 'user-added' | 'ai-suggested';

export type ReasonType =
  | 'related-concept'
  | 'prerequisite'
  | 'consequence'
  | 'contrast'
  | 'component'
  | 'gap'
  | 'application'
  | 'example';

export type RelationType =
  | 'is-a'
  | 'part-of'
  | 'related-to'
  | 'leads-to'
  | 'requires'
  | 'contrasts-with'
  | 'example-of'
  | 'applies-to';

export type ResourceType = 'article' | 'book' | 'video' | 'podcast';

export interface LearningResource {
  title: string;
  type: ResourceType;
  author?: string;
  description: string;
  url?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  description: string;
  status: NodeStatus;
  reasonType?: ReasonType;
  reasonText?: string;
  parentId?: string;
  position: { x: number; y: number };
  createdAt: string;
  resources?: LearningResource[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationType: RelationType;
}

export interface KnowledgeGraph {
  id: string;
  title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface AISuggestion {
  label: string;
  description: string;
  reasonType: ReasonType;
  reasonText: string;
  relationType: RelationType;
  relationLabel: string;
  confidence: number;
}

export interface MECECheckResult {
  isCompliant: boolean;
  overallScore: number;
  gaps: {
    description: string;
    suggestedNode?: string;
  }[];
  overlaps: {
    nodeA: string;
    nodeB: string;
    description: string;
  }[];
  summary: string;
}
