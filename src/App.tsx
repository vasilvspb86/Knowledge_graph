import { useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Toaster } from 'sonner';
import { X, PlusCircle } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { TopicInputPanel } from '@/components/panels/TopicInputPanel';
import { NodeDetailPanel } from '@/components/panels/NodeDetailPanel';
import { MECEPanel } from '@/components/panels/MECEPanel';
import { AddNodeDialog } from '@/components/panels/AddNodeDialog';
import { SettingsDialog } from '@/components/panels/SettingsDialog';
import { SessionManager } from '@/components/panels/SessionManager';

import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { useMECECheck } from '@/hooks/useMECECheck';
import { useResourceFinder } from '@/hooks/useResourceFinder';
import { Button } from '@/components/ui/button';

export default function App() {
  const { nodes, saveCurrentGraph } = useGraphStore();
  const { sidebarPanel, setSidebarPanel, selectedNodeId } = useUIStore();
  const { expand } = useAISuggestions();
  const { check, result: meceResult } = useMECECheck();
  const { findResourcesForNode } = useResourceFinder();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [addNodeParentId, setAddNodeParentId] = useState<string | null>(null);

  const hasGraph = nodes.length > 0;

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!hasGraph) return;
    const timer = setTimeout(() => {
      saveCurrentGraph();
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, hasGraph, saveCurrentGraph]);

  // Listen for expand-node custom events from ConceptNode/RootNode
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.nodeId) {
        expand(detail.nodeId);
      }
    };
    window.addEventListener('expand-node', handler);
    return () => window.removeEventListener('expand-node', handler);
  }, [expand]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useGraphStore.getState().undo();
      }
      if (e.ctrlKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useGraphStore.getState().redo();
      }
      if (e.key === 'Delete' && selectedNodeId) {
        const node = useGraphStore.getState().nodes.find((n) => n.id === selectedNodeId);
        if (node && node.status !== 'root') {
          useGraphStore.getState().removeNode(selectedNodeId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId]);

  const handleExpand = useCallback(
    (nodeId: string) => {
      expand(nodeId);
    },
    [expand]
  );

  const handleMECECheck = useCallback(
    (nodeId: string) => {
      check(nodeId);
    },
    [check]
  );

  const handleFindResources = useCallback(
    (nodeId: string) => {
      findResourcesForNode(nodeId);
    },
    [findResourcesForNode]
  );

  const handleExport = useCallback(() => {
    const state = useGraphStore.getState();
    const data = {
      title: state.title,
      nodes: state.nodes,
      edges: state.edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.title || 'knowledge-graph'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenSessions={() => setSessionsOpen(true)}
          onExport={handleExport}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Main content */}
          <div className="flex-1 relative">
            {hasGraph ? <GraphCanvas /> : <TopicInputPanel />}

            {/* Floating add node button */}
            {hasGraph && (
              <div className="absolute top-3 left-3 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-sm"
                  onClick={() => {
                    setAddNodeParentId(selectedNodeId);
                    setAddNodeOpen(true);
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Add Node
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {sidebarPanel && (
            <div className="w-72 border-l border-border bg-white overflow-y-auto shrink-0">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {sidebarPanel === 'detail' && 'Node Details'}
                  {sidebarPanel === 'mece' && 'MECE Analysis'}
                  {sidebarPanel === 'suggestions' && 'Suggestions'}
                </h2>
                <button
                  onClick={() => setSidebarPanel(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {sidebarPanel === 'detail' && (
                <NodeDetailPanel
                  onExpand={handleExpand}
                  onMECECheck={handleMECECheck}
                  onFindResources={handleFindResources}
                />
              )}
              {sidebarPanel === 'mece' && <MECEPanel result={meceResult} />}
            </div>
          )}
        </div>

        {/* Dialogs */}
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <SessionManager open={sessionsOpen} onOpenChange={setSessionsOpen} />
        <AddNodeDialog
          open={addNodeOpen}
          onOpenChange={setAddNodeOpen}
          parentNodeId={addNodeParentId}
        />

        <Toaster position="bottom-right" richColors />
      </div>
    </ReactFlowProvider>
  );
}
