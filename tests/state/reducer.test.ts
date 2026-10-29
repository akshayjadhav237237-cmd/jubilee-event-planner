import { describe, expect, it } from 'vitest';
import type { EventBrief, Plan } from '../../src/domain/types';
import type { IsoDate } from '../../src/domain/dates';
import { applyCommand } from '../../src/state/reducer';

const sampleBrief: EventBrief = {
  title: 'Ananya & Rohan Wedding',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 100,
  totalBudget: 10000000,
  currency: 'INR',
  eventDate: '2027-06-20' as IsoDate,
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
  top3Priorities: ['Venue', 'Catering', 'Photography'],
};

const basePlan: Plan = {
  id: 'plan_test_1',
  brief: sampleBrief,
  budget: {
    categories: [
      { id: 'venue', name: 'Venue', allocated: 5000000, spent: 0, weight: 50 },
      { id: 'catering', name: 'Catering', allocated: 5000000, spent: 0, weight: 50 },
    ],
    contingencyRate: 5,
    totalBudget: 10000000,
  },
  timeline: [
    {
      id: 'task_1',
      title: 'Book Venue',
      dueDate: '2027-01-01' as IsoDate,
      completed: false,
      category: 'venue',
      dependencies: [],
    },
  ],
  vendorChecklist: [
    {
      id: 'chk_1',
      title: 'Venue Contract Review',
      completed: false,
      category: 'venue',
      questions: ['Deposit policy?'],
      redFlags: ['No fire exit'],
    },
  ],
  quotes: [],
  ideas: [],
  createdAt: '2026-10-29' as IsoDate,
  updatedAt: '2026-10-29' as IsoDate,
};

describe('Reducer applyCommand - all 12 domain commands', () => {
  it('applies SET_BRIEF and updates brief and timestamp', () => {
    const updated = { ...sampleBrief, title: 'Updated Gala' };
    const res = applyCommand(basePlan, { type: 'SET_BRIEF', brief: updated });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.brief.title).toBe('Updated Gala');
      expect(res.value.updatedAt.length).toBe(10);
    }
  });

  it('applies SET_CATEGORY_WEIGHT and TRANSFER_BUDGET', () => {
    const wRes = applyCommand(basePlan, {
      type: 'SET_CATEGORY_WEIGHT',
      categoryId: 'venue',
      weight: 90,
    });
    expect(wRes.ok).toBe(true);

    const tRes = applyCommand(basePlan, {
      type: 'TRANSFER_BUDGET',
      fromCategoryId: 'venue',
      toCategoryId: 'catering',
      amount: 500000,
    });
    expect(tRes.ok).toBe(true);
    if (tRes.ok) {
      const v = tRes.value.budget.categories.find((c) => c.id === 'venue');
      const c = tRes.value.budget.categories.find((cat) => cat.id === 'catering');
      expect(v?.allocated).toBe(4500000);
      expect(c?.allocated).toBe(5500000);
    }
  });

  it('applies SET_CONTINGENCY and LOG_SPEND', () => {
    const cRes = applyCommand(basePlan, { type: 'SET_CONTINGENCY', rate: 10 });
    expect(cRes.ok).toBe(true);
    if (cRes.ok) expect(cRes.value.budget.contingencyRate).toBe(10);

    const sRes = applyCommand(basePlan, {
      type: 'LOG_SPEND',
      categoryId: 'venue',
      amount: 75000,
    });
    expect(sRes.ok).toBe(true);
    if (sRes.ok) {
      const v = sRes.value.budget.categories.find((cat) => cat.id === 'venue');
      expect(v?.spent).toBe(75000);
    }
  });

  it('applies TOGGLE_TASK and RESCHEDULE_TASK', () => {
    const tRes = applyCommand(basePlan, { type: 'TOGGLE_TASK', taskId: 'task_1' });
    expect(tRes.ok).toBe(true);
    if (tRes.ok) expect(tRes.value.timeline[0]?.completed).toBe(true);

    const rRes = applyCommand(basePlan, {
      type: 'RESCHEDULE_TASK',
      taskId: 'task_1',
      dueDate: '2027-03-01' as IsoDate,
    });
    expect(rRes.ok).toBe(true);
    if (rRes.ok) expect(rRes.value.timeline[0]?.dueDate).toBe('2027-03-01');

    const bad = applyCommand(basePlan, {
      type: 'RESCHEDULE_TASK',
      taskId: 'missing',
      dueDate: '2027-03-01' as IsoDate,
    });
    expect(bad.ok).toBe(false);
  });

  it('applies ADD_QUOTE and REMOVE_QUOTE', () => {
    const quote = {
      id: 'q_1',
      vendorName: 'Royal Palace',
      category: 'venue',
      amount: 4500000,
      status: 'shortlisted' as const,
      notes: 'Included decor',
    };
    const addRes = applyCommand(basePlan, { type: 'ADD_QUOTE', quote });
    expect(addRes.ok).toBe(true);
    if (addRes.ok) {
      expect(addRes.value.quotes.length).toBe(1);
      const rmRes = applyCommand(addRes.value, { type: 'REMOVE_QUOTE', quoteId: 'q_1' });
      expect(rmRes.ok).toBe(true);
      if (rmRes.ok) expect(rmRes.value.quotes.length).toBe(0);
    }
  });

  it('applies TOGGLE_CHECKLIST_ITEM', () => {
    const res = applyCommand(basePlan, { type: 'TOGGLE_CHECKLIST_ITEM', itemId: 'chk_1' });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.vendorChecklist[0]?.completed).toBe(true);
  });

  it('applies SAVE_IDEA and REMOVE_IDEA', () => {
    const idea = {
      id: 'i_1',
      title: 'Botanical Canopy',
      category: 'theme' as const,
      description: 'Greenery vibe',
      votes: 1,
    };
    const saveRes = applyCommand(basePlan, { type: 'SAVE_IDEA', idea });
    expect(saveRes.ok).toBe(true);
    if (saveRes.ok) {
      expect(saveRes.value.ideas.length).toBe(1);
      const rmRes = applyCommand(saveRes.value, { type: 'REMOVE_IDEA', ideaId: 'i_1' });
      expect(rmRes.ok).toBe(true);
      if (rmRes.ok) expect(rmRes.value.ideas.length).toBe(0);
    }
  });
});
