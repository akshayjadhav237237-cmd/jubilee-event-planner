import { describe, expect, it } from 'vitest';
import type { EventBrief } from '../../src/domain/types';
import type { IsoDate } from '../../src/domain/dates';
import { buildPlan } from '../../src/state/buildPlan';

const mockClock = (): Date => new Date(Date.UTC(2026, 9, 29, 12, 0, 0));

function createCounterId(prefix = 'plan'): () => string {
  let count = 0;
  return () => {
    count += 1;
    return `${prefix}_${String(count)}`;
  };
}

const weddingBrief: EventBrief = {
  title: 'Ananya & Rohan Wedding',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 150,
  totalBudget: 250000000,
  currency: 'INR',
  eventDate: '2027-04-15' as IsoDate,
  setting: 'hybrid',
  flags: {
    kids: true,
    elders: true,
    dietary: true,
    accessibility: true,
    openBar: true,
    amplifiedMusic: true,
    surprise: false,
  },
  top3Priorities: ['Catering & Banquet', 'Venue Aesthetics', 'Guest Experience'],
};

const birthdayBrief: EventBrief = {
  title: 'Liam 10th Birthday Adventure',
  eventType: 'birthday',
  subFormat: 'kids_party',
  guestCount: 30,
  totalBudget: 150000,
  currency: 'USD',
  eventDate: '2026-12-10' as IsoDate,
  setting: 'indoor',
  flags: {
    kids: true,
    elders: false,
    dietary: true,
    accessibility: false,
    openBar: false,
    amplifiedMusic: false,
    surprise: true,
  },
  top3Priorities: ['Interactive Entertainment', 'Cake & Sweet Treats', 'Goody Bags'],
};

const communityBrief: EventBrief = {
  title: 'Riverside Community Cultural Gala',
  eventType: 'community',
  subFormat: 'cultural_festival',
  guestCount: 400,
  totalBudget: 1200000,
  currency: 'GBP',
  eventDate: '2027-07-20' as IsoDate,
  setting: 'outdoor',
  flags: {
    kids: true,
    elders: true,
    dietary: true,
    accessibility: true,
    openBar: false,
    amplifiedMusic: true,
    surprise: false,
  },
  top3Priorities: ['Stage & Acoustics', 'Community Stalls', 'Safety & Sanitation'],
};

describe('buildPlan end-to-end integration', () => {
  it('builds a complete wedding plan composing all domain engines', () => {
    const deps = { clock: mockClock, ids: createCounterId() };
    const plan = buildPlan(weddingBrief, deps);

    expect(plan.id).toBe('plan_1');
    expect(plan.brief.title).toBe(weddingBrief.title);
    expect(plan.createdAt).toBe('2026-10-29');
    expect(plan.updatedAt).toBe('2026-10-29');

    // Budget check
    expect(plan.budget.categories.length).toBeGreaterThanOrEqual(8);
    const contingencyAmount = Math.floor(
      (plan.budget.totalBudget * plan.budget.contingencyRate) / 100,
    );
    const categorySum = plan.budget.categories.reduce((acc, c) => acc + c.allocated, 0);
    expect(categorySum + contingencyAmount).toBe(weddingBrief.totalBudget);

    // Timeline tasks check
    expect(plan.timeline.length).toBeGreaterThan(0);
    for (const task of plan.timeline) {
      expect(task.id.length).toBeGreaterThan(0);
      expect(task.dueDate.length).toBe(10);
    }

    // Vendor checklist check
    expect(plan.vendorChecklist.length).toBeGreaterThan(0);
    for (const item of plan.vendorChecklist) {
      expect(item.questions.length).toBeGreaterThan(0);
    }

    // Ideas check
    expect(plan.ideas.length).toBeGreaterThan(0);
  });

  it('builds a birthday plan with kids party and surprise adaptations', () => {
    const deps = { clock: mockClock, ids: createCounterId() };
    const plan = buildPlan(birthdayBrief, deps);

    expect(plan.brief.eventType).toBe('birthday');
    expect(plan.budget.totalBudget).toBe(150000);

    const contingencyAmount = Math.floor(
      (plan.budget.totalBudget * plan.budget.contingencyRate) / 100,
    );
    const categorySum = plan.budget.categories.reduce((acc, c) => acc + c.allocated, 0);
    expect(categorySum + contingencyAmount).toBe(birthdayBrief.totalBudget);
    expect(plan.ideas.some((i) => i.category === 'activity')).toBe(true);
  });

  it('builds a community plan with outdoor and safety considerations', () => {
    const deps = { clock: mockClock, ids: createCounterId() };
    const plan = buildPlan(communityBrief, deps);

    expect(plan.brief.eventType).toBe('community');
    expect(plan.budget.totalBudget).toBe(1200000);

    const contingencyAmount = Math.floor(
      (plan.budget.totalBudget * plan.budget.contingencyRate) / 100,
    );
    const categorySum = plan.budget.categories.reduce((acc, c) => acc + c.allocated, 0);
    expect(categorySum + contingencyAmount).toBe(communityBrief.totalBudget);
  });
});
