import { describe, expect, it } from 'vitest';
import type { EventBrief, Plan } from '../../src/domain/types';
import type { IsoDate } from '../../src/domain/dates';
import type { StoragePort } from '../../src/domain/ports';
import { ok } from '../../src/domain/result';
import { createMemoryStorage, createPlanStore } from '../../src/state';

const mockClock = (): Date => new Date(Date.UTC(2026, 9, 29, 12, 0, 0));

function createCounterId(prefix = 'plan'): () => string {
  let count = 0;
  return () => {
    count += 1;
    return `${prefix}_${String(count)}`;
  };
}

const testBrief: EventBrief = {
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

describe('PlanStore actions and persistence', () => {
  it('initializes with null when storage is empty', () => {
    const storage = createMemoryStorage(null);
    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });
    expect(store.getPlan()).toBeNull();
  });

  it('creates plan, pushes to history, and persists to storage', () => {
    let savedPlan: Plan | undefined = undefined;
    const storage: StoragePort = {
      load: () => ok(null),
      save: (plan) => {
        savedPlan = plan;
        return ok(undefined);
      },
    };

    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });
    const result = store.createPlan(testBrief);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.brief.title).toBe(testBrief.title);
      expect(store.getPlan()?.id).toBe(result.value.id);
      expect((savedPlan as Plan | undefined)?.id).toBe(result.value.id);
    }
  });

  it('dispatches single command and persists updated plan', () => {
    const storage = createMemoryStorage(null);
    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });
    store.createPlan(testBrief);

    const res = store.dispatch({ type: 'SET_CONTINGENCY', rate: 10 });
    expect(res.ok).toBe(true);
    expect(store.getPlan()?.budget.contingencyRate).toBe(10);

    const storageLoaded = storage.load();
    expect(storageLoaded.ok).toBe(true);
    if (storageLoaded.ok) {
      expect(storageLoaded.value?.budget.contingencyRate).toBe(10);
    }
  });

  it('rejects dispatch when no plan is active', () => {
    const storage = createMemoryStorage(null);
    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });

    const res = store.dispatch({ type: 'SET_CONTINGENCY', rate: 10 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('NO_ACTIVE_PLAN');
    }
  });

  it('dispatches multiple commands atomically', () => {
    const storage = createMemoryStorage(null);
    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });
    store.createPlan(testBrief);

    const plan = store.getPlan();
    const firstCat = plan?.budget.categories[0]?.id ?? 'venue';

    const res = store.dispatchMany([
      { type: 'SET_CONTINGENCY', rate: 12 },
      { type: 'LOG_SPEND', categoryId: firstCat, amount: 2500 },
    ]);

    expect(res.ok).toBe(true);
    expect(store.getPlan()?.budget.contingencyRate).toBe(12);
  });

  it('supports undo and redo with persistence updates', () => {
    const storage = createMemoryStorage(null);
    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });
    store.createPlan(testBrief);

    const initialContingency = store.getPlan()?.budget.contingencyRate;
    store.dispatch({ type: 'SET_CONTINGENCY', rate: 14 });
    expect(store.getPlan()?.budget.contingencyRate).toBe(14);

    const undoSuccess = store.undo();
    expect(undoSuccess).toBe(true);
    expect(store.getPlan()?.budget.contingencyRate).toBe(initialContingency);

    const redoSuccess = store.redo();
    expect(redoSuccess).toBe(true);
    expect(store.getPlan()?.budget.contingencyRate).toBe(14);
  });

  it('resets active plan to null', () => {
    const storage = createMemoryStorage(null);
    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });
    store.createPlan(testBrief);
    expect(store.getPlan()).not.toBeNull();

    store.reset();
    expect(store.getPlan()).toBeNull();
  });

  it('notifies subscribers on state updates', () => {
    const storage = createMemoryStorage(null);
    const store = createPlanStore({ storage, clock: mockClock, ids: createCounterId() });
    let notifications = 0;

    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    store.createPlan(testBrief);
    store.dispatch({ type: 'SET_CONTINGENCY', rate: 8 });
    expect(notifications).toBe(2);
    unsubscribe();
  });
});
