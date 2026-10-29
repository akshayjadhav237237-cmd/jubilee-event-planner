import { err, ok, type Result } from '../../domain/result';
import { buildAiContext } from '../context';
import {
  createCooldownLimiter,
  createLruCache,
  isPromptInjection,
  sanitizeUserInput,
} from '../guard';
import type {
  AiError,
  ApiKeyPort,
  AssistantInput,
  AssistantProvider,
  AssistantResult,
  FetchPort,
  NoncePort,
} from '../ports';
import { postGeminiContent } from './client';
import { buildGeminiPrompt, buildGeminiRequestBody } from './requestBuilder';
import { parseGeminiResponse } from './responseParser';

export interface GeminiAssistantDeps {
  readonly fetchPort: FetchPort;
  readonly apiKeyPort: ApiKeyPort;
  readonly noncePort: NoncePort;
  readonly clock?: (() => number) | undefined;
  readonly timeoutMs?: number | undefined;
  readonly cacheCapacity?: number | undefined;
  readonly cooldownMs?: number | undefined;
}

/** Creates a live AssistantProvider communicating with Gemini with security guards and caching. */
export function createGeminiAssistant(deps: GeminiAssistantDeps): AssistantProvider {
  const clockFn = deps.clock ?? Date.now;
  const cooldown = createCooldownLimiter(clockFn, deps.cooldownMs ?? 1000);
  const cache = createLruCache<AssistantResult>(deps.cacheCapacity ?? 20);

  return {
    mode: 'live',
    async interpret(input: AssistantInput): Promise<Result<AssistantResult, AiError>> {
      const apiKey = await deps.apiKeyPort.get();
      if (apiKey === null || apiKey.trim().length === 0) {
        return err({ code: 'no_key', message: 'API key is required for live assistant' });
      }

      const sanitized = sanitizeUserInput(input.prompt);
      if (isPromptInjection(sanitized)) {
        return err({ code: 'blocked_input', message: 'Input contains prohibited patterns' });
      }

      if (!cooldown.checkAndRecord()) {
        return err({
          code: 'rate_limited',
          message: 'Please wait before sending another request',
        });
      }

      const cacheKey = `${sanitized}::${input.plan.updatedAt}`;
      const cached = cache.get(cacheKey);
      if (cached !== undefined) {
        return ok(cached);
      }

      const nonce = deps.noncePort.generate();
      const context = buildAiContext(input.plan, input.today);
      const prompt = buildGeminiPrompt(context, sanitized, nonce);
      const requestBody = buildGeminiRequestBody(prompt);

      const clientResult = await postGeminiContent(
        deps.fetchPort,
        apiKey.trim(),
        requestBody,
        deps.timeoutMs,
      );
      if (!clientResult.ok) {
        return clientResult;
      }

      const parsed = parseGeminiResponse(clientResult.value);
      if (parsed.ok) {
        cache.set(cacheKey, parsed.value);
      }
      return parsed;
    },
  };
}
