import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';
import { VendorsPanel } from '../../../src/features/vendors/VendorsPanel';
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
    categories: [
      { id: 'venue', name: 'Venue & Facilities', allocated: 8000000, spent: 0, weight: 40 },
    ],
  },
  timeline: [],
  vendorChecklist: [
    {
      id: 'chk-1',
      title: 'Review insurance requirements',
      completed: false,
      category: 'venue',
      redFlags: ['No insurance allowed'],
      questions: ['Is public liability included?'],
    },
  ],
  quotes: [
    {
      id: 'q-1',
      vendorName: 'Grand Hyatt',
      category: 'venue',
      amount: 7500000,
      status: 'shortlisted',
      notes: 'Banquet Hall A',
    },
  ],
  ideas: [],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

function createTestStore(initialPlan: Plan | null = MOCK_PLAN): PlanStore {
  return createPlanStore({
    storage: createMemoryStorage(initialPlan),
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => 'id_vendors_test',
  });
}

describe('VendorsPanel component', () => {
  it('renders categories, vendor guides, checklist, and quotes', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <VendorsPanel />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText('Vendors & Contracting')).toBeInTheDocument();
    expect(screen.getAllByText('Venue & Facilities').length).toBeGreaterThan(0);
    expect(screen.getByText('Grand Hyatt')).toBeInTheDocument();
    expect(screen.getByText('Review insurance requirements')).toBeInTheDocument();
  });

  it('toggles checklist items when clicked', () => {
    const store = createTestStore();

    render(
      <PlanStoreContext.Provider value={store}>
        <VendorsPanel />
      </PlanStoreContext.Provider>,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(
      store.getState().history.present?.vendorChecklist.find((c) => c.id === 'chk-1')?.completed,
    ).toBe(true);
  });

  it('removes a quote when Remove button is clicked', () => {
    const store = createTestStore();

    render(
      <PlanStoreContext.Provider value={store}>
        <VendorsPanel />
      </PlanStoreContext.Provider>,
    );

    const removeBtn = screen.getByRole('button', { name: /Remove quote from Grand Hyatt/i });
    fireEvent.click(removeBtn);

    expect(store.getState().history.present?.quotes.length).toBe(0);
  });

  it('opens and submits add quote dialog', () => {
    const store = createTestStore();

    render(
      <PlanStoreContext.Provider value={store}>
        <VendorsPanel />
      </PlanStoreContext.Provider>,
    );

    const addBtn = screen.getByRole('button', { name: /Add Vendor Quote/i });
    fireEvent.click(addBtn);

    const nameInput = screen.getByLabelText(/Vendor \/ Company Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Palace Venue' } });

    const amountInput = screen.getByLabelText(/Quote Amount \(INR\)/i);
    fireEvent.change(amountInput, { target: { value: '50000' } });

    const saveBtn = screen.getByRole('button', { name: /Save Quote/i });
    fireEvent.click(saveBtn);

    expect(
      store.getState().history.present?.quotes.some((q) => q.vendorName === 'New Palace Venue'),
    ).toBe(true);
  });

  it('passes axe accessibility checks without violations', async () => {
    const store = createTestStore();
    const { container } = render(
      <PlanStoreContext.Provider value={store}>
        <VendorsPanel />
      </PlanStoreContext.Provider>,
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
