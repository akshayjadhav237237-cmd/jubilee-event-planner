import { beforeEach, describe, expect, it } from 'vitest';
import { getVendorGuidesForEventType } from '../../src/data/vendors';
import type { BudgetState, EventBrief, VendorQuote } from '../../src/domain/types';
import {
  addQuote,
  buildVendorState,
  registerVendorGuidesProvider,
  removeQuote,
  summarizeQuotes,
} from '../../src/domain/vendors';

const WEDDING_CATS = [
  'venue',
  'catering',
  'photography',
  'attire',
  'decor',
  'entertainment',
  'invitations',
  'hair_makeup',
  'coordinator',
  'transport',
] as const;

const BIRTHDAY_CATS = [
  'venue',
  'catering',
  'cake',
  'entertainment',
  'decor',
  'favors',
  'photography',
  'invitations',
] as const;

function createDummyBrief(eventType: EventBrief['eventType']): EventBrief {
  return {
    title: 'Test Celebration',
    eventType,
    subFormat: 'standard',
    guestCount: 50,
    totalBudget: 1_000_000,
    currency: 'USD',
    eventDate: '2026-12-01' as EventBrief['eventDate'],
    setting: 'outdoor',
    flags: {
      kids: false,
      elders: false,
      dietary: false,
      accessibility: false,
      openBar: false,
      amplifiedMusic: false,
      surprise: false,
    },
    top3Priorities: ['venue', 'catering', 'entertainment'],
  };
}

function createDummyBudget(categoryIds: readonly string[]): BudgetState {
  return {
    categories: categoryIds.map((id) => ({
      id,
      name: id,
      allocated: 50_000,
      spent: 0,
      weight: 1,
    })),
    contingencyRate: 10,
    totalBudget: 1_000_000,
  };
}

describe('Vendor Quotes & Variance Math', () => {
  beforeEach(() => {
    registerVendorGuidesProvider(getVendorGuidesForEventType);
  });

  it('adds and removes quotes immutably', () => {
    const brief = createDummyBrief('wedding');
    const budget = createDummyBudget(WEDDING_CATS);
    const state = buildVendorState(brief, budget);

    const quote1: VendorQuote = {
      id: 'q-1',
      vendorName: 'Grand Plaza',
      category: 'venue',
      amount: 40_000,
      status: 'shortlisted',
      notes: 'Initial proposal',
    };

    const withOne = addQuote(state, quote1);
    expect(withOne.quotes.length).toBe(1);
    const withoutOne = removeQuote(withOne, 'q-1');
    expect(withoutOne.quotes.length).toBe(0);
  });

  it('summarizes committed totals preferring accepted over shortlisted quotes', () => {
    const brief = createDummyBrief('wedding');
    const budget = createDummyBudget(WEDDING_CATS);
    let state = buildVendorState(brief, budget);

    state = addQuote(state, {
      id: 'q-v-short',
      vendorName: 'Venue A',
      category: 'venue',
      amount: 35_000,
      status: 'shortlisted',
      notes: '',
    });

    const summaryShort = summarizeQuotes(state, budget);
    const vSumShort = summaryShort.byCategory['venue'];
    expect(vSumShort?.committed).toBe(35_000);
    expect(vSumShort?.variance).toBe(15_000);

    state = addQuote(state, {
      id: 'q-v-acc',
      vendorName: 'Venue B',
      category: 'venue',
      amount: 45_000,
      status: 'accepted',
      notes: '',
    });

    const summaryAcc = summarizeQuotes(state, budget);
    const vSumAcc = summaryAcc.byCategory['venue'];
    expect(vSumAcc?.committed).toBe(45_000);
    expect(vSumAcc?.variance).toBe(5_000);
  });

  it('correctly flags negative variance as deficit when committed exceeds allocation', () => {
    const brief = createDummyBrief('birthday');
    const budget = createDummyBudget(BIRTHDAY_CATS);
    let state = buildVendorState(brief, budget);

    state = addQuote(state, {
      id: 'q-cake-acc',
      vendorName: 'Custom Pastries',
      category: 'cake',
      amount: 70_000,
      status: 'accepted',
      notes: '',
    });

    const summary = summarizeQuotes(state, budget);
    const cakeSum = summary.byCategory['cake'];
    expect(cakeSum?.variance).toBe(-20_000);
  });
});
