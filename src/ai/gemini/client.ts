import { GEMINI_ENDPOINT_BASE, GEMINI_MODEL, REQUEST_TIMEOUT_MS } from '../../config/constants';
import { err, ok, type Result } from '../../domain/result';
import type { AiError, FetchPort, FetchResponse } from '../ports';

interface FetchRequestOptions {
  readonly apiKey: string;
  readonly bodyJson: string;
  readonly timeoutMs: number;
}

function mapHttpError(status: number): AiError {
  if (status === 429) {
    return { code: 'rate_limited', message: 'Gemini rate limit exceeded', status };
  }
  if (status === 401 || status === 403) {
    return { code: 'no_key', message: 'Invalid or unauthorized Gemini API key', status };
  }
  return { code: 'http', message: `Gemini request failed with HTTP ${status}`, status };
}

function getCandidateString(data: Record<string, unknown>): string | null {
  const cands = data['candidates'];
  if (!Array.isArray(cands) || cands.length === 0) return null;
  const first = cands[0] as Record<string, unknown> | undefined;
  const content = first?.['content'] as Record<string, unknown> | undefined;
  const parts = content?.['parts'];
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const part = parts[0] as Record<string, unknown> | undefined;
  const text = part?.['text'];
  return typeof text === 'string' && text.trim().length > 0 ? text : null;
}

function extractCandidateText(bodyText: string): Result<string, AiError> {
  try {
    const data = JSON.parse(bodyText) as Record<string, unknown>;
    const text =
      getCandidateString(data) ?? (typeof data['text'] === 'string' ? data['text'] : null);
    if (text && text.trim().length > 0) {
      return ok(text);
    }
    return err({ code: 'bad_response', message: 'Gemini response missing candidate text' });
  } catch {
    return err({ code: 'bad_response', message: 'Gemini response body was not valid JSON' });
  }
}

async function executeFetch(
  fetchPort: FetchPort,
  url: string,
  opts: FetchRequestOptions,
): Promise<Result<FetchResponse, AiError>> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, opts.timeoutMs);

  try {
    const response = await fetchPort(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': opts.apiKey,
      },
      body: opts.bodyJson,
      signal: controller.signal,
    });
    return ok(response);
  } catch (error) {
    if (controller.signal.aborted) {
      return err({ code: 'timeout', message: 'Gemini request timed out' });
    }
    const message = error instanceof Error ? error.message : 'Gemini network request failed';
    return err({ code: 'network', message });
  } finally {
    clearTimeout(timer);
  }
}

/** Sends an inference request to Gemini generateContent, retrying transient HTTP errors and verifying format. */
export function postGeminiContent(
  fetchPort: FetchPort,
  apiKey: string,
  bodyJson: string,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Result<string, AiError>> {
  const endpoint = `${GEMINI_ENDPOINT_BASE}/models/${GEMINI_MODEL}:generateContent`;
  const opts: FetchRequestOptions = { apiKey, bodyJson, timeoutMs };

  return (async (): Promise<Result<string, AiError>> => {
    let lastError: AiError = { code: 'http', message: 'Unknown request error' };

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const fetchResult = await executeFetch(fetchPort, endpoint, opts);
      if (!fetchResult.ok) {
        return fetchResult;
      }

      const response = fetchResult.value;
      if (response.ok) {
        const bodyText = await response.text();
        return extractCandidateText(bodyText);
      }

      lastError = mapHttpError(response.status);
      const isRetriable = response.status === 429 || response.status >= 500;
      if (attempt === 0 && isRetriable) {
        continue;
      }
      return err(lastError);
    }

    return err(lastError);
  })();
}
