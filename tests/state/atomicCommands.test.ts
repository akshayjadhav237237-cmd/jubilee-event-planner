import { describe, expect, it } from 'vitest';
import type { EventBrief, Plan } from '../../src/domain/types';
import type { IsoDate } from '../../src/domain/dates';
import type { PlanCommand } from '../../src/domain/commands';
import { applyCommands } from '../../src/state/reducer';

const sampleBrief: EventBrief = {
  title: 'Community Fair',
  eventType: 'community',
  subFormat: 'cultural_festival',
  guestCount: 200,
  totalBudget: 5000000,
  currency: 'USD',
  eventDate: '2027-09-15' as IsoDate,
  setting: 'outdoor',
  flags: {
    kids: true,
    elders: true,
    dietary: false,
    accessibility: true,
    openBar: false,
    amplifiedMusic: true,
    surprise: false,
  },
  top3Priorities: ['Stalls', 'Permits', 'Music'],
};

const basePlan: Plan = {
  id: 'plan_atomic_1',
  brief: sampleBrief,
  budget: {
    categories: [
      { id: 'venue', name: 'Venue', allocated: 2500000, spent: 0, weight: 50 },
      { id: 'permits', name: 'Permits', allocated: 2500000, spent: 0, weight: 50 },
    ],
    contingencyRate: 5,
    totalBudget: 5000000,
  },
  timeline: [
    {
      id: 'task_permit_1',
      title: 'Obtain Noise Permit',
      dueDate: '2027-05-01' as IsoDate,
      completed: false,
      category: 'permits',
      dependencies: [],
    },
  ],
  vendorChecklist: [],
  quotes: [],
  ideas: [],
  createdAt: '2026-10-29' as IsoDate,
  updatedAt: '2026-10-29' as IsoDate,
};

describe('Atomic command batch execution and rollback', () => {
  it('applies all commands sequentially when every command succeeds', () => {
    const commands: readonly PlanCommand[] = [
      { type: 'SET_CONTINGENCY', rate: 10 },
      { type: 'LOG_SPEND', categoryId: 'venue', amount: 30000 },
      { type: 'TOGGLE_TASK', taskId: 'task_permit_1' },
    ];

    const result = applyCommands(basePlan, commands);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.budget.contingencyRate).toBe(10);
      const venue = result.value.budget.categories.find((c) => c.id === 'venue');
      expect(venue?.spent).toBe(30000);
      expect(result.value.timeline[0]?.completed).toBe(true);
    }
  });

  it('fails atomically and preserves original state when second command fails', () => {
    const initialContingency = basePlan.budget.contingencyRate;
    const commands: readonly PlanCommand[] = [
      { type: 'SET_CONTINGENCY', rate: 12 },
      {
        type: 'RESCHEDULE_TASK',
        taskId: 'non_existent_task_id',
        dueDate: '2027-06-01' as IsoDate,
      },
      { type: 'LOG_SPEND', categoryId: 'venue', amount: 99999 },
    ];

    const result = applyCommands(basePlan, commands);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('RESCHEDULE_TASK_FAILED');
    }

    // Original plan remains completely unchanged
    expect(basePlan.budget.contingencyRate).toBe(initialContingency);
    const venue = basePlan.budget.categories.find((c) => c.id === 'venue');
    expect(venue?.spent).toBe(0);
  });

  it('handles empty command list returning plan as ok', () => {
    const result = applyCommands(basePlan, []);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(basePlan);
    }
  });
});
