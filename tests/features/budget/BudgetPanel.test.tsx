import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';
import { BudgetPanel } from '../../../src/features/budget/BudgetPanel';
import { PlanStoreContext } from '../../../src/state/hooks';
import { createPlanStore } from '../../../src/state/store';
import { createMemoryStorage } from '../../../src/state/memoryStorage';
import type { Plan } from '../../../src/domain/types';
import type { IsoDate } from '../../../src/domain/dates';
import type { PlanStore } from '../../../src/state/types';

const MOCK_PLAN: Plan = {
  id: 'test-plan',
  brief: {
    title: 'Ananya & Rohan Wedding',
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
    categories: [
      { id: 'venue', name: 'Venue & Facilities', allocated: 8000000, spent: 2000000, weight: 40 },
      {
        id: 'catering',
        name: 'Catering & Beverages',
        allocated: 10000000,
        spent: 5000000,
        weight: 50,
      },
      { id: 'decor', name: 'Decor & Floral', allocated: 2000000, spent: 0, weight: 10 },
    ],
  },
  timeline: [],
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
    ids: () => 'id_budget_test',
  });
}

describe('BudgetPanel component', () => {
  it('renders budget stats and categories correctly', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <BudgetPanel />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText('Celebration Budget')).toBeInTheDocument();
    expect(screen.getAllByText('Venue & Facilities').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Catering & Beverages').length).toBeGreaterThan(0);
  });

  it('allows updating contingency rate through the slider', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <BudgetPanel />
      </PlanStoreContext.Provider>,
    );

    const slider = screen.getByRole('slider', { name: /Contingency Reserve/i });
    fireEvent.change(slider, { target: { value: '12' } });

    expect(store.getState().history.present?.budget.contingencyRate).toBe(12);
  });

  it('opens and submits transfer modal', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <BudgetPanel />
      </PlanStoreContext.Provider>,
    );

    const transferBtn = screen.getByRole('button', { name: /^Transfer$/i });
    fireEvent.click(transferBtn);

    const amountInput = screen.getByLabelText(/^Amount \(INR\)/i);
    fireEvent.change(amountInput, { target: { value: '1000' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirm Transfer/i });
    fireEvent.click(confirmBtn);

    expect(
      store.getState().history.present?.budget.categories.find((c) => c.id === 'catering')
        ?.allocated,
    ).toBe(10100000);
  });

  it('renders empty state when no active plan is present', () => {
    const store = createTestStore(null);
    render(
      <PlanStoreContext.Provider value={store}>
        <BudgetPanel />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText('No Active Plan')).toBeInTheDocument();
  });

  it('passes axe accessibility checks without violations', async () => {
    const store = createTestStore();
    const { container } = render(
      <PlanStoreContext.Provider value={store}>
        <BudgetPanel />
      </PlanStoreContext.Provider>,
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
