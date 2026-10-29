import type { ApiKeyPort, NoncePort } from './ports';

/** Creates an in-memory API key store with get, set, and clear operations. */
export function createMemoryApiKey(initialKey: string | null = null): ApiKeyPort {
  let storedKey: string | null = initialKey;

  return {
    get: async () => storedKey,
    set: async (key: string) => {
      storedKey = key.trim().length > 0 ? key.trim() : null;
    },
    clear: async () => {
      storedKey = null;
    },
  };
}

/** Creates a pseudo-random nonce generator using crypto or Math.random fallback. */
export function createRandomNonce(): NoncePort {
  let counter = 0;
  return {
    generate: (): string => {
      counter += 1;
      const rand = Math.floor(Math.random() * 1_000_000_000).toString(36);
      return `nonce_${Date.now().toString(36)}_${rand}_${counter}`;
    },
  };
}
