import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import type { IsoDate } from '../../../src/domain/dates';
import type { Plan } from '../../../src/domain/types';
import { PrintBrief } from '../../../src/features/print/PrintBrief';

const FULL_MOCK_PLAN: Plan = {
  id: 'test-print-plan',
  brief: {
    title: 'Ananya & Rohan Royal Wedding',
    eventType: 'wedding',
    subFormat: 'traditional',
    guestCount: 200,
    totalBudget: 250000000,
    currency: 'INR',
    eventDate: '2027-11-20' as IsoDate,
    setting: 'outdoor',
    flags: {
      kids: true,
      elders: true,
      dietary: true,
      accessibility: true,
      openBar: true,
      amplifiedMusic: true,
      surprise: false,
    },
    top3Priorities: ['Catering & Beverages', 'Venue & Facilities', 'Photography'],
  },
  budget: {
    totalBudget: 250000000,
    contingencyRate: 10,
    categories: [
      {
        id: 'venue',
        name: 'Venue & Facilities',
        allocated: 100000000,
        spent: 25000000,
        weight: 40,
      },
      {
        id: 'catering',
        name: 'Catering & Beverages',
        allocated: 100000000,
        spent: 50000000,
        weight: 40,
      },
      { id: 'decor', name: 'Decor & Floral', allocated: 50000000, spent: 0, weight: 20 },
    ],
  },
  timeline: [
    {
      id: 'task-1',
      title: 'Book Grand Palace Banquet Hall',
      dueDate: '2027-02-01' as IsoDate,
      completed: true,
      category: 'Venue & Facilities',
      dependencies: [],
    },
    {
      id: 'task-2',
      title: 'Finalize Tasting Menu',
      dueDate: '2027-05-15' as IsoDate,
      completed: false,
      category: 'Catering & Beverages',
      dependencies: ['task-1'],
    },
  ],
  vendorChecklist: [
    {
      id: 'chk-1',
      title: 'Check banquet hall sound curfew permits',
      completed: true,
      category: 'Venue & Facilities',
      redFlags: ['Sound limit at 10 PM'],
      questions: ['Is amplified sound allowed outdoors?'],
    },
    {
      id: 'chk-2',
      title: 'Verify culinary license and hygiene ratings',
      completed: false,
      category: 'Catering & Beverages',
      redFlags: [],
      questions: [],
    },
  ],
  quotes: [
    {
      id: 'quote-1',
      vendorName: 'Royal Palace Grounds',
      category: 'Venue & Facilities',
      amount: 95000000,
      status: 'accepted',
      notes: 'Includes bridal suite and generator backup',
    },
  ],
  ideas: [
    {
      id: 'idea-1',
      title: 'Sunset Lantern Welcome Pathway',
      category: 'theme',
      description: 'Luminaries along the garden path at dusk for guest arrival.',
      votes: 4,
    },
  ],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

describe('PrintBrief component', () => {
  it('renders celebration brief overview header and adaptation reasons', () => {
    render(<PrintBrief plan={FULL_MOCK_PLAN} today={'2026-10-30' as IsoDate} />);

    expect(screen.getByText('Ananya & Rohan Royal Wedding')).toBeInTheDocument();
    expect(screen.getByText(/traditional/)).toBeInTheDocument();
    expect(screen.getByText('Adaptation Parameters:')).toBeInTheDocument();
  });

  it('renders all four pillars of the celebration plan', () => {
    render(<PrintBrief plan={FULL_MOCK_PLAN} today={'2026-10-30' as IsoDate} />);

    expect(screen.getByText('Pillar 1: Budget Allocations')).toBeInTheDocument();
    expect(screen.getAllByText('Venue & Facilities').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Catering & Beverages').length).toBeGreaterThan(0);

    expect(screen.getByText('Pillar 2: Timeline Schedule')).toBeInTheDocument();
    expect(screen.getByText('Book Grand Palace Banquet Hall')).toBeInTheDocument();
    expect(screen.getByText('Finalize Tasting Menu')).toBeInTheDocument();

    expect(screen.getByText('Pillar 3: Vendors & Contracting')).toBeInTheDocument();
    expect(screen.getByText('Check banquet hall sound curfew permits')).toBeInTheDocument();
    expect(screen.getByText('Royal Palace Grounds')).toBeInTheDocument();

    expect(screen.getByText('Pillar 4: Personalized Ideas & Concepts')).toBeInTheDocument();
    expect(screen.getByText('Sunset Lantern Welcome Pathway')).toBeInTheDocument();
  });

  it('passes axe accessibility checks without violations', async () => {
    const { container } = render(
      <PrintBrief plan={FULL_MOCK_PLAN} today={'2026-10-30' as IsoDate} />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
