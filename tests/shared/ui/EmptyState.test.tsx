import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../../../src/shared/ui/EmptyState';

describe('EmptyState component', () => {
  it('renders title and description copy', () => {
    render(
      <EmptyState
        title="No vendor quotes yet"
        description="Invite vendors to submit quotes to see price comparisons."
      />,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'No vendor quotes yet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Invite vendors to submit quotes to see price comparisons.'),
    ).toBeInTheDocument();
  });

  it('renders action button and triggers onAction handler on click', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Empty Checklist"
        description="Create your first task to get started."
        actionLabel="Add Task"
        onAction={handleAction}
      />,
    );

    const button = screen.getByRole('button', { name: 'Add Task' });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('omits action button when action props are absent', () => {
    render(<EmptyState title="Nothing to show" description="Check back later." />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <EmptyState
        title="No Saved Searches"
        description="Save your preferred venue filters for quick access."
        actionLabel="Explore Venues"
        onAction={() => {}}
      />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
