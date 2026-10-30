import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';
import { Launchpad } from '../../../src/features/intake/Launchpad';
import { PlanStoreContext } from '../../../src/state/hooks';
import { createPlanStore } from '../../../src/state/store';
import { createMemoryStorage } from '../../../src/state/memoryStorage';
import type { IsoDate } from '../../../src/domain/dates';
import type { PlanStore } from '../../../src/state/types';

function createTestStore(): PlanStore {
  return createPlanStore({
    storage: createMemoryStorage(),
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => 'id_intake_test',
  });
}

describe('Launchpad component', () => {
  it('renders demo scenarios and triggers plan creation when selected', () => {
    const store = createTestStore();

    render(
      <PlanStoreContext.Provider value={store}>
        <Launchpad today={'2026-10-30' as IsoDate} />
      </PlanStoreContext.Provider>,
    );

    expect(screen.getByText("Ananya & Rohan's Wedding")).toBeInTheDocument();
    expect(screen.getByText("Aarav's 10th Birthday")).toBeInTheDocument();

    const loadButtons = screen.getAllByRole('button', { name: /Load demo plan/i });
    const firstBtn = loadButtons[0];
    if (!firstBtn) throw new Error('Missing button');
    fireEvent.click(firstBtn);

    expect(store.getState().history.present).not.toBeNull();
  });

  it('submits custom brief form to create a new plan', () => {
    const store = createTestStore();

    render(
      <PlanStoreContext.Provider value={store}>
        <Launchpad today={'2026-10-30' as IsoDate} />
      </PlanStoreContext.Provider>,
    );

    const titleInput = screen.getByLabelText(/Celebration Title/i);
    fireEvent.change(titleInput, { target: { value: 'My Special Festival' } });

    const submitBtn = screen.getByRole('button', { name: /Generate Celebration Plan/i });
    fireEvent.click(submitBtn);

    expect(store.getState().history.present).not.toBeNull();
  });

  it('passes axe accessibility checks without violations', async () => {
    const store = createTestStore();
    const { container } = render(
      <PlanStoreContext.Provider value={store}>
        <Launchpad today={'2026-10-30' as IsoDate} />
      </PlanStoreContext.Provider>,
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
