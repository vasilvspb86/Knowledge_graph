import { z } from 'zod/v4';
import { getOpenAIClient } from './openai';
import { useSettingsStore } from '@/stores/settings-store';
import type { GraphNode, LearningResource } from '@/types/graph';

const ResourceSchema = z.object({
  title: z.string(),
  type: z.enum(['article', 'book', 'video', 'podcast']),
  author: z.string().optional(),
  description: z.string(),
  url: z.string().optional(),
});

const ResponseSchema = z.object({
  resources: z.array(ResourceSchema).min(1).max(3),
});

function buildResourcePrompt(
  rootTopic: string,
  targetNode: GraphNode
): string {
  return `You are a learning advisor helping a business professional find the best resources to learn about a specific topic.

Topic: "${targetNode.label}"
Description: "${targetNode.description}"
Broader context: The user is exploring "${rootTopic}"

Find 1-3 high-quality, well-known learning resources about "${targetNode.label}".
Prioritize widely recognized, authoritative sources.

Requirements:
- Mix resource types when possible (articles, books, videos, podcasts)
- Each resource must be a real, well-known work (not fabricated)
- Prefer foundational/canonical resources over obscure ones
- Include the author/creator name
- Write a 1-sentence description of why this resource is valuable
- Only include a URL if you are confident it is correct; omit if unsure

Return ONLY valid JSON (no markdown code blocks):
{
  "resources": [
    {
      "title": "Resource title",
      "type": "article" | "book" | "video" | "podcast",
      "author": "Author or creator name",
      "description": "Why this is valuable for learning about this topic",
      "url": "URL if well-known and certain (optional)"
    }
  ]
}`;
}

export async function findResources(
  rootTopic: string,
  targetNode: GraphNode
): Promise<LearningResource[]> {
  const { model } = useSettingsStore.getState();
  const client = getOpenAIClient();

  const prompt = buildResourcePrompt(rootTopic, targetNode);

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');

  const parsed = JSON.parse(content);
  const validated = ResponseSchema.parse(parsed);
  return validated.resources;
}
