import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { Stat } from '../../../src/shared/ui/Stat';

describe('Stat component', () => {
  it('renders metric label and primary value', () => {
    render(<Stat label="Total Budget" value="₹5,00,000" />);

    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('₹5,00,000')).toBeInTheDocument();
  });

  it('renders optional caption and trend information', () => {
    render(
      <Stat
        label="Vendors Confirmed"
        value="8 / 10"
        caption="2 pending final contract"
        trend="80% secured"
      />,
    );

    expect(screen.getByText('Vendors Confirmed')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
    expect(screen.getByText('2 pending final contract')).toBeInTheDocument();
    expect(screen.getByText('80% secured')).toBeInTheDocument();
  });

  it('combines custom className with default styles', () => {
    const { container } = render(<Stat label="Guests" value={150} className="custom-stat-class" />);

    expect(container.firstChild).toHaveClass('custom-stat-class');
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <Stat label="Milestones" value="12" caption="On schedule" trend="+2 this week" />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
