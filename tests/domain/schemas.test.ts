import { describe, it, expect } from 'vitest';
import {
  BudgetStateSchema,
  CategoryAllocationSchema,
  ChecklistItemSchema,
  EventBriefSchema,
  EventFlagsSchema,
  EventSettingSchema,
  EventTypeSchema,
  IdeaItemSchema,
  PlanSchema,
  TaskSchema,
  VendorQuoteSchema,
} from '../../src/domain/schemas';

describe('Domain Zod Schemas', () => {
  const sampleFlags = {
    kids: true,
    elders: false,
    dietary: true,
    accessibility: false,
    openBar: false,
    amplifiedMusic: true,
    surprise: false,
  };

  const sampleBrief = {
    title: 'Silver Jubilee Celebration',
    eventType: 'wedding' as const,
    subFormat: 'traditional',
    guestCount: 150,
    totalBudget: 5000000,
    currency: 'INR',
    eventDate: '2026-11-20',
    setting: 'indoor' as const,
    flags: sampleFlags,
    top3Priorities: ['Venue', 'Catering', 'Photography'] as const,
  };

  it('validates event enums and flags schema', () => {
    expect(EventTypeSchema.safeParse('wedding').success).toBe(true);
    expect(EventTypeSchema.safeParse('conference').success).toBe(false);

    expect(EventSettingSchema.safeParse('indoor').success).toBe(true);
    expect(EventSettingSchema.safeParse('underwater').success).toBe(false);

    expect(EventFlagsSchema.safeParse(sampleFlags).success).toBe(true);
  });

  it('validates EventBriefSchema and rejects invalid guest count or date', () => {
    expect(EventBriefSchema.safeParse(sampleBrief).success).toBe(true);

    const zeroGuests = { ...sampleBrief, guestCount: 0 };
    expect(EventBriefSchema.safeParse(zeroGuests).success).toBe(false);

    const invalidDate = { ...sampleBrief, eventDate: '2026-02-29' };
    expect(EventBriefSchema.safeParse(invalidDate).success).toBe(false);
  });

  it('validates CategoryAllocationSchema and BudgetStateSchema', () => {
    const validCat = {
      id: 'cat-1',
      name: 'Catering',
      allocated: 200000,
      spent: 50000,
      weight: 40,
    };
    expect(CategoryAllocationSchema.safeParse(validCat).success).toBe(true);

    const negativeSpent = { ...validCat, spent: -100 };
    expect(CategoryAllocationSchema.safeParse(negativeSpent).success).toBe(false);

    const validBudget = {
      categories: [validCat],
      contingencyRate: 10,
      totalBudget: 200000,
    };
    expect(BudgetStateSchema.safeParse(validBudget).success).toBe(true);
  });

  it('validates TaskSchema, ChecklistItemSchema, and IdeaItemSchema', () => {
    const task = {
      id: 'task-1',
      title: 'Book DJ',
      dueDate: '2026-10-15',
      completed: false,
      category: 'music',
      dependencies: [],
    };
    expect(TaskSchema.safeParse(task).success).toBe(true);

    const checklist = {
      id: 'chk-1',
      title: 'Verify generator backup',
      completed: true,
      category: 'venue',
      redFlags: ['No automatic switch'],
      questions: ['Is fuel included?'],
    };
    expect(ChecklistItemSchema.safeParse(checklist).success).toBe(true);

    const idea = {
      id: 'idea-1',
      title: 'Live Acoustic Duo',
      category: 'activity' as const,
      description: 'Acoustic songs during appetizers',
      votes: 12,
    };
    expect(IdeaItemSchema.safeParse(idea).success).toBe(true);
  });

  it('validates VendorQuoteSchema with allowed status values', () => {
    const quote = {
      id: 'quote-1',
      vendorName: 'Royal Sounds',
      category: 'music',
      amount: 45000,
      status: 'shortlisted' as const,
      notes: 'Includes wireless microphones',
    };
    expect(VendorQuoteSchema.safeParse(quote).success).toBe(true);

    const invalidStatus = { ...quote, status: 'negotiating' };
    expect(VendorQuoteSchema.safeParse(invalidStatus).success).toBe(false);
  });

  it('validates a complete PlanSchema successfully', () => {
    const plan = {
      id: 'plan-jubilee-1',
      brief: sampleBrief,
      budget: {
        categories: [],
        contingencyRate: 10,
        totalBudget: 5000000,
      },
      timeline: [],
      vendorChecklist: [],
      quotes: [],
      ideas: [],
      createdAt: '2026-10-29',
      updatedAt: '2026-10-29',
    };
    expect(PlanSchema.safeParse(plan).success).toBe(true);
  });
});
