import OpenAI from 'openai';
import { useSettingsStore } from '@/stores/settings-store';

export function getOpenAIClient(): OpenAI {
  const apiKey = useSettingsStore.getState().openaiApiKey;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set it in Settings.');
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}
