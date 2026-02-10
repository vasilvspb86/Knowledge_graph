import { z } from 'zod/v4';
import { getOpenAIClient } from './openai';
import { formatGraphSnapshot } from '@/lib/graph-utils';
import { useSettingsStore } from '@/stores/settings-store';
import type { GraphNode, GraphEdge, AISuggestion } from '@/types/graph';

const SuggestionSchema = z.object({
  label: z.string(),
  description: z.string(),
  reasonType: z.enum([
    'related-concept',
    'prerequisite',
    'consequence',
    'contrast',
    'component',
    'gap',
    'application',
    'example',
  ]),
  reasonText: z.string(),
  relationType: z.enum([
    'is-a',
    'part-of',
    'related-to',
    'leads-to',
    'requires',
    'contrasts-with',
    'example-of',
    'applies-to',
  ]),
  relationLabel: z.string(),
  confidence: z.number().min(0).max(1),
});

const ResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema),
});

function buildExpandPrompt(
  rootTopic: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  targetNode: GraphNode,
  rejectedLabels: string[],
  maxSuggestions: number
): string {
  const graphSnapshot = formatGraphSnapshot(nodes, edges);

  let rejectedInstruction = '';
  if (rejectedLabels.length > 0) {
    rejectedInstruction = `\nThe user has previously rejected these suggestions: ${rejectedLabels.join(', ')}.\nDo not suggest these again or concepts very similar to them.\n`;
  }

  return `You are a knowledge cartographer helping a business professional explore and understand a topic comprehensively.

## Context
The user is building a knowledge graph about: "${rootTopic}"

## Current Knowledge Graph
${graphSnapshot}

## Task
The user wants to explore the concept "${targetNode.label}" more deeply.
Description: "${targetNode.description}"

Generate exactly ${maxSuggestions} related concepts that would help the user understand "${targetNode.label}" more completely in the context of "${rootTopic}".

## Requirements
1. Each suggestion must be DISTINCT from all existing nodes in the graph.
2. Suggestions should cover DIFFERENT DIMENSIONS of the concept:
   - Prerequisites (what you need to know first)
   - Components (what makes up this concept)
   - Consequences (what follows from this concept)
   - Related concepts (what pairs with this)
   - Contrasts (what opposes or differs from this)
   - Applications (practical uses)
   - Gaps (what is commonly overlooked)
3. Provide a clear, specific reason for each suggestion.
4. Labels should be concise (2-5 words).
5. Descriptions should be accessible to a business professional (no jargon without explanation).
6. Aim for MECE coverage: suggestions should be mutually exclusive (minimal overlap) and collectively exhaustive (cover the key aspects).
${rejectedInstruction}
## Output Format
Return a JSON object with a "suggestions" array. Each suggestion has:
- label: Short concept name (2-5 words)
- description: 1-2 sentence accessible explanation
- reasonType: one of "related-concept", "prerequisite", "consequence", "contrast", "component", "gap", "application", "example"
- reasonText: Why this is suggested (1 sentence)
- relationType: one of "is-a", "part-of", "related-to", "leads-to", "requires", "contrasts-with", "example-of", "applies-to"
- relationLabel: Short edge label (2-3 words), e.g. "requires", "leads to", "part of"
- confidence: 0.0 to 1.0

Return ONLY valid JSON, no markdown code blocks.`;
}

export async function expandNode(
  rootTopic: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  targetNodeId: string,
  rejectedLabels: string[]
): Promise<AISuggestion[]> {
  const targetNode = nodes.find((n) => n.id === targetNodeId);
  if (!targetNode) throw new Error('Target node not found');

  const { model, maxSuggestions } = useSettingsStore.getState();
  const client = getOpenAIClient();

  const prompt = buildExpandPrompt(
    rootTopic,
    nodes,
    edges,
    targetNode,
    rejectedLabels,
    maxSuggestions
  );

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');

  const parsed = JSON.parse(content);
  const validated = ResponseSchema.parse(parsed);
  return validated.suggestions;
}
