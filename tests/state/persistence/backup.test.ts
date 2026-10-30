import { describe, expect, it } from 'vitest';
import { exportPlanToJson, importPlanFromJson } from '../../../src/state/persistence/backup';
import { MAX_BACKUP_BYTES, validateBackupJson } from '../../../src/state/persistence/schema';
import { SAMPLE_VALID_PLAN } from './fixtures';

describe('Persistence backup: export and import', () => {
  it('performs export and import round-trip restoring identical plan', () => {
    const fixedIso = '2026-10-30T10:00:00.000Z';
    const exportedJson = exportPlanToJson(SAMPLE_VALID_PLAN, fixedIso);
    expect(exportedJson).toContain('"schemaVersion": 2');
    expect(exportedJson).toContain(`"exportedAt": "${fixedIso}"`);

    const importResult = importPlanFromJson(exportedJson);
    expect(importResult.ok).toBe(true);
    if (!importResult.ok) return;

    expect(importResult.value).toEqual(SAMPLE_VALID_PLAN);
  });

  it('rejects backup payload that exceeds the 500KB cap', () => {
    const oversizedPadding = 'a'.repeat(MAX_BACKUP_BYTES + 10);
    const oversizedJson = JSON.stringify({
      schemaVersion: 2,
      exportedAt: '2026-10-30T10:00:00.000Z',
      plan: SAMPLE_VALID_PLAN,
      padding: oversizedPadding,
    });

    const result = importPlanFromJson(oversizedJson);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('OVERSIZED_DATA');
      expect(result.error.message).toContain('500KB');
    }
  });

  it('rejects prototype pollution with __proto__ key', () => {
    const maliciousJson = JSON.stringify({
      schemaVersion: 2,
      exportedAt: '2026-10-30T10:00:00.000Z',
      plan: SAMPLE_VALID_PLAN,
    }).replace('{', '{"__proto__":{"polluted":true},');

    const result = importPlanFromJson(maliciousJson);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PROTOTYPE_POLLUTION');
    }
  });

  it('rejects prototype pollution with constructor key', () => {
    const maliciousJson = JSON.stringify({
      schemaVersion: 2,
      exportedAt: '2026-10-30T10:00:00.000Z',
      plan: SAMPLE_VALID_PLAN,
    }).replace('{', '{"constructor":{"prototype":{"polluted":true}},');

    const result = importPlanFromJson(maliciousJson);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PROTOTYPE_POLLUTION');
    }
  });

  it('rejects unknown/extra keys on root envelope', () => {
    const withExtraEnvelopeKey = JSON.stringify({
      schemaVersion: 2,
      exportedAt: '2026-10-30T10:00:00.000Z',
      plan: SAMPLE_VALID_PLAN,
      unrecognizedField: 'danger',
    });

    const result = validateBackupJson(withExtraEnvelopeKey);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('rejects unknown/extra keys inside the plan object', () => {
    const withExtraPlanKey = JSON.stringify({
      schemaVersion: 2,
      exportedAt: '2026-10-30T10:00:00.000Z',
      plan: {
        ...SAMPLE_VALID_PLAN,
        extraInjectedProperty: 'malicious',
      },
    });

    const result = validateBackupJson(withExtraPlanKey);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('returns CORRUPT_DATA on invalid non-JSON syntax', () => {
    const result = importPlanFromJson('this is definitely not { valid json');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CORRUPT_DATA');
    }
  });
});
