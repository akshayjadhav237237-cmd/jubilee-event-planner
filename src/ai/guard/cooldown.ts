export interface CooldownLimiter {
  checkAndRecord(): boolean;
  reset(): void;
}

/** Creates a rate-limiting cooldown guard enforcing a minimum interval between calls. */
export function createCooldownLimiter(clock: () => number, minIntervalMs = 1000): CooldownLimiter {
  let lastRecordedMs: number | null = null;

  return {
    checkAndRecord(): boolean {
      const now = clock();
      if (lastRecordedMs !== null && now - lastRecordedMs < minIntervalMs) {
        return false;
      }
      lastRecordedMs = now;
      return true;
    },
    reset(): void {
      lastRecordedMs = null;
    },
  };
}
