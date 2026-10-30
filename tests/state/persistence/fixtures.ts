import type { IsoDate } from '../../../src/domain/dates';
import type { Plan } from '../../../src/domain/types';

export function createMockStorage(initialData: Record<string, string> = {}): Storage {
  const store = new Map<string, string>(Object.entries(initialData));
  return {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      store.set(key, value);
    },
    removeItem: (key: string): void => {
      store.delete(key);
    },
    clear: (): void => {
      store.clear();
    },
    key: (index: number): string | null => Array.from(store.keys())[index] ?? null,
    get length(): number {
      return store.size;
    },
  };
}

export const SAMPLE_VALID_PLAN: Plan = {
  id: 'plan_test_123',
  brief: {
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
  },
  budget: {
    categories: [
      { id: 'cat-1', name: 'Catering', allocated: 100000000, spent: 50000000, weight: 0.4 },
      { id: 'cat-2', name: 'Venue', allocated: 150000000, spent: 0, weight: 0.6 },
    ],
    contingencyRate: 10,
    totalBudget: 250000000,
  },
  timeline: [
    {
      id: 'task-1',
      title: 'Book Caterer',
      dueDate: '2027-02-01' as IsoDate,
      completed: false,
      category: 'Catering',
      dependencies: [],
    },
  ],
  vendorChecklist: [
    {
      id: 'chk-1',
      title: 'Tasting session scheduled',
      completed: true,
      category: 'Catering',
      redFlags: ['No vegetarian options'],
      questions: ['Is tasting included?'],
    },
  ],
  quotes: [
    {
      id: 'quote-1',
      vendorName: 'Royal Feast Caterers',
      category: 'Catering',
      amount: 95000000,
      status: 'shortlisted',
      notes: 'Includes service staff',
    },
  ],
  ideas: [
    {
      id: 'idea-1',
      title: 'Live Chaat Counter',
      category: 'menu',
      description: 'Street food station during evening reception',
      votes: 12,
    },
  ],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

export const SAMPLE_V1_FIXTURE: Record<string, unknown> = {
  version: 1,
  plan: {
    id: 'legacy-plan-999',
    brief: {
      title: 'Legacy Silver Anniversary',
      eventType: 'wedding',
      guestCount: 80,
      totalBudget: 5000000,
      currency: 'INR',
      eventDate: '2027-05-10',
      setting: 'outdoor',
    },
    budget: {
      totalBudget: 5000000,
      categories: [{ id: 'cat_food', name: 'Food & Beverage', allocated: 3000000 }],
    },
    timeline: [
      {
        id: 'legacy_task_1',
        title: 'Send Invitations',
        dueDate: '2027-03-01',
        completed: false,
      },
    ],
  },
};
