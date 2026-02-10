import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? '';

interface SettingsState {
  openaiApiKey: string;
  model: 'gpt-4o' | 'gpt-4o-mini';
  maxSuggestions: number;

  setApiKey: (key: string) => void;
  setModel: (model: 'gpt-4o' | 'gpt-4o-mini') => void;
  setMaxSuggestions: (n: number) => void;
  hasApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      openaiApiKey: DEFAULT_API_KEY,
      model: 'gpt-4o-mini',
      maxSuggestions: 5,

      setApiKey: (key) => set({ openaiApiKey: key }),
      setModel: (model) => set({ model }),
      setMaxSuggestions: (n) => set({ maxSuggestions: n }),
      hasApiKey: () => get().openaiApiKey.length > 0,
    }),
    {
      name: 'speckit-settings',
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        if (!state.openaiApiKey) {
          state.openaiApiKey = DEFAULT_API_KEY;
        }
        return state as unknown as SettingsState;
      },
    }
  )
);
