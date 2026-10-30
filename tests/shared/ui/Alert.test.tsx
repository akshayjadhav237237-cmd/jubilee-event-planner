import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { Alert } from '../../../src/shared/ui/Alert';

describe('Alert component', () => {
  it('renders message and title with alert role for critical severity', () => {
    render(
      <Alert
        severity="critical"
        title="Payment Failed"
        message="Please check your payment method and retry."
      />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText('Please check your payment method and retry.')).toBeInTheDocument();
    expect(alert).toHaveClass('bg-rose-50');
  });

  it('renders with role alert for warn severity', () => {
    render(<Alert severity="warn" message="Budget limit approaching." />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-amber-50');
  });

  it('renders with role status for info severity', () => {
    render(
      <Alert severity="info" title="Update" message="Quotes refreshed with new vendor prices." />,
    );

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('bg-sky-50');
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <Alert
        severity="info"
        title="System Notice"
        message="All changes are autosaved continuously."
      />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
