import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { checkMECE } from '@/services/mece-checker';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { useSettingsStore } from '@/stores/settings-store';
import type { MECECheckResult } from '@/types/graph';

export function useMECECheck() {
  const [result, setResult] = useState<MECECheckResult | null>(null);
  const { nodes, edges, title } = useGraphStore();
  const { setMECEChecking, setSidebarPanel } = useUIStore();

  const check = useCallback(
    async (parentNodeId: string) => {
      if (!useSettingsStore.getState().hasApiKey()) {
        toast.error('Please set your OpenAI API key in Settings first.');
        return;
      }

      const parent = nodes.find((n) => n.id === parentNodeId);
      if (!parent) {
        toast.error('Node not found');
        return;
      }

      // Find accepted/user-added children
      const childIds = edges
        .filter((e) => e.source === parentNodeId)
        .map((e) => e.target);
      const children = nodes.filter(
        (n) => childIds.includes(n.id) && n.status !== 'ai-suggested'
      );

      if (children.length < 2) {
        toast.error('Need at least 2 accepted child concepts to check MECE.');
        return;
      }

      setMECEChecking(true);
      try {
        const meceResult = await checkMECE(title, parent, children);
        setResult(meceResult);
        setSidebarPanel('mece');
        if (meceResult.isCompliant) {
          toast.success('MECE check passed!');
        } else {
          toast.warning('MECE issues found. See details in the sidebar.');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'MECE check failed';
        toast.error(message);
      } finally {
        setMECEChecking(false);
      }
    },
    [nodes, edges, title, setMECEChecking, setSidebarPanel]
  );

  return { check, result, clearResult: () => setResult(null) };
}
