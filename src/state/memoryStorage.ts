import type { Plan } from '../domain/types';
import type { StoragePort, StorageError } from '../domain/ports';
import { ok, type Result } from '../domain/result';

/** Creates an in-memory storage adapter implementing StoragePort. */
export function createMemoryStorage(initialPlan: Plan | null = null): StoragePort {
  let stored: Plan | null = initialPlan;

  return {
    load(): Result<Plan | null, StorageError> {
      return ok(stored);
    },
    save(plan: Plan): Result<void, StorageError> {
      stored = plan;
      return ok(undefined);
    },
  };
}
