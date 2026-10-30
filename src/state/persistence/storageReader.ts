import type { Plan } from '../../domain/types';
import type { StorageError } from '../../domain/ports';
import { ok, err, type Result } from '../../domain/result';
import { MAX_STORAGE_BYTES, StoredEnvelopeSchema } from './schema';
import { setStorageNotice } from './notice';
import { migrateV1ToV2 } from './migrate';

/** Resolves the target Storage instance or returns null if unavailable. */
export function resolveStorage(customStorage?: Storage): Storage | null {
  if (customStorage) {
    return customStorage;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function parseRawEnvelope(raw: string): Result<unknown, StorageError> {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return err({ code: 'CORRUPT_DATA', message: 'Corrupt storage JSON' });
    }
    return ok(parsed);
  } catch {
    return err({ code: 'CORRUPT_DATA', message: 'Corrupt storage JSON' });
  }
}

function processVersionedPlan(parsed: unknown): Result<Plan, StorageError> {
  const record = parsed as Record<string, unknown>;
  if (record.version === 1) {
    return migrateV1ToV2(record.plan ?? record);
  }
  if (record.version === 2) {
    const envelope = StoredEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      return err({ code: 'CORRUPT_DATA', message: 'Invalid stored envelope shape' });
    }
    return ok(envelope.data.plan);
  }
  return err({ code: 'CORRUPT_DATA', message: 'Unsupported storage version' });
}

/** Reads and parses stored plan envelope from storage, handling migration and errors. */
export function loadPlanFromStorage(
  storage: Storage,
  storageKey: string,
): Result<Plan | null, StorageError> {
  let raw: string | null = null;
  try {
    raw = storage.getItem(storageKey);
  } catch (error) {
    const errObj: StorageError = {
      code: 'STORAGE_UNAVAILABLE',
      message: error instanceof Error ? error.message : 'Storage access failed',
    };
    setStorageNotice(errObj);
    return err(errObj);
  }

  if (raw === null) {
    return ok(null);
  }

  if (raw.length > MAX_STORAGE_BYTES) {
    const errObj: StorageError = {
      code: 'OVERSIZED_DATA',
      message: 'Stored plan exceeds 1MB limit',
    };
    setStorageNotice(errObj);
    return err(errObj);
  }

  const parsedRes = parseRawEnvelope(raw);
  if (!parsedRes.ok) {
    setStorageNotice(parsedRes.error);
    return err(parsedRes.error);
  }

  const planRes = processVersionedPlan(parsedRes.value);
  if (!planRes.ok) {
    setStorageNotice(planRes.error);
    return err(planRes.error);
  }

  return ok(planRes.value);
}
