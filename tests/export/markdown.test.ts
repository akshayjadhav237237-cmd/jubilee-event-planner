import { describe, expect, it } from 'vitest';
import type { IsoDate } from '../../src/domain/dates';
import type { Plan, VendorQuote } from '../../src/domain/types';
import { generateMarkdownBrief } from '../../src/export/markdown';
import { buildPlan } from '../../src/state/buildPlan';
import { DEFAULT_BIRTHDAY_BRIEF, DEFAULT_WEDDING_BRIEF } from '../helpers/briefs';

describe('Markdown Brief Export', () => {
  const mockDeps = {
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => 'test-plan-id',
  };

  it('generates markdown containing header and event overview details', () => {
    const plan = buildPlan(DEFAULT_WEDDING_BRIEF, mockDeps);
    const md = generateMarkdownBrief(plan, '2026-10-30' as IsoDate);

    expect(md).toContain(`# ${DEFAULT_WEDDING_BRIEF.title}`);
    expect(md).toContain('## Event Overview');
    expect(md).toContain('- **Event Type:** wedding (traditional)');
    expect(md).toContain(`- **Date:** ${DEFAULT_WEDDING_BRIEF.eventDate}`);
    expect(md).toContain(`- **Guests:** ${DEFAULT_WEDDING_BRIEF.guestCount}`);
    expect(md).toContain(`- **Setting:** ${DEFAULT_WEDDING_BRIEF.setting}`);
    expect(md).toContain('## Adaptation Reasons');
  });

  it('formats Pillar 1 budget summary with totals, contingency, and category breakdown', () => {
    const plan = buildPlan(DEFAULT_WEDDING_BRIEF, mockDeps);
    const md = generateMarkdownBrief(plan, '2026-10-30' as IsoDate);

    expect(md).toContain('## Pillar 1: Budget Summary');
    expect(md).toContain('- **Total Budget:**');
    expect(md).toContain('- **Contingency Reserve:**');
    expect(md).toContain(`(${plan.budget.contingencyRate}%)`);
    expect(md).toContain('### Category Allocations');
    expect(md).toContain('| Category | Allocated | Spent | Remaining | Weight |');

    for (const cat of plan.budget.categories) {
      expect(md).toContain(`| ${cat.name} |`);
    }
  });

  it('formats Pillar 2 timeline schedule with countdown days and task table', () => {
    const plan = buildPlan(DEFAULT_WEDDING_BRIEF, mockDeps);
    const md = generateMarkdownBrief(plan, '2026-10-30' as IsoDate);

    expect(md).toContain('## Pillar 2: Timeline Schedule');
    expect(md).toContain('- **Countdown:**');
    expect(md).toContain('days remaining');
    expect(md).toContain('| Task | Category | Due Date | Status | Notes |');

    const firstTask = plan.timeline[0];
    if (firstTask) {
      expect(md).toContain(firstTask.title);
      expect(md).toContain(firstTask.dueDate);
    }
  });

  it('formats Pillar 3 vendors guides, vetting checklists, and quotes comparison', () => {
    const basePlan = buildPlan(DEFAULT_WEDDING_BRIEF, mockDeps);
    const sampleQuote: VendorQuote = {
      id: 'quote-1',
      vendorName: 'Royal Palace Banquet',
      category: 'Venue & Facilities',
      amount: 45000000,
      status: 'shortlisted',
      notes: 'Includes lighting and basic staging',
    };

    const planWithQuotes: Plan = {
      ...basePlan,
      quotes: [sampleQuote],
    };

    const md = generateMarkdownBrief(planWithQuotes, '2026-10-30' as IsoDate);

    expect(md).toContain('## Pillar 3: Vendors & Contracting');
    expect(md).toContain('### Category Guides');
    expect(md).toContain('### Vetting Checklists');
    expect(md).toContain('### Quotes Comparison');
    expect(md).toContain('| Royal Palace Banquet | Venue & Facilities |');
    expect(md).toContain('Includes lighting and basic staging');
  });

  it('formats Pillar 4 personalized ideas with category and score', () => {
    const plan = buildPlan(DEFAULT_BIRTHDAY_BRIEF, mockDeps);
    const md = generateMarkdownBrief(plan, '2026-10-30' as IsoDate);

    expect(md).toContain('## Pillar 4: Personalized Ideas');
    expect(md).toContain('Score:');

    const firstIdea = plan.ideas[0];
    if (firstIdea) {
      expect(md).toContain(firstIdea.title);
      expect(md).toContain(firstIdea.category);
    }
  });

  it('handles empty timeline, quotes, and ideas gracefully', () => {
    const basePlan = buildPlan(DEFAULT_WEDDING_BRIEF, mockDeps);
    const emptyPlan: Plan = {
      ...basePlan,
      timeline: [],
      quotes: [],
      ideas: [],
      vendorChecklist: [],
    };

    const md = generateMarkdownBrief(emptyPlan, '2026-10-30' as IsoDate);

    expect(md).toContain('_No tasks scheduled_');
    expect(md).toContain('_No checklist items recorded._');
    expect(md).toContain('_No quotes recorded_');
    expect(md).toContain('_No curated ideas saved._');
  });
});
