import { describe, it, expect } from 'vitest';
import { generateBriefs, makeBrief } from '../helpers/briefs';
import {
  buildBudget,
  setCategoryWeight,
  transferBudget,
  setContingency,
  logSpend,
  budgetAlerts,
} from '../../src/domain/budget/engine';
import { CATEGORIES, getCategoriesForEventType } from '../../src/data/categories';
import { getPresetWeights } from '../../src/data/budgetPresets';
import { PER_HEAD_FLOORS, getPerHeadFloor } from '../../src/data/perHeadFloors';
import type { AdaptationEffects } from '../../src/domain/adaptationTypes';

describe('Budget Engine & Catalogs', () => {
  it('preserves exact budget invariant across 200 generated briefs', () => {
    const briefs = generateBriefs(200);
    for (const [idx, brief] of briefs.entries()) {
      const effects: AdaptationEffects | undefined =
        idx % 2 === 0
          ? {
              contingencyDelta: (idx % 6) - 1,
              weightFactors: { venue: 1.2, catering: 0.8 },
              injectTaskIds: [],
              vendorCheckIds: [],
              alerts: [],
              skipOptionalTasks: false,
              compressTimeline: false,
            }
          : undefined;
      const budget = buildBudget(brief, effects);
      const contingency = Math.floor((budget.totalBudget * budget.contingencyRate) / 100);
      const sum = budget.categories.reduce((acc, c) => acc + c.allocated, 0);
      expect(sum + contingency).toBe(brief.totalBudget);
    }
  });

  it('builds budget states respecting event types and adaptation effects', () => {
    const brief = makeBrief({ eventType: 'wedding', totalBudget: 100000 });
    const standard = buildBudget(brief);
    expect(standard.categories).toHaveLength(10);
    expect(standard.contingencyRate).toBe(5);

    const bday = buildBudget(makeBrief({ eventType: 'birthday', totalBudget: 50000 }));
    expect(bday.categories).toHaveLength(8);

    const comm = buildBudget(makeBrief({ eventType: 'community', totalBudget: 80000 }));
    expect(comm.categories).toHaveLength(9);

    const adapted = buildBudget(brief, {
      contingencyDelta: 20,
      weightFactors: { venue: 2 },
      injectTaskIds: [],
      vendorCheckIds: [],
      alerts: [],
      skipOptionalTasks: false,
      compressTimeline: false,
    });
    expect(adapted.contingencyRate).toBe(15);
  });

  it('handles zero and negative total budgets gracefully', () => {
    const zeroBudget = buildBudget(makeBrief({ totalBudget: 0 }));
    expect(zeroBudget.totalBudget).toBe(0);
    expect(zeroBudget.categories.every((c) => c.allocated === 0)).toBe(true);

    const negBudget = buildBudget(makeBrief({ totalBudget: -5000 }));
    expect(negBudget.totalBudget).toBe(0);
  });

  it('adjusts category weights and reallocates funds proportionately', () => {
    const initial = buildBudget(makeBrief({ totalBudget: 100000 }));
    const venueBefore = initial.categories.find((c) => c.id === 'venue')?.allocated ?? 0;
    const updated = setCategoryWeight(initial, 'venue', 60);
    const venueAfter = updated.categories.find((c) => c.id === 'venue')?.allocated ?? 0;
    expect(venueAfter).toBeGreaterThan(venueBefore);

    const unchanged = setCategoryWeight(initial, 'unknown_cat', 50);
    expect(unchanged).toBe(initial);
  });

  it('transfers budget between categories and respects bounds', () => {
    const budget = buildBudget(makeBrief({ totalBudget: 100000 }));
    const fromBefore = budget.categories.find((c) => c.id === 'venue')?.allocated ?? 0;
    const toBefore = budget.categories.find((c) => c.id === 'catering')?.allocated ?? 0;

    const transferred = transferBudget(budget, 'venue', 'catering', 5000);
    const fromAfter = transferred.categories.find((c) => c.id === 'venue')?.allocated ?? 0;
    const toAfter = transferred.categories.find((c) => c.id === 'catering')?.allocated ?? 0;
    expect(fromAfter).toBe(fromBefore - 5000);
    expect(toAfter).toBe(toBefore + 5000);

    expect(transferBudget(budget, 'venue', 'venue', 1000)).toBe(budget);
    expect(transferBudget(budget, 'venue', 'catering', 0)).toBe(budget);
    expect(transferBudget(budget, 'venue', 'catering', -100)).toBe(budget);
  });

  it('updates contingency within 0% to 15% limits', () => {
    const budget = buildBudget(makeBrief({ totalBudget: 100000 }));
    const normal = setContingency(budget, 10);
    expect(normal.contingencyRate).toBe(10);

    const capped = setContingency(budget, 25);
    expect(capped.contingencyRate).toBe(15);

    const floor = setContingency(budget, -5);
    expect(floor.contingencyRate).toBe(0);
  });

  it('logs expenditures against category spend totals', () => {
    const budget = buildBudget(makeBrief({ totalBudget: 100000 }));
    const spentOnce = logSpend(budget, 'venue', 2000);
    expect(spentOnce.categories.find((c) => c.id === 'venue')?.spent).toBe(2000);

    const spentTwice = logSpend(spentOnce, 'venue', 1500);
    expect(spentTwice.categories.find((c) => c.id === 'venue')?.spent).toBe(3500);

    expect(logSpend(budget, 'missing_id', 500)).toBe(budget);
  });

  it('flags all 5 budget alert conditions accurately', () => {
    const lowBrief = makeBrief({ totalBudget: 1000, guestCount: 100, currency: 'USD' });
    const lowBudget = buildBudget(lowBrief);
    const floorAlerts = budgetAlerts(lowBrief, lowBudget);
    expect(floorAlerts.some((a) => a.code === 'PER_HEAD_FLOOR_VIOLATION')).toBe(true);

    const cappedBudget = setContingency(buildBudget(makeBrief()), 20);
    const capAlerts = budgetAlerts(makeBrief(), cappedBudget);
    expect(capAlerts.some((a) => a.code === 'CONTINGENCY_CAPPED')).toBe(true);

    const heavyWeight = setCategoryWeight(buildBudget(makeBrief()), 'venue', 90);
    const overAllocAlerts = budgetAlerts(makeBrief(), heavyWeight);
    expect(overAllocAlerts.some((a) => a.code === 'CATEGORY_OVER_ALLOCATED')).toBe(true);

    const overspent = logSpend(buildBudget(makeBrief({ totalBudget: 100000 })), 'venue', 999999);
    const spentAlerts = budgetAlerts(makeBrief(), overspent);
    expect(spentAlerts.some((a) => a.code === 'OVERSPENT_BUDGET')).toBe(true);

    const corrupted: typeof lowBudget = { ...lowBudget, totalBudget: 999999999 };
    const remainderAlerts = budgetAlerts(lowBrief, corrupted);
    expect(remainderAlerts.some((a) => a.code === 'UNALLOCATED_REMAINDER')).toBe(true);
  });

  it('verifies static catalogs conform to domain specifications', () => {
    expect(CATEGORIES).toHaveLength(19);
    expect(getCategoriesForEventType('wedding')).toHaveLength(10);
    expect(getCategoriesForEventType('birthday')).toHaveLength(8);
    expect(getCategoriesForEventType('community')).toHaveLength(9);

    const eventTypes = ['wedding', 'birthday', 'community'] as const;
    for (const type of eventTypes) {
      const weights = getPresetWeights(type);
      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(totalWeight).toBe(100);
    }

    expect(getPerHeadFloor('INR', 'wedding')).toBe(PER_HEAD_FLOORS.INR?.wedding);
    expect(getPerHeadFloor('USD', 'birthday')).toBe(PER_HEAD_FLOORS.USD?.birthday);
    expect(getPerHeadFloor('UNKNOWN', 'community')).toBe(1000);
  });
});
