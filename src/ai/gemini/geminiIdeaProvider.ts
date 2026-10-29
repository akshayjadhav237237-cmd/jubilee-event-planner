import { z } from 'zod';
import { ALL_IDEAS } from '../../data/ideas';
import { selectIdeas } from '../../domain/ideas';
import { ok, type Result } from '../../domain/result';
import type { IdeaItem } from '../../domain/types';
import type { AiError, ApiKeyPort, FetchPort, IdeaInput, IdeaProvider } from '../ports';
import { postGeminiContent } from './client';
import { buildGeminiRequestBody } from './requestBuilder';

export interface GeminiIdeaProviderDeps {
  readonly fetchPort: FetchPort;
  readonly apiKeyPort: ApiKeyPort;
  readonly timeoutMs?: number | undefined;
}

const IdeaItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(['theme', 'menu', 'activity']),
  description: z.string().min(1),
  votes: z.number().int().nonnegative().default(0),
});

const IdeasPayloadSchema = z.union([
  z.array(IdeaItemSchema),
  z.object({ ideas: z.array(IdeaItemSchema) }).transform((data) => data.ideas),
]);

function buildIdeaPrompt(input: IdeaInput): string {
  const brief = input.plan.brief;
  return [
    'You are Jubilee Cultural Event Specialist.',
    'Output STRICT JSON array of idea items: [{ "id": string, "title": string, "category": "theme"|"menu"|"activity", "description": string }]',
    `Event: ${brief.eventType} (${brief.subFormat}), Setting: ${brief.setting}`,
    `Requested Category: ${input.category ?? 'all'}`,
    `Limit: ${input.limit ?? 5}`,
  ].join('\n');
}

function parseIdeas(rawJson: string): readonly IdeaItem[] | null {
  try {
    const cleaned = rawJson.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, '$1').trim();
    const parsed = JSON.parse(cleaned);
    const result = IdeasPayloadSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function fallbackIdeas(input: IdeaInput): readonly IdeaItem[] {
  const filteredCatalog = input.category
    ? ALL_IDEAS.filter((i) => i.category === input.category)
    : undefined;
  const options =
    filteredCatalog !== undefined
      ? input.limit !== undefined
        ? { catalog: filteredCatalog, limit: input.limit }
        : { catalog: filteredCatalog }
      : input.limit !== undefined
        ? { limit: input.limit }
        : undefined;
  return selectIdeas(input.plan.brief, options);
}

/** Creates a live IdeaProvider that generates cultural ideas using Gemini with deterministic fallback. */
export function createGeminiIdeaProvider(deps: GeminiIdeaProviderDeps): IdeaProvider {
  return {
    mode: 'live',
    async suggest(input: IdeaInput): Promise<Result<readonly IdeaItem[], AiError>> {
      const apiKey = await deps.apiKeyPort.get();
      if (!apiKey || apiKey.trim().length === 0) {
        return ok(fallbackIdeas(input));
      }

      const prompt = buildIdeaPrompt(input);
      const requestBody = buildGeminiRequestBody(prompt);
      const clientResult = await postGeminiContent(
        deps.fetchPort,
        apiKey.trim(),
        requestBody,
        deps.timeoutMs,
      );
      if (!clientResult.ok) {
        return ok(fallbackIdeas(input));
      }

      const parsed = parseIdeas(clientResult.value);
      if (parsed === null) {
        return ok(fallbackIdeas(input));
      }

      return ok(parsed);
    },
  };
}
