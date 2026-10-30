import { describe, expect, it } from 'vitest';
import { PlanSchema } from '../../../src/domain/schemas';
import { migrateV1ToV2 } from '../../../src/state/persistence/migrate';
import { SAMPLE_V1_FIXTURE } from './fixtures';

describe('Persistence migration: migrateV1ToV2', () => {
  it('successfully migrates v1 fixture to valid v2 Plan conforming to PlanSchema', () => {
    const result = migrateV1ToV2(SAMPLE_V1_FIXTURE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const plan = result.value;
    expect(plan.id).toBe('legacy-plan-999');
    expect(plan.brief.title).toBe('Legacy Silver Anniversary');
    expect(plan.brief.setting).toBe('outdoor');
    expect(plan.brief.subFormat).toBe('traditional');
    expect(plan.brief.flags.kids).toBe(false);
    expect(plan.brief.flags.dietary).toBe(false);
    expect(plan.brief.top3Priorities).toHaveLength(3);

    expect(plan.budget.categories).toHaveLength(1);
    const cat = plan.budget.categories[0];
    expect(cat?.spent).toBe(0);
    expect(cat?.weight).toBe(1);

    expect(plan.timeline).toHaveLength(1);
    expect(plan.timeline[0]?.dependencies).toEqual([]);

    expect(plan.vendorChecklist).toEqual([]);
    expect(plan.quotes).toEqual([]);
    expect(plan.ideas).toEqual([]);

    const schemaCheck = PlanSchema.safeParse(plan);
    expect(schemaCheck.success).toBe(true);
  });

  it('migrates unwrapped v1 plan object directly', () => {
    const unwrapped = SAMPLE_V1_FIXTURE['plan'];
    const result = migrateV1ToV2(unwrapped);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBe('legacy-plan-999');
  });

  it('preserves existing quotes, ideas, and checklist if present in legacy data', () => {
    const legacyWithItems = {
      id: 'legacy-rich',
      brief: {
        title: 'Rich Legacy',
        eventType: 'birthday',
        subFormat: 'milestone',
        guestCount: 50,
        totalBudget: 1000000,
        currency: 'USD',
        eventDate: '2027-06-15',
        setting: 'indoor',
      },
      budget: { totalBudget: 1000000, categories: [] },
      timeline: [],
      vendorChecklist: [
        {
          id: 'vc1',
          title: 'Check Sound',
          completed: true,
          category: 'AV',
          redFlags: ['Bad wires'],
        },
      ],
      quotes: [
        { id: 'q1', vendorName: 'DJ Ace', category: 'AV', amount: 50000, status: 'accepted' },
      ],
      ideas: [
        {
          id: 'id1',
          title: 'Neon theme',
          category: 'theme',
          description: 'Glow in dark',
          votes: 5,
        },
      ],
    };

    const result = migrateV1ToV2(legacyWithItems);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.vendorChecklist).toHaveLength(1);
    expect(result.value.vendorChecklist[0]?.redFlags).toEqual(['Bad wires']);
    expect(result.value.quotes).toHaveLength(1);
    expect(result.value.quotes[0]?.status).toBe('accepted');
    expect(result.value.ideas).toHaveLength(1);
    expect(result.value.ideas[0]?.votes).toBe(5);
  });

  it('returns MIGRATION_FAILED when given null or non-object primitive', () => {
    const nullResult = migrateV1ToV2(null);
    expect(nullResult.ok).toBe(false);
    if (!nullResult.ok) {
      expect(nullResult.error.code).toBe('MIGRATION_FAILED');
    }

    const strResult = migrateV1ToV2('invalid-string');
    expect(strResult.ok).toBe(false);
    if (!strResult.ok) {
      expect(strResult.error.code).toBe('MIGRATION_FAILED');
    }
  });

  it('returns MIGRATION_FAILED when eventDate cannot be parsed as valid ISO date', () => {
    const invalidDatePlan = {
      brief: {
        title: 'Bad Date',
        eventDate: 'not-a-date',
      },
    };
    const result = migrateV1ToV2(invalidDatePlan);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('MIGRATION_FAILED');
    }
  });
});
