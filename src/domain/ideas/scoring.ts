import type { BudgetTier, IdeaTemplate } from './types';
import type { EventBrief } from '../types';

/** Classifies the event brief into a budget tier based on minor units allocated per guest. */
export function getBudgetTier(brief: EventBrief): BudgetTier {
  const count = Math.max(1, brief.guestCount);
  const perGuest = Math.floor(brief.totalBudget / count);
  return perGuest >= 10_000 ? 'budget_premium' : 'budget_modest';
}

function scoreSettingMatch(tags: readonly string[], setting: EventBrief['setting']): number {
  if (tags.includes(setting) || tags.includes('hybrid') || setting === 'hybrid') {
    return 3;
  }
  return 0;
}

function scoreFlagMatches(tags: readonly string[], flags: EventBrief['flags']): number {
  let points = 0;
  const flagKeys: readonly (keyof EventBrief['flags'])[] = [
    'kids',
    'elders',
    'dietary',
    'accessibility',
    'openBar',
    'amplifiedMusic',
    'surprise',
  ];
  for (const key of flagKeys) {
    if (flags[key] && tags.includes(key)) {
      points += 2;
    }
  }
  return points;
}

function scoreBudgetTierMatch(tags: readonly string[], tier: BudgetTier): number {
  return tags.includes(tier) ? 2 : 0;
}

function scorePriorityMatches(
  tags: readonly string[],
  priorities: EventBrief['top3Priorities'],
): number {
  let points = 0;
  for (const priority of priorities) {
    const clean = priority.trim().toLowerCase();
    if (clean.length === 0) {
      continue;
    }
    const matched = tags.some((tag) => {
      const lowerTag = tag.toLowerCase();
      return clean === lowerTag || clean.includes(lowerTag) || lowerTag.includes(clean);
    });
    if (matched) {
      points += 1;
    }
  }
  return points;
}

/** Computes deterministic relevance score for an idea template against an event brief. */
export function scoreIdea(template: IdeaTemplate, brief: EventBrief): number {
  let score = 0;
  score += scoreSettingMatch(template.tags, brief.setting);
  score += scoreFlagMatches(template.tags, brief.flags);
  score += scoreBudgetTierMatch(template.tags, getBudgetTier(brief));
  score += scorePriorityMatches(template.tags, brief.top3Priorities);
  return score;
}
