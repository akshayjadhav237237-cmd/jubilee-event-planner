import { describe, it, expect } from 'vitest';
import type { EventBrief } from '../../src/domain/types';
import type { IsoDate } from '../../src/domain/dates';
import {
  ALL_IDEAS,
  WEDDING_THEMES,
  WEDDING_MENU,
  WEDDING_ACTIVITIES,
  BIRTHDAY_THEMES,
  BIRTHDAY_MENU,
  BIRTHDAY_ACTIVITIES,
  COMMUNITY_THEMES,
  COMMUNITY_MENU,
  COMMUNITY_ACTIVITIES,
} from '../../src/data/ideas';
import { scoreIdea, selectIdeas, type IdeaTemplate } from '../../src/domain/ideas';

function createBrief(overrides: Partial<EventBrief> = {}): EventBrief {
  return {
    title: 'Test Celebration',
    eventType: 'wedding',
    subFormat: 'traditional',
    guestCount: 100,
    totalBudget: 2_000_000,
    currency: 'USD',
    eventDate: '2026-10-30' as IsoDate,
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
    top3Priorities: ['Photography', 'Food', 'Decor'],
    ...overrides,
  };
}

describe('Ideas Catalog Integrity', () => {
  it('contains at least 12 themes, 12 menus, and 12 activities per event format', () => {
    expect(WEDDING_THEMES.length).toBeGreaterThanOrEqual(12);
    expect(WEDDING_MENU.length).toBeGreaterThanOrEqual(12);
    expect(WEDDING_ACTIVITIES.length).toBeGreaterThanOrEqual(12);
    expect(BIRTHDAY_THEMES.length).toBeGreaterThanOrEqual(12);
    expect(BIRTHDAY_MENU.length).toBeGreaterThanOrEqual(12);
    expect(BIRTHDAY_ACTIVITIES.length).toBeGreaterThanOrEqual(12);
    expect(COMMUNITY_THEMES.length).toBeGreaterThanOrEqual(12);
    expect(COMMUNITY_MENU.length).toBeGreaterThanOrEqual(12);
    expect(COMMUNITY_ACTIVITIES.length).toBeGreaterThanOrEqual(12);
    expect(ALL_IDEAS.length).toBeGreaterThanOrEqual(108);
  });

  it('guarantees unique IDs across the entire catalog', () => {
    const ids = ALL_IDEAS.map((idea) => idea.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ALL_IDEAS.length);
  });

  it('guarantees unique titles per category', () => {
    const categories = ['theme', 'menu', 'activity'] as const;
    for (const category of categories) {
      const items = ALL_IDEAS.filter((i) => i.category === category);
      const titles = items.map((i) => i.title);
      expect(new Set(titles).size).toBe(items.length);
    }
  });

  it('contains no brand names and no price claims in descriptions', () => {
    const brands = [
      'disney',
      'marvel',
      'coke',
      'pepsi',
      'starbucks',
      'mcdonald',
      'lego',
      'nike',
      'iphone',
      'spotify',
    ];
    const pricePattern =
      /\$|\bpaise\b|\bcents\b|\bdollars\b|€|£|¥|₹|\bfree\b|\bcheap\b|\bexpensive\b/i;

    for (const idea of ALL_IDEAS) {
      const lower = `${idea.title} ${idea.description}`.toLowerCase();
      for (const brand of brands) {
        expect(lower).not.toContain(brand);
      }
      expect(idea.description).not.toMatch(pricePattern);
    }
  });
});

describe('Idea Scoring Logic', () => {
  it('awards +3 points for setting match and hybrid capability', () => {
    const brief = createBrief({ setting: 'indoor' });
    const indoorTemplate: IdeaTemplate = {
      id: 'test-1',
      eventType: 'wedding',
      category: 'theme',
      title: 'Indoor Theme',
      description: 'Desc',
      tags: ['indoor'],
    };
    const hybridTemplate: IdeaTemplate = { ...indoorTemplate, id: 'test-2', tags: ['hybrid'] };
    const outdoorTemplate: IdeaTemplate = { ...indoorTemplate, id: 'test-3', tags: ['outdoor'] };

    expect(scoreIdea(indoorTemplate, brief)).toBeGreaterThanOrEqual(3);
    expect(scoreIdea(hybridTemplate, brief)).toBeGreaterThanOrEqual(3);
    expect(scoreIdea(outdoorTemplate, brief)).toBe(0);
  });

  it('awards +2 points per matching active flag and budget tier', () => {
    const brief = createBrief({
      flags: {
        kids: true,
        elders: true,
        dietary: true,
        accessibility: false,
        openBar: false,
        amplifiedMusic: false,
        surprise: false,
      },
      guestCount: 50,
      totalBudget: 1_000_000, // per guest 20,000 -> budget_premium
    });
    const template: IdeaTemplate = {
      id: 'test-flags',
      eventType: 'wedding',
      category: 'menu',
      title: 'Flagged Menu',
      description: 'Desc',
      tags: ['kids', 'elders', 'budget_premium'],
    };

    // kids (+2) + elders (+2) + budget_premium (+2) = 6
    expect(scoreIdea(template, brief)).toBe(6);
  });

  it('awards +1 point per matching top priority keyword', () => {
    const brief = createBrief({ top3Priorities: ['Photography', 'Music', 'Culinary'] });
    const template: IdeaTemplate = {
      id: 'test-prio',
      eventType: 'wedding',
      category: 'activity',
      title: 'Photo Booth',
      description: 'Desc',
      tags: ['photography', 'music'],
    };

    expect(scoreIdea(template, brief)).toBe(2);
  });
});

describe('Idea Selection Engine', () => {
  it('balances recommendations across themes, menus, and activities', () => {
    const brief = createBrief({ eventType: 'wedding' });
    const selected = selectIdeas(brief, { limit: 6 });

    expect(selected).toHaveLength(6);
    const themes = selected.filter((i) => i.category === 'theme');
    const menus = selected.filter((i) => i.category === 'menu');
    const activities = selected.filter((i) => i.category === 'activity');

    expect(themes).toHaveLength(2);
    expect(menus).toHaveLength(2);
    expect(activities).toHaveLength(2);
    expect(selected.every((i) => i.votes === 0)).toBe(true);
  });

  it('filters ideas by search query across titles and tags', () => {
    const brief = createBrief({ eventType: 'birthday' });
    const selected = selectIdeas(brief, { search: 'taco' });

    expect(selected.length).toBeGreaterThan(0);
    expect(selected.some((i) => i.title.toLowerCase().includes('taco'))).toBe(true);
  });

  it('guarantees deterministic selection and ordering across identical runs', () => {
    const brief = createBrief({ eventType: 'community' });
    const runA = selectIdeas(brief, { limit: 9 });
    const runB = selectIdeas(brief, { limit: 9 });

    expect(runA.map((i) => i.id)).toEqual(runB.map((i) => i.id));
    expect(runA.map((i) => i.title)).toEqual(runB.map((i) => i.title));
  });
});
