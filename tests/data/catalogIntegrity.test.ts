import { describe, expect, it } from 'vitest';
import { CATEGORIES, getCategoriesForEventType } from '../../src/data/categories';
import { BUDGET_PRESETS } from '../../src/data/budgetPresets';
import { PER_HEAD_FLOORS } from '../../src/data/perHeadFloors';
import { ALL_TASKS, CONDITIONAL_TASKS, getBaseTasks } from '../../src/data/tasks';
import { ALL_VENDOR_GUIDES, getVendorGuidesForEventType } from '../../src/data/vendors';
import { ALL_IDEAS, getIdeasByEventType } from '../../src/data/ideas';
import { ALL_ADAPTATION_RULES } from '../../src/domain/adaptations/rules';
import type { EventType } from '../../src/domain/types';
import type { TaskTemplate } from '../../src/domain/templates';
import type { IdeaTemplate } from '../../src/domain/ideas/types';

describe('Catalog Integrity and Cross-Reference Validation', () => {
  const EVENT_TYPES: readonly EventType[] = ['wedding', 'birthday', 'community'];

  it('validates category counts and stable IDs per event type', () => {
    expect(getCategoriesForEventType('wedding').length).toBe(10);
    expect(getCategoriesForEventType('birthday').length).toBe(8);
    expect(getCategoriesForEventType('community').length).toBe(9);
    expect(
      getCategoriesForEventType('wedding').length +
        getCategoriesForEventType('birthday').length +
        getCategoriesForEventType('community').length,
    ).toBe(27);
    expect(CATEGORIES.length).toBe(19);

    const ids = new Set(CATEGORIES.map((c) => c.id));
    expect(ids.size).toBe(19);
  });

  it('validates budget preset weights sum to 100 for all event types', () => {
    for (const type of EVENT_TYPES) {
      const weights = BUDGET_PRESETS[type];
      const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
      expect(sum).toBe(100);

      const categoryIds = getCategoriesForEventType(type).map((c) => c.id);
      for (const catId of Object.keys(weights)) {
        expect(categoryIds).toContain(catId);
      }
    }
  });

  it('validates per-head floor heuristics across currencies and event types', () => {
    const currencies = ['INR', 'USD', 'EUR', 'GBP'] as const;
    for (const cur of currencies) {
      for (const type of EVENT_TYPES) {
        const floor = PER_HEAD_FLOORS[cur]?.[type];
        expect(floor).toBeDefined();
        expect(Number(floor)).toBeGreaterThan(0);
      }
    }
  });

  it('validates task template counts and dependency integrity', () => {
    expect(getBaseTasks('wedding').length).toBe(18);
    expect(getBaseTasks('birthday').length).toBe(14);
    expect(getBaseTasks('community').length).toBe(15);
    expect(CONDITIONAL_TASKS.length).toBe(14);
    expect(ALL_TASKS.length).toBe(61);

    const allTaskIds = new Set(ALL_TASKS.map((t: TaskTemplate) => t.id));
    expect(allTaskIds.size).toBe(ALL_TASKS.length);

    for (const task of ALL_TASKS) {
      for (const depId of task.dependencies) {
        expect(allTaskIds.has(depId)).toBe(true);
      }
    }
  });

  it('validates 1-to-1 matching between vendor guides and budget categories', () => {
    expect(ALL_VENDOR_GUIDES.length).toBe(27);

    for (const type of EVENT_TYPES) {
      const catIds = getCategoriesForEventType(type).map((c) => c.id);
      const guides = getVendorGuidesForEventType(type);
      expect(guides.length).toBe(catIds.length);

      const guideCatIds = guides.map((g) => g.categoryId);
      expect(guideCatIds.sort()).toEqual(catIds.sort());

      for (const guide of guides) {
        expect(guide.questions.length).toBeGreaterThanOrEqual(5);
        expect(guide.redFlags.length).toBeGreaterThanOrEqual(3);
        expect(guide.contractChecks.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('validates idea catalog sizes, unique IDs, and valid categories', () => {
    for (const type of EVENT_TYPES) {
      const ideas = getIdeasByEventType(type);
      const themes = ideas.filter((i: IdeaTemplate) => i.category === 'theme');
      const menu = ideas.filter((i: IdeaTemplate) => i.category === 'menu');
      const activities = ideas.filter((i: IdeaTemplate) => i.category === 'activity');

      expect(themes.length).toBeGreaterThanOrEqual(12);
      expect(menu.length).toBeGreaterThanOrEqual(12);
      expect(activities.length).toBeGreaterThanOrEqual(12);
    }

    expect(ALL_IDEAS.length).toBe(108);
    expect(ALL_ADAPTATION_RULES.length).toBe(17);

    const idSet = new Set(ALL_IDEAS.map((i: IdeaTemplate) => i.id));
    expect(idSet.size).toBe(ALL_IDEAS.length);

    for (const idea of ALL_IDEAS) {
      expect(idea.tags.length).toBeGreaterThan(0);
      expect(idea.title.trim().length).toBeGreaterThan(0);
      expect(idea.description.trim().length).toBeGreaterThan(0);
    }
  });
});
