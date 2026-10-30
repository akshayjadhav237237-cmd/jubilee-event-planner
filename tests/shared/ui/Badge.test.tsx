import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { Badge } from '../../../src/shared/ui/Badge';

describe('Badge component', () => {
  it('renders visible badge text', () => {
    render(<Badge text="Pending Review" />);
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Badge text="Paid" variant="success" />);
    expect(screen.getByText('Paid')).toHaveClass('bg-emerald-100');

    rerender(<Badge text="Overdue" variant="critical" />);
    expect(screen.getByText('Overdue')).toHaveClass('bg-rose-100');

    rerender(<Badge text="Tentative" variant="warning" />);
    expect(screen.getByText('Tentative')).toHaveClass('bg-amber-100');

    rerender(<Badge text="Draft" variant="info" />);
    expect(screen.getByText('Draft')).toHaveClass('bg-sky-100');
  });

  it('combines custom className', () => {
    render(<Badge text="Custom" className="extra-class" />);
    expect(screen.getByText('Custom')).toHaveClass('extra-class');
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(<Badge text="Booked" variant="success" />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
