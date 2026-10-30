import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { App, AppContent } from '../../src/app/App';
import { AppProviders } from '../../src/app/AppProviders';
import { createPlanStore } from '../../src/state/store';
import { createMemoryStorage } from '../../src/state/memoryStorage';
import { makeBrief } from '../helpers/briefs';

function createActivePlanStore() {
  const store = createPlanStore({
    storage: createMemoryStorage(),
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => `id_${Math.random().toString(36).slice(2, 6)}`,
  });
  store.createPlan(makeBrief());
  return store;
}

describe('App Shell', () => {
  it('renders standard landmarks, title, mode badge, and launchpad when no plan is active', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabIndex', '-1');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    const titleHeading = screen.getByRole('heading', { level: 1, name: 'Jubilee Event Planner' });
    expect(titleHeading).toBeInTheDocument();

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Offline mode');

    expect(screen.getByText('Choose a Demo or Create Your Own Plan')).toBeInTheDocument();
  });

  it('renders disabled undo and redo buttons with accessible labels initially', () => {
    render(<App />);

    const undoButton = screen.getByRole('button', { name: 'Undo last action' });
    const redoButton = screen.getByRole('button', { name: 'Redo last action' });

    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it('toggles the assistant drawer when the assistant button is clicked', () => {
    render(<App />);

    const assistantButton = screen.getByRole('button', { name: 'Open planning assistant' });
    expect(screen.queryByRole('dialog', { name: 'Celebration AI Assistant' })).toBeNull();

    fireEvent.click(assistantButton);
    expect(screen.getByRole('dialog', { name: 'Celebration AI Assistant' })).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    fireEvent.click(closeButton);
    expect(screen.queryByRole('dialog', { name: 'Celebration AI Assistant' })).toBeNull();
  });

  it('renders workspace with vitals and tab panels when a plan is active', async () => {
    const store = createActivePlanStore();
    render(
      <AppProviders store={store}>
        <AppContent />
      </AppProviders>,
    );

    expect(screen.getByRole('region', { name: 'Event vitals' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Planning sections' })).toBeInTheDocument();

    const budgetTab = screen.getByRole('tab', { name: 'Budget' });
    const timelineTab = screen.getByRole('tab', { name: 'Timeline' });
    const vendorsTab = screen.getByRole('tab', { name: 'Vendors' });
    const ideasTab = screen.getByRole('tab', { name: 'Ideas' });

    expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    expect(timelineTab).toHaveAttribute('aria-selected', 'false');

    await waitFor(
      () => {
        expect(screen.getByText('Celebration Budget')).toBeInTheDocument();
      },
      { timeout: 8000 },
    );

    fireEvent.click(timelineTab);
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');
    await waitFor(
      () => {
        expect(screen.getByText('Celebration Countdown & Timeline')).toBeInTheDocument();
      },
      { timeout: 8000 },
    );

    fireEvent.click(vendorsTab);
    await waitFor(
      () => {
        expect(screen.getByText('Vendors & Contracting')).toBeInTheDocument();
      },
      { timeout: 8000 },
    );

    fireEvent.click(ideasTab);
    await waitFor(
      () => {
        expect(screen.getByText('Inspiration & Ideas')).toBeInTheDocument();
      },
      { timeout: 8000 },
    );
  }, 25000);

  it('supports roving tabindex keyboard navigation across tabs', () => {
    const store = createActivePlanStore();
    render(
      <AppProviders store={store}>
        <AppContent />
      </AppProviders>,
    );

    const tablist = screen.getByRole('tablist', { name: 'Planning sections' });
    expect(tablist).toBeInTheDocument();
    const budgetTab = screen.getByRole('tab', { name: 'Budget' });
    const timelineTab = screen.getByRole('tab', { name: 'Timeline' });

    expect(budgetTab).toHaveAttribute('tabIndex', '0');
    expect(timelineTab).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(budgetTab, { key: 'ArrowRight' });
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');
    expect(timelineTab).toHaveAttribute('tabIndex', '0');
    expect(budgetTab).toHaveAttribute('tabIndex', '-1');
  });

  it('has zero axe-core accessibility violations on active workspace', async () => {
    const store = createActivePlanStore();
    const { container } = render(
      <AppProviders store={store}>
        <AppContent />
      </AppProviders>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
