import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';
import { TimelinePanel } from '../../../src/features/timeline/TimelinePanel';
import { PlanStoreContext } from '../../../src/state/hooks';
import { createPlanStore } from '../../../src/state/store';
import { createMemoryStorage } from '../../../src/state/memoryStorage';
import type { Plan } from '../../../src/domain/types';
import type { IsoDate } from '../../../src/domain/dates';
import type { PlanStore } from '../../../src/state/types';

const MOCK_PLAN: Plan = {
  id: 'test-plan',
  brief: {
    title: 'Ananya Wedding',
    eventType: 'wedding',
    subFormat: 'traditional',
    guestCount: 200,
    totalBudget: 20000000,
    currency: 'INR',
    eventDate: '2027-11-20' as IsoDate,
    setting: 'indoor',
    flags: {
      kids: true,
      elders: true,
      dietary: true,
      accessibility: true,
      openBar: true,
      amplifiedMusic: true,
      surprise: false,
    },
    top3Priorities: ['Venue & Facilities', 'Catering & Beverages', 'Photography & Videography'],
  },
  budget: {
    totalBudget: 20000000,
    contingencyRate: 10,
    categories: [],
  },
  timeline: [
    {
      id: 'wed-01',
      title: 'Establish wedding vision and budget allocation',
      category: 'venue',
      dueDate: '2027-01-01' as IsoDate,
      completed: false,
      dependencies: [],
    },
    {
      id: 'wed-02',
      title: 'Draft initial guest list and estimate headcount',
      category: 'venue',
      dueDate: '2027-01-15' as IsoDate,
      completed: true,
      dependencies: ['wed-01'],
    },
  ],
  vendorChecklist: [],
  quotes: [],
  ideas: [],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

function createTestStore(initialPlan: Plan | null = MOCK_PLAN): PlanStore {
  return createPlanStore({
    storage: createMemoryStorage(initialPlan),
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => 'id_timeline_test',
  });
}

describe('TimelinePanel component', () => {
  it('renders timeline tasks grouped by phase', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <TimelinePanel today={'2026-10-30' as IsoDate} />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText('Celebration Countdown & Timeline')).toBeInTheDocument();
    expect(screen.getByText('Establish wedding vision and budget allocation')).toBeInTheDocument();
  });

  it('toggles task completion when checkbox is clicked', () => {
    const store = createTestStore();

    render(
      <PlanStoreContext.Provider value={store}>
        <TimelinePanel today={'2026-10-30' as IsoDate} />
      </PlanStoreContext.Provider>,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheck = checkboxes[0];
    if (!firstCheck) throw new Error('Missing checkbox');
    fireEvent.click(firstCheck);

    expect(
      store.getState().history.present?.timeline.find((t) => t.id === 'wed-01')?.completed,
    ).toBe(true);
  });

  it('renders compression alert for short notice plans', () => {
    const shortNoticePlan: Plan = {
      ...MOCK_PLAN,
      brief: { ...MOCK_PLAN.brief, eventDate: '2026-11-05' as IsoDate },
    };
    const store = createTestStore(shortNoticePlan);

    render(
      <PlanStoreContext.Provider value={store}>
        <TimelinePanel today={'2026-10-30' as IsoDate} />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText('Schedule Compression Active')).toBeInTheDocument();
  });

  it('passes axe accessibility checks without violations', async () => {
    const store = createTestStore();
    const { container } = render(
      <PlanStoreContext.Provider value={store}>
        <TimelinePanel today={'2026-10-30' as IsoDate} />
      </PlanStoreContext.Provider>,
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
