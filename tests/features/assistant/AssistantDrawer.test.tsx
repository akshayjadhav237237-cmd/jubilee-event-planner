import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import axe from 'axe-core';
import { AssistantDrawer } from '../../../src/features/assistant/AssistantDrawer';
import { PlanStoreContext } from '../../../src/state/hooks';
import { createPlanStore } from '../../../src/state/store';
import { createMemoryStorage } from '../../../src/state/memoryStorage';
import type { Plan } from '../../../src/domain/types';
import type { IsoDate } from '../../../src/domain/dates';
import type { AssistantProvider } from '../../../src/ai/ports';
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
  ideas: [],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

function createTestStore(initialPlan: Plan | null = MOCK_PLAN): PlanStore {
  return createPlanStore({
    storage: createMemoryStorage(initialPlan),
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => 'id_assistant_test',
  });
}

describe('AssistantDrawer component', () => {
  it('renders prompt input, quick chips, and mode badge', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <AssistantDrawer open={true} onClose={vi.fn()} />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText('Celebration AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Offline Mode')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Transfer 5000 from venue to catering/i }),
    ).toBeInTheDocument();
  });

  it('populates prompt input when quick chip is clicked', () => {
    const store = createTestStore();
    render(
      <PlanStoreContext.Provider value={store}>
        <AssistantDrawer open={true} onClose={vi.fn()} />
      </PlanStoreContext.Provider>,
    );

    const chip = screen.getByRole('button', { name: /Set contingency to 12%/i });
    fireEvent.click(chip);

    const input = screen.getByPlaceholderText(
      /Shift 10% from decor to catering/i,
    ) as HTMLInputElement;
    expect(input.value).toBe('Set contingency to 12%');
  });

  it('interprets command prompt offline and previews diff', async () => {
    const store = createTestStore();

    const mockAssistant: AssistantProvider = {
      mode: 'offline',
      interpret: async () => ({
        ok: true,
        value: {
          kind: 'commands',
          commands: [{ type: 'SET_CONTINGENCY', rate: 12 }],
          summary: 'Update contingency reserve rate to 12%.',
        },
      }),
    };

    render(
      <PlanStoreContext.Provider value={store}>
        <AssistantDrawer open={true} onClose={vi.fn()} assistant={mockAssistant} />
      </PlanStoreContext.Provider>,
    );

    const input = screen.getByPlaceholderText(/Shift 10% from decor to catering/i);
    fireEvent.change(input, { target: { value: 'set contingency to 12%' } });

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Proposed Modifications/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Update contingency reserve rate to 12%/i).length).toBeGreaterThan(
        0,
      );
    });

    const applyBtn = screen.getByRole('button', { name: /Apply All Changes/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(store.getState().history.present?.budget.contingencyRate).toBe(12);
    });
  });

  it('passes axe accessibility checks without violations', async () => {
    const store = createTestStore();
    const { container } = render(
      <PlanStoreContext.Provider value={store}>
        <AssistantDrawer open={true} onClose={vi.fn()} />
      </PlanStoreContext.Provider>,
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
