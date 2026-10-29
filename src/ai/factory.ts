import { ok, type Result } from '../domain/result';
import { createRandomNonce } from './apiKey';
import { createGeminiAssistant } from './gemini';
import { createLocalAssistant } from './local';
import type {
  AiError,
  ApiKeyPort,
  AssistantInput,
  AssistantProvider,
  AssistantResult,
  FetchPort,
  FetchResponse,
  NoncePort,
} from './ports';

export interface AssistantFactoryDeps {
  readonly apiKeyPort: ApiKeyPort;
  readonly fetchPort?: FetchPort | undefined;
  readonly noncePort?: NoncePort | undefined;
  readonly clock?: (() => number) | undefined;
}

function attachFallbackNotice(result: AssistantResult, notice: string): AssistantResult {
  return {
    ...result,
    fallbackNotice: notice,
  };
}

function resolveFetchPort(port?: FetchPort): FetchPort | undefined {
  if (port) {
    return port;
  }
  if (typeof fetch !== 'undefined') {
    return async (url, init): Promise<FetchResponse> => {
      const res = await fetch(url, init);
      return {
        ok: res.ok,
        status: res.status,
        text: async () => res.text(),
        json: async () => res.json(),
      };
    };
  }
  return undefined;
}

/** Creates a composite AssistantProvider that routes to live Gemini with offline local fallback. */
export function createAssistant(deps: AssistantFactoryDeps): AssistantProvider {
  let currentMode: 'offline' | 'live' = 'offline';
  const fetchPort = resolveFetchPort(deps.fetchPort);
  const noncePort = deps.noncePort ?? createRandomNonce();
  const localAssistant = createLocalAssistant();
  const liveAssistant = fetchPort
    ? createGeminiAssistant({
        fetchPort,
        apiKeyPort: deps.apiKeyPort,
        noncePort,
        clock: deps.clock,
      })
    : null;

  return {
    get mode(): 'offline' | 'live' {
      return currentMode;
    },
    async interpret(input: AssistantInput): Promise<Result<AssistantResult, AiError>> {
      const apiKey = await deps.apiKeyPort.get();
      const hasKey = apiKey !== null && apiKey.trim().length > 0;

      if (hasKey && liveAssistant !== null) {
        currentMode = 'live';
        const liveResult = await liveAssistant.interpret(input);
        if (liveResult.ok) {
          return liveResult;
        }

        currentMode = 'offline';
        const localResult = await localAssistant.interpret(input);
        if (localResult.ok) {
          const reason = liveResult.error.message || liveResult.error.code;
          const notice = `Live assistant unavailable (${reason}); handled offline via local engine.`;
          return ok(attachFallbackNotice(localResult.value, notice));
        }
        return localResult;
      }

      currentMode = 'offline';
      const localResult = await localAssistant.interpret(input);
      if (localResult.ok) {
        const reason = hasKey ? 'network client unavailable' : 'no API key configured';
        const notice = `Live assistant unavailable (${reason}); handled offline via local engine.`;
        return ok(attachFallbackNotice(localResult.value, notice));
      }
      return localResult;
    },
  };
}
