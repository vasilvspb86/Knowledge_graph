import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      openaiApiKey: '',
      model: 'gpt-4o-mini',
      maxSuggestions: 5,

      setApiKey: (key) => set({ openaiApiKey: key }),
      setModel: (model) => set({ model }),
      setMaxSuggestions: (n) => set({ maxSuggestions: n }),
      hasApiKey: () => get().openaiApiKey.length > 0,
    }),
    {
      name: 'speckit-settings',
    }
  )
);
