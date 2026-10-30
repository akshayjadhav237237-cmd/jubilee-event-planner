import { describe, expect, it } from 'vitest';
import { exportPlanToJson, importPlanFromJson } from '../../../src/state/persistence';
import { buildPlan } from '../../../src/state/buildPlan';
import { DEMO_SCENARIOS } from '../../../src/data/demoScenarios';

describe('Plan Persistence Round-Trip and Corrupt Data Rejection', () => {
  const clock = (): Date => new Date('2026-10-30T00:00:00Z');
  let idCounter = 0;
  const ids = (): string => `id_${++idCounter}`;

  it('successfully round-trips all three demo scenarios without data loss', () => {
    for (const scenario of DEMO_SCENARIOS) {
      const plan = buildPlan(scenario.brief, { clock, ids });
      const serialized = exportPlanToJson(plan, '2026-10-30T12:00:00.000Z');

      const restoredResult = importPlanFromJson(serialized);
      expect(restoredResult.ok).toBe(true);
      if (restoredResult.ok) {
        expect(restoredResult.value).toEqual(plan);
      }
    }
  });

  it('rejects corrupt truncated JSON with CORRUPT_DATA error', () => {
    const corruptCases = ['{ "schemaVersion": 2, "exportedAt":', '{"plan":', 'not-json', ''];

    for (const corrupt of corruptCases) {
      const res = importPlanFromJson(corrupt);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe('CORRUPT_DATA');
      }
    }
  });

  it('rejects JSON payloads containing __proto__ or constructor prototype pollution', () => {
    const protoPollution =
      '{"schemaVersion":2,"exportedAt":"2026-10-30T00:00:00Z","__proto__":{"isAdmin":true},"plan":{}}';

    const res = importPlanFromJson(protoPollution);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('PROTOTYPE_POLLUTION');
    }

    const constructorPollution =
      '{"schemaVersion":2,"exportedAt":"2026-10-30T00:00:00Z","constructor":{"isAdmin":true},"plan":{}}';

    const res2 = importPlanFromJson(constructorPollution);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe('PROTOTYPE_POLLUTION');
    }
  });

  it('rejects payloads with disallowed unknown extra fields', () => {
    const firstScenario = DEMO_SCENARIOS[0];
    if (!firstScenario) {
      throw new Error('DEMO_SCENARIOS is empty');
    }
    const extraKeys = JSON.stringify({
      schemaVersion: 2,
      exportedAt: '2026-10-30T00:00:00Z',
      unauthorizedField: 'malicious',
      plan: buildPlan(firstScenario.brief, { clock, ids }),
    });

    const res = importPlanFromJson(extraKeys);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('rejects payloads exceeding the 500KB size cap', () => {
    const hugeString = 'a'.repeat(600 * 1024);
    const res = importPlanFromJson(hugeString);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('OVERSIZED_DATA');
    }
  });
});
