import { beforeEach, describe, expect, it } from 'vitest';
import {
  ALL_VENDOR_GUIDES,
  BIRTHDAY_VENDOR_GUIDES,
  COMMUNITY_VENDOR_GUIDES,
  getVendorGuidesForEventType,
  WEDDING_VENDOR_GUIDES,
} from '../../src/data/vendors';
import type { AdaptationEffects } from '../../src/domain/adaptationTypes';
import type { BudgetState, EventBrief } from '../../src/domain/types';
import {
  buildVendorState,
  registerVendorGuidesProvider,
  toggleChecklistItem,
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

const COMMUNITY_CATS = [
  'venue',
  'equipment',
  'permits_security',
  'marketing',
  'catering',
  'waste_sanitation',
  'activities',
  'insurance',
  'volunteer_supplies',
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

describe('Vendor Data Catalog Integrity', () => {
  beforeEach(() => {
    registerVendorGuidesProvider(getVendorGuidesForEventType);
  });

  it('matches budget categories one-to-one for all three event types', () => {
    expect(WEDDING_VENDOR_GUIDES.map((g) => g.categoryId)).toEqual(WEDDING_CATS);
    expect(BIRTHDAY_VENDOR_GUIDES.map((g) => g.categoryId)).toEqual(BIRTHDAY_CATS);
    expect(COMMUNITY_VENDOR_GUIDES.map((g) => g.categoryId)).toEqual(COMMUNITY_CATS);
    expect(ALL_VENDOR_GUIDES.length).toBe(27);
  });

  it('ensures every guide has at least 5 questions, 3 red flags, and 2 contract checks', () => {
    for (const guide of ALL_VENDOR_GUIDES) {
      expect(guide.questions.length).toBeGreaterThanOrEqual(5);
      expect(guide.redFlags.length).toBeGreaterThanOrEqual(3);
      expect(guide.contractChecks.length).toBeGreaterThanOrEqual(2);
      expect(guide.categoryId.length).toBeGreaterThan(0);
      expect(guide.categoryName.length).toBeGreaterThan(0);
    }
  });
});

describe('Vendor State Engine & Conditional Injections', () => {
  beforeEach(() => {
    registerVendorGuidesProvider(getVendorGuidesForEventType);
  });

  it('injects conditional check questions and red flags keyed by vendorCheckIds', () => {
    const brief = createDummyBrief('wedding');
    const budget = createDummyBudget(WEDDING_CATS);
    const baseline = buildVendorState(brief, budget);
    const vBase = baseline.checklist.find((i) => i.category === 'venue');
    const baseCount = vBase !== undefined ? vBase.questions.length : 0;

    const effects: AdaptationEffects = {
      contingencyDelta: 0,
      weightFactors: {},
      injectTaskIds: [],
      vendorCheckIds: ['outdoor_weather'],
      alerts: [],
      skipOptionalTasks: false,
      compressTimeline: false,
    };

    const adapted = buildVendorState(brief, budget, effects);
    const vAdapted = adapted.checklist.find((i) => i.category === 'venue');
    const adaptedCount = vAdapted !== undefined ? vAdapted.questions.length : 0;

    expect(adaptedCount).toBeGreaterThan(baseCount);
    const hasRain = vAdapted?.questions.some((q) => q.toLowerCase().includes('rain'));
    expect(hasRain).toBe(true);
  });

  it('supports checklist item toggling and immutable updates', () => {
    const brief = createDummyBrief('birthday');
    const budget = createDummyBudget(BIRTHDAY_CATS);
    const state = buildVendorState(brief, budget);
    const targetId = state.checklist[0]?.id ?? '';

    const toggled = toggleChecklistItem(state, targetId);
    expect(toggled.checklist.find((i) => i.id === targetId)?.completed).toBe(true);

    const toggledBack = toggleChecklistItem(toggled, targetId);
    expect(toggledBack.checklist.find((i) => i.id === targetId)?.completed).toBe(false);
  });
});
