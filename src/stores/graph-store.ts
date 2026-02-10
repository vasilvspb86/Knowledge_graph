import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { GraphNode, GraphEdge, KnowledgeGraph, AISuggestion, LearningResource } from '@/types/graph';

interface HistoryEntry {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphState {
  // Current graph
  currentGraphId: string | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  title: string;

  // Saved graphs
  savedGraphs: KnowledgeGraph[];

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Rejected labels (to avoid re-suggesting)
  rejectedLabels: string[];

  // Actions
  setRootTopic: (topic: string) => void;
  addNode: (node: Omit<GraphNode, 'id' | 'createdAt' | 'position'>, parentId?: string) => string;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<Pick<GraphNode, 'label' | 'description'>>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  acceptSuggestion: (nodeId: string) => void;
  rejectSuggestion: (nodeId: string) => void;
  addSuggestions: (parentId: string, suggestions: AISuggestion[]) => void;
  setNodeResources: (nodeId: string, resources: LearningResource[]) => void;

  // Session management
  saveCurrentGraph: () => void;
  loadGraph: (id: string) => void;
  deleteGraph: (id: string) => void;
  newGraph: () => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Selectors
  getRootNode: () => GraphNode | undefined;
  getChildrenOf: (nodeId: string) => GraphNode[];
  getSuggestionNodes: () => GraphNode[];
}

export const useGraphStore = create<GraphState>()(
  persist(
    immer((set, get) => ({
      currentGraphId: null,
      nodes: [],
      edges: [],
      title: '',
      savedGraphs: [],
      history: [],
      historyIndex: -1,
      rejectedLabels: [],

      setRootTopic: (topic: string) => {
        const id = nanoid();
        set((state) => {
          state.pushHistory = get().pushHistory;
          state.title = topic;
          state.currentGraphId = nanoid();
          state.nodes = [
            {
              id,
              label: topic,
              description: `Root topic: ${topic}`,
              status: 'root',
              position: { x: 0, y: 0 },
              createdAt: new Date().toISOString(),
            },
          ];
          state.edges = [];
          state.history = [{ nodes: state.nodes, edges: state.edges }];
          state.historyIndex = 0;
          state.rejectedLabels = [];
        });
      },

      addNode: (nodeData, parentId) => {
        const id = nanoid();
        get().pushHistory();
        set((state) => {
          state.nodes.push({
            ...nodeData,
            id,
            position: { x: 0, y: 0 },
            createdAt: new Date().toISOString(),
          });
          if (parentId) {
            state.edges.push({
              id: nanoid(),
              source: parentId,
              target: id,
              label: 'related to',
              relationType: 'related-to',
            });
          }
        });
        return id;
      },

      removeNode: (id: string) => {
        get().pushHistory();
        set((state) => {
          state.nodes = state.nodes.filter((n) => n.id !== id);
          state.edges = state.edges.filter(
            (e) => e.source !== id && e.target !== id
          );
        });
      },

      updateNode: (id, updates) => {
        get().pushHistory();
        set((state) => {
          const node = state.nodes.find((n) => n.id === id);
          if (node) {
            Object.assign(node, updates);
          }
        });
      },

      updateNodePosition: (id, position) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === id);
          if (node) {
            node.position = position;
          }
        });
      },

      acceptSuggestion: (nodeId: string) => {
        get().pushHistory();
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            node.status = 'accepted';
          }
        });
      },

      rejectSuggestion: (nodeId: string) => {
        get().pushHistory();
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            state.rejectedLabels.push(node.label);
          }
          state.nodes = state.nodes.filter((n) => n.id !== nodeId);
          state.edges = state.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          );
        });
      },

      addSuggestions: (parentId: string, suggestions: AISuggestion[]) => {
        get().pushHistory();
        set((state) => {
          for (const suggestion of suggestions) {
            const id = nanoid();
            state.nodes.push({
              id,
              label: suggestion.label,
              description: suggestion.description,
              status: 'ai-suggested',
              reasonType: suggestion.reasonType,
              reasonText: suggestion.reasonText,
              parentId,
              position: { x: 0, y: 0 },
              createdAt: new Date().toISOString(),
            });
            state.edges.push({
              id: nanoid(),
              source: parentId,
              target: id,
              label: suggestion.relationLabel,
              relationType: suggestion.relationType,
            });
          }
        });
      },

      setNodeResources: (nodeId: string, resources: LearningResource[]) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            node.resources = resources;
          }
        });
      },

      saveCurrentGraph: () => {
        set((state) => {
          const now = new Date().toISOString();
          const graphId = state.currentGraphId || nanoid();
          state.currentGraphId = graphId;

          const existingIdx = state.savedGraphs.findIndex(
            (g) => g.id === graphId
          );
          const graph: KnowledgeGraph = {
            id: graphId,
            title: state.title,
            nodes: JSON.parse(JSON.stringify(state.nodes)),
            edges: JSON.parse(JSON.stringify(state.edges)),
            createdAt:
              existingIdx >= 0
                ? state.savedGraphs[existingIdx].createdAt
                : now,
            updatedAt: now,
          };

          if (existingIdx >= 0) {
            state.savedGraphs[existingIdx] = graph;
          } else {
            state.savedGraphs.push(graph);
          }
        });
      },

      loadGraph: (id: string) => {
        const state = get();
        const graph = state.savedGraphs.find((g) => g.id === id);
        if (!graph) return;

        set((s) => {
          s.currentGraphId = graph.id;
          s.title = graph.title;
          s.nodes = JSON.parse(JSON.stringify(graph.nodes));
          s.edges = JSON.parse(JSON.stringify(graph.edges));
          s.history = [{ nodes: s.nodes, edges: s.edges }];
          s.historyIndex = 0;
          s.rejectedLabels = [];
        });
      },

      deleteGraph: (id: string) => {
        set((state) => {
          state.savedGraphs = state.savedGraphs.filter((g) => g.id !== id);
          if (state.currentGraphId === id) {
            state.currentGraphId = null;
            state.nodes = [];
            state.edges = [];
            state.title = '';
          }
        });
      },

      newGraph: () => {
        // Auto-save current if it has content
        const state = get();
        if (state.nodes.length > 0) {
          state.saveCurrentGraph();
        }
        set((s) => {
          s.currentGraphId = null;
          s.nodes = [];
          s.edges = [];
          s.title = '';
          s.history = [];
          s.historyIndex = -1;
          s.rejectedLabels = [];
        });
      },

      pushHistory: () => {
        set((state) => {
          const entry: HistoryEntry = {
            nodes: JSON.parse(JSON.stringify(state.nodes)),
            edges: JSON.parse(JSON.stringify(state.edges)),
          };
          // Truncate redo history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push(entry);
          state.historyIndex = state.history.length - 1;
        });
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex <= 0) return;
          state.historyIndex -= 1;
          const entry = state.history[state.historyIndex];
          state.nodes = JSON.parse(JSON.stringify(entry.nodes));
          state.edges = JSON.parse(JSON.stringify(entry.edges));
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return;
          state.historyIndex += 1;
          const entry = state.history[state.historyIndex];
          state.nodes = JSON.parse(JSON.stringify(entry.nodes));
          state.edges = JSON.parse(JSON.stringify(entry.edges));
        });
      },

      getRootNode: () => {
        return get().nodes.find((n) => n.status === 'root');
      },

      getChildrenOf: (nodeId: string) => {
        const state = get();
        const childIds = state.edges
          .filter((e) => e.source === nodeId)
          .map((e) => e.target);
        return state.nodes.filter((n) => childIds.includes(n.id));
      },

      getSuggestionNodes: () => {
        return get().nodes.filter((n) => n.status === 'ai-suggested');
      },
    })),
    {
      name: 'speckit-graph-store',
      partialize: (state) => ({
        currentGraphId: state.currentGraphId,
        nodes: state.nodes,
        edges: state.edges,
        title: state.title,
        savedGraphs: state.savedGraphs,
        rejectedLabels: state.rejectedLabels,
      }),
    }
  )
);
