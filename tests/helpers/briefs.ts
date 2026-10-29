import type { EventBrief, EventFlags, EventSetting, EventType } from '../../src/domain/types';
import type { IsoDate } from '../../src/domain/dates';

export const DEFAULT_WEDDING_BRIEF: EventBrief = {
  title: 'Ananya & Rohan Wedding',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 150,
  totalBudget: 250000000,
  currency: 'INR',
  eventDate: '2027-04-15' as IsoDate,
  setting: 'hybrid',
  flags: {
    kids: true,
    elders: true,
    dietary: true,
    accessibility: true,
    openBar: true,
    amplifiedMusic: true,
    surprise: false,
  },
  top3Priorities: ['Catering & Banquet', 'Venue Aesthetics', 'Guest Experience'],
};

export const DEFAULT_BIRTHDAY_BRIEF: EventBrief = {
  title: 'Liam 10th Birthday Adventure',
  eventType: 'birthday',
  subFormat: 'kids_party',
  guestCount: 30,
  totalBudget: 150000,
  currency: 'USD',
  eventDate: '2026-12-10' as IsoDate,
  setting: 'indoor',
  flags: {
    kids: true,
    elders: false,
    dietary: true,
    accessibility: false,
    openBar: false,
    amplifiedMusic: false,
    surprise: true,
  },
  top3Priorities: ['Interactive Entertainment', 'Cake & Sweet Treats', 'Goody Bags'],
};

export const DEFAULT_COMMUNITY_BRIEF: EventBrief = {
  title: 'Riverside Community Cultural Gala',
  eventType: 'community',
  subFormat: 'cultural_festival',
  guestCount: 400,
  totalBudget: 1200000,
  currency: 'GBP',
  eventDate: '2027-07-20' as IsoDate,
  setting: 'outdoor',
  flags: {
    kids: true,
    elders: true,
    dietary: true,
    accessibility: true,
    openBar: false,
    amplifiedMusic: true,
    surprise: false,
  },
  top3Priorities: ['Stage & Acoustics', 'Community Stalls', 'Safety & Sanitation'],
};

/** Creates an EventBrief combining defaults with specified overrides. */
export function makeBrief(overrides: Partial<EventBrief> = {}): EventBrief {
  const base =
    overrides.eventType === 'birthday'
      ? DEFAULT_BIRTHDAY_BRIEF
      : overrides.eventType === 'community'
        ? DEFAULT_COMMUNITY_BRIEF
        : DEFAULT_WEDDING_BRIEF;

  return {
    ...base,
    ...overrides,
    flags: {
      ...base.flags,
      ...(overrides.flags ?? {}),
    },
    top3Priorities: overrides.top3Priorities ?? base.top3Priorities,
  };
}

const EVENT_TYPES: readonly EventType[] = ['wedding', 'birthday', 'community'];
const SETTINGS: readonly EventSetting[] = ['indoor', 'outdoor', 'hybrid'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const;
const DATES = [
  '2024-02-15', // Past date
  '2026-11-05', // Near date (under 30 days)
  '2027-06-20', // Standard / far date
  '2027-12-31', // Far date
] as const;

function deriveRandomFlags(eventType: EventType, nextRand: () => number): EventFlags {
  return {
    kids: nextRand() > 0.4,
    elders: nextRand() > 0.4,
    dietary: nextRand() > 0.3,
    accessibility: nextRand() > 0.5,
    openBar: eventType !== 'birthday' && nextRand() > 0.5,
    amplifiedMusic: nextRand() > 0.4,
    surprise: eventType === 'birthday' && nextRand() > 0.6,
  };
}

function resolveSubFormat(eventType: EventType): string {
  if (eventType === 'wedding') return 'traditional';
  if (eventType === 'birthday') return 'milestone';
  return 'fundraiser';
}

function generateSingleBrief(index: number, nextRand: () => number): EventBrief {
  const eventType = EVENT_TYPES[Math.floor(nextRand() * EVENT_TYPES.length)] ?? 'wedding';
  const setting = SETTINGS[Math.floor(nextRand() * SETTINGS.length)] ?? 'indoor';
  const currency = CURRENCIES[Math.floor(nextRand() * CURRENCIES.length)] ?? 'INR';
  const dateStr = DATES[Math.floor(nextRand() * DATES.length)] ?? '2027-06-20';

  const guestCount = Math.floor(nextRand() * 480) + 20;
  const baseBudget = guestCount * (currency === 'INR' ? 150000 : 8000);
  const budgetMultiplier = 0.5 + nextRand() * 2.5;
  const totalBudget = Math.floor(baseBudget * budgetMultiplier);

  return {
    title: `${eventType} Event #${String(index + 1)}`,
    eventType,
    subFormat: resolveSubFormat(eventType),
    guestCount,
    totalBudget,
    currency,
    eventDate: dateStr as IsoDate,
    setting,
    flags: deriveRandomFlags(eventType, nextRand),
    top3Priorities: ['Priority A', 'Priority B', 'Priority C'],
  };
}

/** Generates deterministic briefs across sizes, budgets, currencies, flags, and dates. */
export function generateBriefs(count: number, seed = 42): readonly EventBrief[] {
  let s = seed;
  const nextRand = (): number => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  const briefs: EventBrief[] = [];
  for (let i = 0; i < count; i += 1) {
    briefs.push(generateSingleBrief(i, nextRand));
  }

  return briefs;
}
