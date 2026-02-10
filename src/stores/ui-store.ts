import { create } from 'zustand';

type SidebarPanel = 'detail' | 'suggestions' | 'mece' | null;

interface UIState {
  selectedNodeId: string | null;
  sidebarPanel: SidebarPanel;
  isExpanding: boolean;
  expandingNodeId: string | null;
  isMECEChecking: boolean;

  selectNode: (id: string | null) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  setExpanding: (expanding: boolean, nodeId?: string | null) => void;
  setMECEChecking: (checking: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  selectedNodeId: null,
  sidebarPanel: null,
  isExpanding: false,
  expandingNodeId: null,
  isMECEChecking: false,

  selectNode: (id) =>
    set({
      selectedNodeId: id,
      sidebarPanel: id ? 'detail' : null,
    }),

  setSidebarPanel: (panel) => set({ sidebarPanel: panel }),

  setExpanding: (expanding, nodeId = null) =>
    set({ isExpanding: expanding, expandingNodeId: nodeId }),

  setMECEChecking: (checking) => set({ isMECEChecking: checking }),
}));
