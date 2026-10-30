import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { type TabItem, Tabs } from '../../../src/shared/ui/Tabs';

const sampleTabs: readonly TabItem[] = [
  { id: 'overview', label: 'Overview', count: 3 },
  { id: 'budget', label: 'Budget', badge: 'New' },
  { id: 'vendors', label: 'Vendors' },
];

describe('Tabs component', () => {
  it('renders tab items with labels, count, and badge', () => {
    render(<Tabs tabs={sampleTabs} selectedId="overview" onSelect={() => {}} />);

    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /budget/i })).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('manages roving tabindex and aria-selected state', () => {
    render(<Tabs tabs={sampleTabs} selectedId="budget" onSelect={() => {}} />);

    const budgetTab = screen.getByRole('tab', { name: /budget/i });
    const overviewTab = screen.getByRole('tab', { name: /overview/i });

    expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    expect(budgetTab).toHaveAttribute('tabIndex', '0');
    expect(overviewTab).toHaveAttribute('aria-selected', 'false');
    expect(overviewTab).toHaveAttribute('tabIndex', '-1');
  });

  it('calls onSelect on click', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<Tabs tabs={sampleTabs} selectedId="overview" onSelect={handleSelect} />);

    await user.click(screen.getByRole('tab', { name: /vendors/i }));
    expect(handleSelect).toHaveBeenCalledWith('vendors');
  });

  it('navigates through tabs via keyboard arrow keys, home, and end', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<Tabs tabs={sampleTabs} selectedId="overview" onSelect={handleSelect} />);

    const firstTab = screen.getByRole('tab', { name: /overview/i });
    firstTab.focus();

    await user.keyboard('{ArrowRight}');
    expect(handleSelect).toHaveBeenCalledWith('budget');

    await user.keyboard('{End}');
    expect(handleSelect).toHaveBeenCalledWith('vendors');

    await user.keyboard('{Home}');
    expect(handleSelect).toHaveBeenCalledWith('overview');

    await user.keyboard('{ArrowLeft}');
    expect(handleSelect).toHaveBeenCalledWith('vendors');
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <Tabs
        tabs={sampleTabs}
        selectedId="overview"
        onSelect={() => {}}
        ariaLabel="Main sections"
      />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
