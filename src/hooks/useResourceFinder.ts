import { useCallback } from 'react';
import { toast } from 'sonner';
import { findResources } from '@/services/resource-finder';
import { useGraphStore } from '@/stores/graph-store';
import { useSettingsStore } from '@/stores/settings-store';

export function useResourceFinder() {
  const { nodes, title, setNodeResources } = useGraphStore();

  const findResourcesForNode = useCallback(
    async (nodeId: string) => {
      if (!useSettingsStore.getState().hasApiKey()) {
        toast.error('Please set your OpenAI API key in Settings first.');
        return;
      }

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        toast.error('Node not found');
        return;
      }

      if (node.resources && node.resources.length > 0) {
        toast.info('Resources already loaded for this node.');
        return;
      }

      toast.loading('Finding learning resources...', { id: 'resource-finder' });
      try {
        const resources = await findResources(title, node);
        setNodeResources(nodeId, resources);
        toast.success(
          `Found ${resources.length} learning resource${resources.length > 1 ? 's' : ''}`,
          { id: 'resource-finder' }
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to find resources';
        toast.error(message, { id: 'resource-finder' });
      }
    },
    [nodes, title, setNodeResources]
  );

  return { findResourcesForNode };
}
