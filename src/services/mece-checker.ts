import { z } from 'zod/v4';
import { getOpenAIClient } from './openai';
import { useSettingsStore } from '@/stores/settings-store';
import type { GraphNode, MECECheckResult } from '@/types/graph';

const MECEResponseSchema = z.object({
  isCompliant: z.boolean(),
  overallScore: z.number().min(0).max(100),
  gaps: z.array(
    z.object({
      description: z.string(),
      suggestedNode: z.string().optional(),
    })
  ),
  overlaps: z.array(
    z.object({
      nodeA: z.string(),
      nodeB: z.string(),
      description: z.string(),
    })
  ),
  summary: z.string(),
});

function buildMECEPrompt(
  rootTopic: string,
  parent: GraphNode,
  children: GraphNode[]
): string {
  const childrenList = children
    .map((c, i) => `${i + 1}. "${c.label}" — ${c.description}`)
    .join('\n');

  return `You are an analytical consultant reviewing the structure of a knowledge map for completeness and clarity.

## Context
A business professional is exploring: "${rootTopic}"

## Task
Evaluate whether the following breakdown of "${parent.label}" is MECE (Mutually Exclusive, Collectively Exhaustive).

Parent concept: "${parent.label}"
Description: "${parent.description}"

Current children:
${childrenList}

## Evaluation Criteria

### Mutual Exclusivity (ME)
- Do any children overlap significantly in meaning or scope?
- Could any two children be merged without losing important distinctions?
- Are the boundaries between children clear?

### Collective Exhaustiveness (CE)
- Are there major aspects of "${parent.label}" that are NOT covered by any child?
- Would a professional feel they have "the full picture" from these children alone?
- Are there common frameworks or standard breakdowns of this concept that suggest missing categories?

## Output Format
Return ONLY valid JSON (no markdown code blocks):
{
  "isCompliant": true/false,
  "overallScore": 0-100,
  "gaps": [
    {
      "description": "What is missing",
      "suggestedNode": "Optional: suggested label to fill this gap"
    }
  ],
  "overlaps": [
    {
      "nodeA": "label of first overlapping node",
      "nodeB": "label of second overlapping node",
      "description": "How they overlap"
    }
  ],
  "summary": "2-3 sentence human-readable assessment"
}`;
}

export async function checkMECE(
  rootTopic: string,
  parent: GraphNode,
  children: GraphNode[]
): Promise<MECECheckResult> {
  if (children.length < 2) {
    return {
      isCompliant: false,
      overallScore: 0,
      gaps: [{ description: 'Need at least 2 child concepts to evaluate MECE compliance.' }],
      overlaps: [],
      summary: 'Cannot evaluate MECE with fewer than 2 children.',
    };
  }

  const { model } = useSettingsStore.getState();
  const client = getOpenAIClient();

  const prompt = buildMECEPrompt(rootTopic, parent, children);

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');

  const parsed = JSON.parse(content);
  return MECEResponseSchema.parse(parsed);
}
