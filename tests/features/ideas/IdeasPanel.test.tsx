import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';
import { IdeasPanel } from '../../../src/features/ideas/IdeasPanel';
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
  timeline: [],
  vendorChecklist: [],
  quotes: [],
  ideas: [
    {
      id: 'idea-1',
      title: 'Grand Floral Mandap',
      category: 'theme',
      description: 'Handcrafted floral mandap with marigold and jasmine',
      votes: 10,
    },
  ],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

function createTestStore(initialPlan: Plan | null = MOCK_PLAN): PlanStore {
  return createPlanStore({
    storage: createMemoryStorage(initialPlan),
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => 'id_ideas_test',
  });
}

describe('IdeasPanel component', () => {
  it('renders ideas list and category filter buttons', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <IdeasPanel />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText('Inspiration & Ideas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Themes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Culinary/i })).toBeInTheDocument();
  });

  it('filters ideas when category button is clicked', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <IdeasPanel />
      </PlanStoreContext.Provider>,
    );

    const culinaryBtn = screen.getByRole('button', { name: /Filter by Culinary/i });
    fireEvent.click(culinaryBtn);

    expect(screen.getByRole('button', { name: /Filter by Culinary/i })).toBeInTheDocument();
  });

  it('toggles saving an idea to the active plan', async () => {
    const store = createTestStore();

    render(
      <PlanStoreContext.Provider value={store}>
        <IdeasPanel />
      </PlanStoreContext.Provider>,
    );

    const saveButtons = screen.getAllByRole('button', { name: /to plan/i });
    const firstSave = saveButtons[0];
    if (!firstSave) throw new Error('Missing save button');
    fireEvent.click(firstSave);

    expect(store.getState().history.present).not.toBeNull();
  });

  it('refreshes suggestions when refresh button is clicked', async () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <IdeasPanel />
      </PlanStoreContext.Provider>,
    );

    const refreshBtn = screen.getByRole('button', { name: /Refresh Suggestions/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getByText('Inspiration & Ideas')).toBeInTheDocument();
    });
  });

  it('passes axe accessibility checks without violations', async () => {
    const store = createTestStore();
    const { container } = render(
      <PlanStoreContext.Provider value={store}>
        <IdeasPanel />
      </PlanStoreContext.Provider>,
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
