import { useCallback } from 'react';
import { toast } from 'sonner';
import { expandNode } from '@/services/graph-expander';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { useSettingsStore } from '@/stores/settings-store';

export function useAISuggestions() {
  const { nodes, edges, title, rejectedLabels, addSuggestions } = useGraphStore();
  const { setExpanding } = useUIStore();

  const expand = useCallback(
    async (nodeId: string) => {
      if (!useSettingsStore.getState().hasApiKey()) {
        toast.error('Please set your OpenAI API key in Settings first.');
        return;
      }

      setExpanding(true, nodeId);
      try {
        const suggestions = await expandNode(
          title,
          nodes,
          edges,
          nodeId,
          rejectedLabels
        );
        addSuggestions(nodeId, suggestions);
        toast.success(`Generated ${suggestions.length} suggestions`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate suggestions';
        toast.error(message);
      } finally {
        setExpanding(false, null);
      }
    },
    [nodes, edges, title, rejectedLabels, addSuggestions, setExpanding]
  );

  return { expand };
}
