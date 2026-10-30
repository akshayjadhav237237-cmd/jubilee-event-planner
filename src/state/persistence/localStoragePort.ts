import type { Plan } from '../../domain/types';
import type { StoragePort, StorageError } from '../../domain/ports';
import { ok, err, type Result } from '../../domain/result';
import { STORAGE_KEY, STORAGE_VERSION, type StoredEnvelope } from './schema';
import { defaultScheduler, type SchedulerPort } from './scheduler';
import { setStorageNotice } from './notice';
import { loadPlanFromStorage, resolveStorage } from './storageReader';

export type LocalStoragePortOptions = {
  readonly storage?: Storage;
  readonly scheduler?: SchedulerPort;
  readonly delayMs?: number;
  readonly storageKey?: string;
};

function isQuotaExceededError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const obj = error as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? obj.name : '';
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
    return true;
  }
  const code = typeof obj.code === 'number' ? obj.code : 0;
  if (code === 22 || code === 1014) {
    return true;
  }
  const message = typeof obj.message === 'string' ? obj.message.toLowerCase() : '';
  return message.includes('quota');
}

function writePlanToStorage(storage: Storage, key: string, plan: Plan): Result<void, StorageError> {
  try {
    const envelope: StoredEnvelope = {
      version: STORAGE_VERSION,
      plan,
    };
    storage.setItem(key, JSON.stringify(envelope));
    return ok(undefined);
  } catch (error) {
    const isQuota = isQuotaExceededError(error);
    const errObj: StorageError = {
      code: isQuota ? 'QUOTA_EXCEEDED' : 'STORAGE_ERROR',
      message: isQuota ? 'Storage quota exceeded' : 'Failed to save to local storage',
    };
    setStorageNotice(errObj);
    return err(errObj);
  }
}

/** Creates a StoragePort backed by window.localStorage with debouncing and error notices. */
export function createLocalStoragePort(options: LocalStoragePortOptions = {}): StoragePort {
  const scheduler = options.scheduler ?? defaultScheduler;
  const delayMs = options.delayMs ?? 300;
  const key = options.storageKey ?? STORAGE_KEY;

  let cancelPending: (() => void) | null = null;

  return {
    load(): Result<Plan | null, StorageError> {
      const storage = resolveStorage(options.storage);
      if (!storage) {
        const errObj: StorageError = {
          code: 'STORAGE_UNAVAILABLE',
          message: 'Local storage unavailable in current environment',
        };
        setStorageNotice(errObj);
        return err(errObj);
      }
      return loadPlanFromStorage(storage, key);
    },

    save(plan: Plan): Result<void, StorageError> {
      const storage = resolveStorage(options.storage);
      if (!storage) {
        const errObj: StorageError = {
          code: 'STORAGE_UNAVAILABLE',
          message: 'Local storage unavailable in current environment',
        };
        setStorageNotice(errObj);
        return err(errObj);
      }

      if (cancelPending) {
        cancelPending();
        cancelPending = null;
      }

      let syncResult: Result<void, StorageError> = ok(undefined);
      cancelPending = scheduler(() => {
        const res = writePlanToStorage(storage, key, plan);
        if (!res.ok) {
          syncResult = res;
        }
      }, delayMs);

      if (!syncResult.ok) {
        return syncResult;
      }
      return ok(undefined);
    },
  };
}

/** Clears the persisted plan from storage. */
export function clearStorage(storage?: Storage): Result<void, StorageError> {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return ok(undefined);
  }
  try {
    targetStorage.removeItem(STORAGE_KEY);
    return ok(undefined);
  } catch (error) {
    return err({
      code: 'STORAGE_ERROR',
      message: error instanceof Error ? error.message : 'Failed to clear storage',
    });
  }
}
