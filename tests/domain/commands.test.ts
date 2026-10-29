import { describe, it, expect } from 'vitest';
import {
  assertNever,
  CommandListSchema,
  PlanCommandSchema,
  type PlanCommand,
} from '../../src/domain/commands';

describe('Domain Commands and CommandListSchema', () => {
  const validBrief = {
    title: 'Silver Jubilee',
    eventType: 'wedding' as const,
    subFormat: 'traditional',
    guestCount: 200,
    totalBudget: 4000000,
    currency: 'INR',
    eventDate: '2026-12-10',
    setting: 'indoor' as const,
    flags: {
      kids: true,
      elders: true,
      dietary: true,
      accessibility: true,
      openBar: false,
      amplifiedMusic: true,
      surprise: false,
    },
    top3Priorities: ['Venue', 'Food', 'Decor'] as const,
  };

  it('validates individual plan commands across types', () => {
    const setBrief: PlanCommand = {
      type: 'SET_BRIEF',
      brief: validBrief,
    };
    expect(PlanCommandSchema.safeParse(setBrief).success).toBe(true);

    const setWeight: PlanCommand = {
      type: 'SET_CATEGORY_WEIGHT',
      categoryId: 'cat-1',
      weight: 25,
    };
    expect(PlanCommandSchema.safeParse(setWeight).success).toBe(true);

    const transfer: PlanCommand = {
      type: 'TRANSFER_BUDGET',
      fromCategoryId: 'cat-1',
      toCategoryId: 'cat-2',
      amount: 15000,
    };
    expect(PlanCommandSchema.safeParse(transfer).success).toBe(true);

    const setContingency: PlanCommand = {
      type: 'SET_CONTINGENCY',
      rate: 15,
    };
    expect(PlanCommandSchema.safeParse(setContingency).success).toBe(true);

    const logSpend: PlanCommand = {
      type: 'LOG_SPEND',
      categoryId: 'cat-1',
      amount: 5000,
    };
    expect(PlanCommandSchema.safeParse(logSpend).success).toBe(true);

    const toggleTask: PlanCommand = {
      type: 'TOGGLE_TASK',
      taskId: 'task-1',
    };
    expect(PlanCommandSchema.safeParse(toggleTask).success).toBe(true);

    const reschedule: PlanCommand = {
      type: 'RESCHEDULE_TASK',
      taskId: 'task-1',
      dueDate: '2026-11-15',
    };
    expect(PlanCommandSchema.safeParse(reschedule).success).toBe(true);

    const addQuote: PlanCommand = {
      type: 'ADD_QUOTE',
      quote: {
        id: 'quote-1',
        vendorName: 'Decor Inc',
        category: 'decor',
        amount: 80000,
        status: 'draft',
        notes: 'Initial estimate',
      },
    };
    expect(PlanCommandSchema.safeParse(addQuote).success).toBe(true);

    const removeQuote: PlanCommand = {
      type: 'REMOVE_QUOTE',
      quoteId: 'quote-1',
    };
    expect(PlanCommandSchema.safeParse(removeQuote).success).toBe(true);

    const toggleChecklist: PlanCommand = {
      type: 'TOGGLE_CHECKLIST_ITEM',
      itemId: 'chk-1',
    };
    expect(PlanCommandSchema.safeParse(toggleChecklist).success).toBe(true);

    const saveIdea: PlanCommand = {
      type: 'SAVE_IDEA',
      idea: {
        id: 'idea-1',
        title: 'Fairy lights canopy',
        category: 'theme',
        description: 'Warm lighting across patio',
        votes: 8,
      },
    };
    expect(PlanCommandSchema.safeParse(saveIdea).success).toBe(true);

    const removeIdea: PlanCommand = {
      type: 'REMOVE_IDEA',
      ideaId: 'idea-1',
    };
    expect(PlanCommandSchema.safeParse(removeIdea).success).toBe(true);
  });

  it('rejects commands with unknown types or missing payloads', () => {
    const invalid = { type: 'DESTROY_ALL' };
    expect(PlanCommandSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates CommandListSchema bounds: <= 12 accepted, 13 rejected', () => {
    const baseCommand: PlanCommand = {
      type: 'TOGGLE_TASK',
      taskId: 'task-x',
    };

    const emptyList: readonly PlanCommand[] = [];
    expect(CommandListSchema.safeParse(emptyList).success).toBe(true);

    const twelveCommands: PlanCommand[] = [];
    for (let i = 0; i < 12; i += 1) {
      twelveCommands.push({ ...baseCommand, taskId: `task-${String(i)}` });
    }
    expect(CommandListSchema.safeParse(twelveCommands).success).toBe(true);

    const thirteenCommands = [...twelveCommands, { ...baseCommand, taskId: 'task-13' }];
    expect(CommandListSchema.safeParse(thirteenCommands).success).toBe(false);
  });

  it('assertNever throws with provided message or default', () => {
    const unreachableVal = 'unhandled' as never;
    expect(() => assertNever(unreachableVal)).toThrow('Unhandled command type: unhandled');
    expect(() => assertNever(unreachableVal, 'Custom error')).toThrow('Custom error: unhandled');
  });
});
