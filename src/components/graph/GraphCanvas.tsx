import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,

  type OnNodesChange,
  type OnEdgesChange,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { RootNode } from './RootNode';
import { ConceptNode } from './ConceptNode';
import { SuggestionNode } from './SuggestionNode';
import { RelationEdge } from './RelationEdge';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { toReactFlowNode, toReactFlowEdge } from '@/lib/graph-utils';
import { computeLayout } from '@/lib/layout';

const nodeTypes = {
  root: RootNode,
  concept: ConceptNode,
  suggestion: SuggestionNode,
};

const edgeTypes = {
  relation: RelationEdge,
};

export function GraphCanvas() {
  const graphNodes = useGraphStore((s) => s.nodes);
  const graphEdges = useGraphStore((s) => s.edges);
  const updateNodePosition = useGraphStore((s) => s.updateNodePosition);
  const selectNode = useUIStore((s) => s.selectNode);
  const expandingNodeId = useUIStore((s) => s.expandingNodeId);

  // Apply dagre layout
  const layoutNodes = useMemo(
    () => computeLayout(graphNodes, graphEdges),
    [graphNodes, graphEdges]
  );

  // Convert to React Flow format
  const rfNodes = useMemo(
    () =>
      layoutNodes.map((n) => {
        const rfNode = toReactFlowNode(n);
        // Add pulsing class if this node is being expanded
        if (n.id === expandingNodeId) {
          rfNode.className = 'animate-pulse';
        }
        return rfNode;
      }),
    [layoutNodes, expandingNodeId]
  );

  const rfEdges = useMemo(
    () =>
      graphEdges.map((e) => {
        const targetNode = graphNodes.find((n) => n.id === e.target);
        const isSuggestion = targetNode?.status === 'ai-suggested';
        return toReactFlowEdge(e, isSuggestion);
      }),
    [graphEdges, graphNodes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync React Flow state with store
  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Persist position changes back to store
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          updateNodePosition(change.id, change.position);
        }
      }
    },
    [onNodesChange, updateNodePosition]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);


  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            if (node.type === 'root') return '#4f46e5';
            if (node.type === 'suggestion') return '#f59e0b';
            return '#6b7280';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
      </ReactFlow>
    </div>
  );
}
