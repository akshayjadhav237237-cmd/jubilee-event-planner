import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from '../../../src/shared/ui/ProgressBar';

describe('ProgressBar component', () => {
  it('renders progressbar with correct ARIA attributes and labels', () => {
    render(<ProgressBar value={40} label="Tasks Completed" />);

    const bar = screen.getByRole('progressbar', { name: 'Tasks Completed' });
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '40%');
  });

  it('clamps values below 0 and above 100', () => {
    const { rerender } = render(<ProgressBar value={-15} label="Low Clamp" />);
    let bar = screen.getByRole('progressbar', { name: 'Low Clamp' });
    expect(bar).toHaveAttribute('aria-valuenow', '0');

    rerender(<ProgressBar value={125} label="High Clamp" />);
    bar = screen.getByRole('progressbar', { name: 'High Clamp' });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('supports custom valueText and variants', () => {
    render(
      <ProgressBar
        value={85}
        label="Budget Spent"
        valueText="₹85,000 of ₹1,00,000"
        variant="warn"
      />,
    );

    const bar = screen.getByRole('progressbar', { name: 'Budget Spent' });
    expect(bar).toHaveAttribute('aria-valuetext', '₹85,000 of ₹1,00,000');
    expect(screen.getByText('₹85,000 of ₹1,00,000')).toBeInTheDocument();
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <ProgressBar value={72} label="Preparation progress" valueText="72% done" />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
