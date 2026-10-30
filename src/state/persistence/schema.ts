import { z } from 'zod';
import { PlanSchema } from '../../domain/schemas';
import type { StorageError } from '../../domain/ports';
import { ok, err, type Result } from '../../domain/result';

export const STORAGE_VERSION = 2;
export const STORAGE_KEY = 'jubilee_plan_v2';
export const MAX_STORAGE_BYTES = 1024 * 1024;
export const MAX_BACKUP_BYTES = 500 * 1024;

export const StoredEnvelopeSchema = z
  .object({
    version: z.number(),
    plan: PlanSchema,
  })
  .strict();

export type StoredEnvelope = z.infer<typeof StoredEnvelopeSchema>;

export const BackupPayloadSchema = z
  .object({
    schemaVersion: z.literal(2),
    exportedAt: z.string(),
    plan: PlanSchema.strict(),
  })
  .strict();

export type BackupPayload = z.infer<typeof BackupPayloadSchema>;

function hasPrototypePollution(raw: string): boolean {
  return /"(?:__proto__|constructor)"\s*:/.test(raw);
}

/** Validates raw backup JSON string against BackupPayloadSchema, rejecting invalid sizes, pollution, and extra keys. */
export function validateBackupJson(raw: string): Result<BackupPayload, StorageError> {
  if (raw.length > MAX_BACKUP_BYTES) {
    return err({
      code: 'OVERSIZED_DATA',
      message: 'Backup payload exceeds maximum allowed size of 500KB',
    });
  }

  if (hasPrototypePollution(raw)) {
    return err({
      code: 'PROTOTYPE_POLLUTION',
      message: 'Prototype pollution detected in backup payload',
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw, (key, value) => {
      if (key === '__proto__' || key === 'constructor') {
        throw new Error('Prototype pollution detected');
      }
      return value;
    });
  } catch {
    return err({
      code: 'CORRUPT_DATA',
      message: 'Failed to parse backup JSON',
    });
  }

  const result = BackupPayloadSchema.safeParse(parsed);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue ? firstIssue.message : 'Invalid backup schema';
    return err({
      code: 'VALIDATION_ERROR',
      message,
    });
  }

  return ok(result.data);
}
