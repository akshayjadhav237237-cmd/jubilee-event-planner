import { describe, expect, it } from 'vitest';
import type { BudgetState, EventBrief } from '../../../src/domain/types';
import type { IsoDate } from '../../../src/domain/dates';
import {
  computeBudgetSummary,
  computeCategoryRows,
  getBudgetAlerts,
  validateSpend,
  validateTransfer,
} from '../../../src/features/budget/view';

const SAMPLE_BRIEF: EventBrief = {
  title: 'Test Gala',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 100,
  totalBudget: 1000000,
  currency: 'INR',
  eventDate: '2027-10-10' as IsoDate,
  setting: 'indoor',
  flags: {
    kids: false,
    elders: false,
    dietary: false,
    accessibility: false,
    openBar: false,
    amplifiedMusic: false,
    surprise: false,
  },
  top3Priorities: ['Venue & Facilities', 'Catering & Beverages', 'Decor & Floral'],
};

const SAMPLE_BUDGET: BudgetState = {
  totalBudget: 1000000,
  contingencyRate: 10,
  categories: [
    { id: 'venue', name: 'Venue & Facilities', allocated: 400000, spent: 100000, weight: 40 },
    { id: 'catering', name: 'Catering & Beverages', allocated: 500000, spent: 550000, weight: 50 },
    { id: 'decor', name: 'Decor & Floral', allocated: 100000, spent: 0, weight: 10 },
  ],
};

describe('Budget view model', () => {
  it('computes budget summary vitals accurately', () => {
    const summary = computeBudgetSummary(SAMPLE_BRIEF, SAMPLE_BUDGET);
    expect(summary.totalBudgetMinor).toBe(1000000);
    expect(summary.totalSpentMinor).toBe(650000);
    expect(summary.contingencyRate).toBe(10);
    expect(summary.spendPercentage).toBe(65);
    expect(summary.totalBudgetFormatted).toContain('10,000');
  });

  it('formats category rows with overspend detection', () => {
    const rows = computeCategoryRows(SAMPLE_BUDGET, 'INR');
    expect(rows.length).toBe(3);

    const venue = rows.find((r) => r.id === 'venue');
    expect(venue?.percentSpent).toBe(25);
    expect(venue?.isOverspent).toBe(false);

    const catering = rows.find((r) => r.id === 'catering');
    expect(catering?.isOverspent).toBe(true);
  });

  it('validates budget transfers with error cases', () => {
    const valid = validateTransfer(SAMPLE_BUDGET, {
      fromId: 'venue',
      toId: 'decor',
      amountMajor: '500',
      currency: 'INR',
    });
    expect(valid.ok).toBe(true);

    const sameCat = validateTransfer(SAMPLE_BUDGET, {
      fromId: 'venue',
      toId: 'venue',
      amountMajor: '500',
      currency: 'INR',
    });
    expect(sameCat.ok).toBe(false);

    const unknownCat = validateTransfer(SAMPLE_BUDGET, {
      fromId: 'unknown',
      toId: 'decor',
      amountMajor: '500',
      currency: 'INR',
    });
    expect(unknownCat.ok).toBe(false);

    const invalidAmount = validateTransfer(SAMPLE_BUDGET, {
      fromId: 'venue',
      toId: 'decor',
      amountMajor: '-10',
      currency: 'INR',
    });
    expect(invalidAmount.ok).toBe(false);

    const overAllocated = validateTransfer(SAMPLE_BUDGET, {
      fromId: 'venue',
      toId: 'decor',
      amountMajor: '9999999',
      currency: 'INR',
    });
    expect(overAllocated.ok).toBe(false);
  });

  it('validates spend logging', () => {
    const valid = validateSpend(SAMPLE_BUDGET, 'venue', '200', 'INR');
    expect(valid.ok).toBe(true);

    const unknown = validateSpend(SAMPLE_BUDGET, 'unknown', '200', 'INR');
    expect(unknown.ok).toBe(false);

    const invalid = validateSpend(SAMPLE_BUDGET, 'venue', 'abc', 'INR');
    expect(invalid.ok).toBe(false);
  });

  it('retrieves active domain budget alerts', () => {
    const alerts = getBudgetAlerts(SAMPLE_BRIEF, SAMPLE_BUDGET);
    expect(alerts.some((a) => a.code === 'OVERSPENT_BUDGET')).toBe(true);
  });
});
