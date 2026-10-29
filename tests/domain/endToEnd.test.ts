import { describe, expect, it } from 'vitest';
import { generateBriefs } from '../helpers/briefs';
import { buildPlan } from '../../src/state/buildPlan';
import { createPlanStore } from '../../src/state/store';
import { createMemoryStorage } from '../../src/state/memoryStorage';
import { hasDependencyCycle } from '../../src/domain/timeline/sort';
import { getVendorGuide } from '../../src/data/vendors';
import type { PlanCommand } from '../../src/domain/commands';
import type { Plan, VendorQuote } from '../../src/domain/types';

function createOperationalCommands(plan: Plan): readonly PlanCommand[] {
  const firstCat = plan.budget.categories[0]?.id ?? 'venue';
  const secondCat = plan.budget.categories[1]?.id ?? 'catering';
  const firstTaskId = plan.timeline[0]?.id ?? 'task_1';
  const nextRate = plan.budget.contingencyRate === 10 ? 12 : 10;

  return [
    { type: 'SET_BRIEF', brief: { ...plan.brief, title: 'Updated Title' } },
    { type: 'SET_CATEGORY_WEIGHT', categoryId: firstCat, weight: 35 },
    { type: 'TRANSFER_BUDGET', fromCategoryId: firstCat, toCategoryId: secondCat, amount: 1000 },
    { type: 'SET_CONTINGENCY', rate: nextRate },
    { type: 'LOG_SPEND', categoryId: firstCat, amount: 500 },
    { type: 'TOGGLE_TASK', taskId: firstTaskId },
  ];
}

function createContentCommands(plan: Plan, quote: VendorQuote): readonly PlanCommand[] {
  const firstCheckId = plan.vendorChecklist[0]?.id ?? 'check_1';
  const firstIdeaId = plan.ideas[0]?.id ?? 'idea_0';

  return [
    { type: 'ADD_QUOTE', quote },
    { type: 'TOGGLE_CHECKLIST_ITEM', itemId: firstCheckId },
    {
      type: 'SAVE_IDEA',
      idea: {
        id: 'idea_custom_1',
        title: 'Custom Test Theme',
        category: 'theme',
        description: 'A test idea',
        votes: 1,
      },
    },
    { type: 'REMOVE_IDEA', ideaId: firstIdeaId },
  ];
}

function assertDispatchAndUndo(
  store: ReturnType<typeof createPlanStore>,
  initialPlan: Plan,
  cmd: PlanCommand,
): void {
  expect(store.dispatch(cmd).ok).toBe(true);
  expect(store.getPlan()).not.toEqual(initialPlan);
  expect(store.undo()).toBe(true);
  expect(store.getPlan()).toEqual(initialPlan);
}

describe('End-to-End Invariants across 100 Generated Briefs', () => {
  const briefs = generateBriefs(100, 99999);
  let idCounter = 1;
  const deps = {
    clock: () => new Date('2026-10-30T00:00:00.000Z'),
    ids: () => `plan_${String(idCounter++)}`,
  };

  it('verifies plan construction, budget sum invariants, acyclic tasks, and non-empty ideas', () => {
    for (const brief of briefs) {
      const plan = buildPlan(brief, deps);
      expect(plan.id.length).toBeGreaterThan(0);
      expect(plan.brief.title).toBe(brief.title);

      const categoryAllocatedSum = plan.budget.categories.reduce((acc, c) => acc + c.allocated, 0);
      const contingencyAmount = Math.floor(
        (plan.brief.totalBudget * plan.budget.contingencyRate) / 100,
      );
      expect(categoryAllocatedSum + contingencyAmount).toBe(plan.brief.totalBudget);
      expect(hasDependencyCycle(plan.timeline)).toBe(false);

      for (const cat of plan.budget.categories) {
        expect(getVendorGuide(brief.eventType, cat.id)).toBeDefined();
      }

      expect(plan.ideas.length).toBeGreaterThan(0);
      expect(plan.vendorChecklist.length).toBeGreaterThan(0);
    }
  });

  function setupTestStore(): { store: ReturnType<typeof createPlanStore>; initialPlan: Plan } {
    const brief = briefs[0] ?? generateBriefs(1)[0];
    if (!brief) throw new Error('Brief generation failed');
    const storage = createMemoryStorage();
    const store = createPlanStore({ storage, clock: deps.clock, ids: deps.ids });
    store.createPlan(brief);
    const initialPlan = store.getPlan();
    if (!initialPlan) throw new Error('Plan initialization failed');
    return { store, initialPlan };
  }

  it('verifies applying and undoing operational commands (brief, budget, timeline)', () => {
    const { store, initialPlan } = setupTestStore();
    const commands = createOperationalCommands(initialPlan);

    for (const cmd of commands) {
      assertDispatchAndUndo(store, initialPlan, cmd);
    }
  });

  it('verifies applying and undoing content commands (quotes, checklist, ideas)', () => {
    const { store, initialPlan } = setupTestStore();
    const firstCat = initialPlan.budget.categories[0]?.id ?? 'venue';

    const testQuote: VendorQuote = {
      id: 'q_test_1',
      vendorName: 'Acme Test Vendor',
      category: firstCat,
      amount: 25000,
      status: 'draft',
      notes: 'Test quote',
    };

    const commands = createContentCommands(initialPlan, testQuote);
    for (const cmd of commands) {
      assertDispatchAndUndo(store, initialPlan, cmd);
    }

    expect(store.dispatch({ type: 'ADD_QUOTE', quote: testQuote }).ok).toBe(true);
    expect(store.getPlan()?.quotes.length).toBe(1);
    expect(store.dispatch({ type: 'REMOVE_QUOTE', quoteId: 'q_test_1' }).ok).toBe(true);
    expect(store.getPlan()?.quotes.length).toBe(0);
    expect(store.undo()).toBe(true);
    expect(store.getPlan()?.quotes.length).toBe(1);
  });
});
