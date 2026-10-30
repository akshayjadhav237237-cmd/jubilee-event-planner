import type { Plan } from '../../domain/types';
import type { StorageError } from '../../domain/ports';
import { ok, err, type Result } from '../../domain/result';
import { validateBackupJson, type BackupPayload } from './schema';

/** Exports a Plan into a formatted JSON string backup payload. */
export function exportPlanToJson(plan: Plan, nowIso?: string): string {
  const payload: BackupPayload = {
    schemaVersion: 2,
    exportedAt: nowIso ?? new Date().toISOString(),
    plan,
  };
  return JSON.stringify(payload, null, 2);
}

/** Imports and validates a Plan from a backup JSON string. */
export function importPlanFromJson(jsonText: string): Result<Plan, StorageError> {
  const validation = validateBackupJson(jsonText);
  if (!validation.ok) {
    return err(validation.error);
  }
  return ok(validation.value.plan);
}
