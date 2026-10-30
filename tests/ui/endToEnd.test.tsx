import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';
import { DEMO_SCENARIOS } from '../../src/data/demoScenarios';

function assertNoInvalidText(container: HTMLElement): void {
  const text = container.textContent ?? '';
  expect(text).not.toContain('NaN');
  expect(text).not.toContain('undefined');
  expect(text).not.toContain('[object Object]');
  expect(text).not.toContain('Infinity');
}

describe('End-to-end UI user flows', () => {
  it('loads celebration plan from each of the three demo scenarios without invalid rendering', async () => {
    for (const scenario of DEMO_SCENARIOS) {
      const { container, unmount } = render(<App />);

      const loadButtons = screen.getAllByRole('button', { name: new RegExp(scenario.name, 'i') });
      const firstBtn = loadButtons[0];
      if (!firstBtn) throw new Error('Missing scenario button');
      fireEvent.click(firstBtn);

      await waitFor(() => {
        expect(screen.getByText(scenario.name)).toBeInTheDocument();
      });

      assertNoInvalidText(container);
      unmount();
    }
  });

  it('navigates through all four tabs and verifies content integrity', async () => {
    const { container } = render(<App />);

    const loadButtons = screen.getAllByRole('button', { name: /Ananya & Rohan's Wedding/i });
    const firstBtn = loadButtons[0];
    if (!firstBtn) throw new Error('Missing button');
    fireEvent.click(firstBtn);

    await waitFor(
      () => {
        expect(screen.getByText("Ananya & Rohan's Wedding")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const timelineTab = screen.getByRole('tab', { name: 'Timeline' });
    fireEvent.click(timelineTab);
    await waitFor(
      () => {
        expect(screen.getByText(/Celebration Countdown/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    assertNoInvalidText(container);

    const vendorsTab = screen.getByRole('tab', { name: 'Vendors' });
    fireEvent.click(vendorsTab);
    await waitFor(
      () => {
        expect(screen.getByText(/Vendors & Contracting/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    assertNoInvalidText(container);

    const ideasTab = screen.getByRole('tab', { name: 'Ideas' });
    fireEvent.click(ideasTab);
    await waitFor(
      () => {
        expect(screen.getByText(/Inspiration & Ideas/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    assertNoInvalidText(container);

    const budgetTab = screen.getByRole('tab', { name: 'Budget' });
    fireEvent.click(budgetTab);
    await waitFor(
      () => {
        expect(screen.getByText(/Celebration Budget/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    assertNoInvalidText(container);
  });

  it('executes an assistant command in offline mode (type, preview, apply, and undo)', async () => {
    const { container } = render(<App />);

    const loadButtons = screen.getAllByRole('button', { name: /Ananya & Rohan's Wedding/i });
    const firstBtn = loadButtons[0];
    if (!firstBtn) throw new Error('Missing button');
    fireEvent.click(firstBtn);

    await waitFor(
      () => {
        expect(screen.getByText("Ananya & Rohan's Wedding")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const assistantToggle = screen.getByRole('button', { name: /assistant/i });
    fireEvent.click(assistantToggle);

    await waitFor(
      () => {
        expect(screen.getByText('Celebration AI Assistant')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const input = screen.getByPlaceholderText(/Shift 10% from decor to catering/i);
    fireEvent.change(input, { target: { value: 'set contingency to 12%' } });

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(screen.getByText(/Proposed Modifications/i)).toBeInTheDocument();
        expect(
          screen.getAllByText(/Update contingency reserve rate to 12%/i).length,
        ).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    const applyBtn = screen.getByRole('button', { name: /Apply All Changes/i });
    fireEvent.click(applyBtn);

    await waitFor(
      () => {
        expect(screen.getByText(/Contingency Reserve: 12%/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const undoBtn = screen.getByRole('button', { name: /Undo/i });
    fireEvent.click(undoBtn);

    await waitFor(
      () => {
        expect(screen.getByText(/Contingency Reserve: 9%/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    assertNoInvalidText(container);
  });
});
