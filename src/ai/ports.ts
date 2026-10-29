import type { PlanCommand } from '../domain/commands';
import type { IsoDate } from '../domain/dates';
import type { Result } from '../domain/result';
import type { IdeaCategory, IdeaItem, Plan } from '../domain/types';

export type AiErrorCode =
  'no_key' | 'timeout' | 'network' | 'http' | 'blocked_input' | 'bad_response' | 'rate_limited';

export interface AiError {
  readonly code: AiErrorCode;
  readonly message: string;
  readonly status?: number | undefined;
}

export interface AssistantInput {
  readonly prompt: string;
  readonly plan: Plan;
  readonly today?: IsoDate | undefined;
}

export type AssistantResult =
  | {
      readonly kind: 'commands';
      readonly commands: readonly PlanCommand[];
      readonly summary: string;
      readonly fallbackNotice?: string | undefined;
    }
  | {
      readonly kind: 'clarify';
      readonly question: string;
      readonly fallbackNotice?: string | undefined;
    }
  | {
      readonly kind: 'refuse';
      readonly reason: string;
      readonly fallbackNotice?: string | undefined;
    };

export interface AssistantProvider {
  readonly mode: 'offline' | 'live';
  interpret(input: AssistantInput): Promise<Result<AssistantResult, AiError>>;
}

export interface IdeaInput {
  readonly plan: Plan;
  readonly category?: IdeaCategory | undefined;
  readonly limit?: number | undefined;
}

export interface IdeaProvider {
  readonly mode: 'offline' | 'live';
  suggest(input: IdeaInput): Promise<Result<readonly IdeaItem[], AiError>>;
}

export interface FetchResponse {
  readonly ok: boolean;
  readonly status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

export type FetchPort = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<FetchResponse>;

export interface ApiKeyPort {
  get(): Promise<string | null>;
  set(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface NoncePort {
  generate(): string;
}

export interface ClockPort {
  now(): number;
}
