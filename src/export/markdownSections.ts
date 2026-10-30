import { ALL_IDEAS } from '../data/ideas';
import { getVendorGuidesForEventType } from '../data/vendors';
import { evaluateAdaptations } from '../domain/adaptations';
import { daysBetween, type IsoDate } from '../domain/dates';
import { scoreIdea } from '../domain/ideas/scoring';
import { formatMoney } from '../domain/money';
import type { EventBrief, IdeaItem, Plan } from '../domain/types';

/** Formats event header and adaptation reasons into markdown. */
export function formatHeaderAndAdaptations(plan: Plan, today: IsoDate): string {
  const { brief } = plan;
  const adaptations = evaluateAdaptations(brief, today);
  const adaptationLines =
    adaptations.length > 0
      ? adaptations.map((a) => `- **${a.ruleName}**: ${a.reason}`).join('\n')
      : '- No active adaptations triggered. Standard celebration parameters applied.';

  return [
    `# ${brief.title}`,
    '',
    '## Event Overview',
    `- **Event Type:** ${brief.eventType} (${brief.subFormat})`,
    `- **Date:** ${brief.eventDate}`,
    `- **Guests:** ${brief.guestCount}`,
    `- **Setting:** ${brief.setting}`,
    `- **Top Priorities:** ${brief.top3Priorities.join(', ')}`,
    '',
    '## Adaptation Reasons',
    adaptationLines,
  ].join('\n');
}

/** Formats Pillar 1 budget summary and per-category allocations into markdown. */
export function formatBudgetPillar(plan: Plan): string {
  const { budget, brief } = plan;
  const contingencyMinor = Math.floor((budget.totalBudget * budget.contingencyRate) / 100);
  const totalSpent = budget.categories.reduce((acc, c) => acc + c.spent, 0);
  const totalAllocated = budget.categories.reduce((acc, c) => acc + c.allocated, 0);
  const totalRemaining = Math.max(0, budget.totalBudget - totalSpent);

  const header = [
    '## Pillar 1: Budget Summary',
    `- **Total Budget:** ${formatMoney(budget.totalBudget, brief.currency)}`,
    `- **Contingency Reserve:** ${formatMoney(contingencyMinor, brief.currency)} (${budget.contingencyRate}%)`,
    `- **Total Allocated:** ${formatMoney(totalAllocated, brief.currency)}`,
    `- **Total Spent:** ${formatMoney(totalSpent, brief.currency)}`,
    `- **Remaining Budget:** ${formatMoney(totalRemaining, brief.currency)}`,
    '',
    '### Category Allocations',
    '| Category | Allocated | Spent | Remaining | Weight |',
    '| --- | --- | --- | --- | --- |',
  ];

  const rows = budget.categories.map((c) => {
    const rem = c.allocated - c.spent;
    return `| ${c.name} | ${formatMoney(c.allocated, brief.currency)} | ${formatMoney(c.spent, brief.currency)} | ${formatMoney(rem, brief.currency)} | ${c.weight}% |`;
  });

  return [...header, ...rows].join('\n');
}

/** Formats Pillar 2 timeline schedule with countdown and task table into markdown. */
export function formatTimelinePillar(plan: Plan, today: IsoDate): string {
  const daysRemaining = daysBetween(today, plan.brief.eventDate);
  const header = [
    '## Pillar 2: Timeline Schedule',
    `- **Countdown:** ${daysRemaining} days remaining`,
    '',
    '| Task | Category | Due Date | Status | Notes |',
    '| --- | --- | --- | --- | --- |',
  ];

  if (plan.timeline.length === 0) {
    return [...header, '| _No tasks scheduled_ | - | - | - | - |'].join('\n');
  }

  const rows = plan.timeline.map((t) => {
    const status = t.completed ? 'Completed' : 'Pending';
    const notes = t.dependencies.length > 0 ? `Depends on: ${t.dependencies.join(', ')}` : '-';
    return `| ${t.title} | ${t.category} | ${t.dueDate} | ${status} | ${notes} |`;
  });

  return [...header, ...rows].join('\n');
}

function formatGuideSection(eventType: Plan['brief']['eventType']): readonly string[] {
  const guides = getVendorGuidesForEventType(eventType);
  return guides.map((g) => {
    const qList = g.questions.map((q) => `  - ${q}`).join('\n');
    const rfList = g.redFlags.map((rf) => `  - ${rf}`).join('\n');
    return `#### ${g.categoryName}\n- **Key Questions:**\n${qList}\n- **Red Flags:**\n${rfList}`;
  });
}

/** Formats Pillar 3 vendors guides, vetting checklists, and quotes comparison into markdown. */
export function formatVendorsPillar(plan: Plan): string {
  const guideLines = formatGuideSection(plan.brief.eventType);
  const checklistLines =
    plan.vendorChecklist.length > 0
      ? plan.vendorChecklist
          .map(
            (c) =>
              `- [${c.completed ? 'x' : ' '}] **${c.title}** (${c.category}) | Questions: ${c.questions.join('; ')}`,
          )
          .join('\n')
      : '_No checklist items recorded._';

  const quoteHeader = [
    '### Quotes Comparison',
    '| Vendor | Category | Amount | Status | Notes |',
    '| --- | --- | --- | --- | --- |',
  ];
  const quoteRows =
    plan.quotes.length > 0
      ? plan.quotes.map(
          (q) =>
            `| ${q.vendorName} | ${q.category} | ${formatMoney(q.amount, plan.brief.currency)} | ${q.status} | ${q.notes.length > 0 ? q.notes : '-'} |`,
        )
      : ['| _No quotes recorded_ | - | - | - | - |'];

  return [
    '## Pillar 3: Vendors & Contracting',
    '### Category Guides',
    ...guideLines,
    '',
    '### Vetting Checklists',
    checklistLines,
    '',
    ...quoteHeader,
    ...quoteRows,
  ].join('\n');
}

function getIdeaScore(idea: IdeaItem, brief: EventBrief): number {
  if ('score' in idea && typeof (idea as { score: unknown }).score === 'number') {
    return (idea as { score: number }).score;
  }
  const template = ALL_IDEAS.find((t) => t.id === idea.id || t.title === idea.title);
  if (template !== undefined) {
    return scoreIdea(template, brief);
  }
  return idea.votes;
}

/** Formats Pillar 4 personalized ideas with category, relevance score, and description. */
export function formatIdeasPillar(plan: Plan): string {
  const header = ['## Pillar 4: Personalized Ideas'];
  if (plan.ideas.length === 0) {
    return [...header, '_No curated ideas saved._'].join('\n');
  }
  const items = plan.ideas.map((idea) => {
    const score = getIdeaScore(idea, plan.brief);
    return `- **${idea.title}** (${idea.category}) - Score: ${score}\n  ${idea.description}`;
  });
  return [...header, ...items].join('\n');
}
