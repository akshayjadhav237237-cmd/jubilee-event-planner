import type { Plan } from '../../domain/types';
import type { AssistantResult } from '../ports';
import { findCategoryCandidates, fuzzyMatchCategory } from './fuzzy';
import { parseTransfer } from './transferParser';

function parseContingency(prompt: string): AssistantResult | null {
  if (!/\b(?:contingency|buffer)\b/i.test(prompt)) return null;

  const match = prompt.match(
    /\b(?:set|make|update|change)\s+(?:the\s+)?(?:contingency\s+buffer|contingency\s+rate|contingency|buffer)\s*(?:to\s+)?(-?[0-9]+(?:\.[0-9]+)?)\s*(?:%|percent(?:\b|$))/i,
  );
  if (!match) {
    return /\b(?:set|make|update|change)\b.*(?:contingency|buffer)/i.test(prompt)
      ? { kind: 'clarify', question: 'Please specify the target contingency percentage.' }
      : null;
  }
  const raw = match[1];
  if (raw === undefined) return null;
  const rate = Number(raw);
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    return { kind: 'refuse', reason: 'Contingency rate must be between 0% and 100%.' };
  }
  const rounded = Math.round(rate);
  return {
    kind: 'commands',
    commands: [{ type: 'SET_CONTINGENCY', rate: rounded }],
    summary: `Set contingency buffer to ${rounded}%.`,
  };
}

type AdjCatResult =
  | { kind: 'match'; cat: { id: string; name: string } }
  | { kind: 'clarify'; question: string }
  | null;

function resolveAdjustmentCategory(
  catQuery: string,
  categories: Plan['budget']['categories'],
): AdjCatResult {
  const category = fuzzyMatchCategory(catQuery, categories);
  if (category) return { kind: 'match', cat: category };
  const candidates = findCategoryCandidates(catQuery, categories);
  if (candidates.length > 1) {
    const names = candidates
      .slice(0, 3)
      .map((c) => c.name)
      .join(' or ');
    return { kind: 'clarify', question: `Did you mean ${names}?` };
  }
  return null;
}

interface AdjustmentQuery {
  readonly action: string;
  readonly catQuery: string;
  readonly pct: number;
}

function extractAdjustmentQuery(prompt: string): AdjustmentQuery | null {
  const pattern =
    /\b(increase|boost|raise|cut|reduce|decrease|lower)\b\s+(?:the\s+)?(?:budget\s+(?:for|of)\s+)?(.+?)(?:\s+budget)?\s+(?:by\s+)?(-?[0-9]+(?:\.[0-9]+)?)\s*(?:%|percent(?:\b|$))/i;
  const match = prompt.match(pattern);
  if (!match || !match[1] || !match[2] || !match[3]) return null;

  const pct = Number(match[3]);
  const catQuery = match[2].trim();
  if (catQuery.length === 0) return null;

  return { action: match[1].toLowerCase(), catQuery, pct };
}

function calculateNewWeight(currentWeight: number, pct: number, isCut: boolean): number {
  const delta = Math.round(currentWeight * (pct / 100));
  const step = Math.max(1, delta);
  return isCut ? Math.max(0, currentWeight - step) : currentWeight + step;
}

function buildWeightAdjustmentCommand(
  action: string,
  cat: { id: string; name: string },
  pct: number,
  categories: Plan['budget']['categories'],
): AssistantResult {
  const isCut = /cut|reduce|decrease|lower/.test(action);
  const currentCat = categories.find((c) => c.id === cat.id);
  const currentWeight = currentCat ? currentCat.weight : 10;
  const newWeight = calculateNewWeight(currentWeight, pct, isCut);
  const sign = isCut ? '-' : '+';
  const verb = isCut ? 'Reduced' : 'Increased';

  return {
    kind: 'commands',
    commands: [{ type: 'SET_CATEGORY_WEIGHT', categoryId: cat.id, weight: newWeight }],
    summary: `${verb} weight for ${cat.name} to ${newWeight} (${sign}${pct}%).`,
  };
}

function parseWeightAdjustment(prompt: string, plan: Plan): AssistantResult | null {
  if (
    /\b(?:increase|boost|raise|cut|reduce|decrease|lower)\b\s*(?:by\s*)?-?[0-9]+(?:\.[0-9]+)?\s*(?:%|percent(?:\b|$))/i.test(
      prompt,
    )
  ) {
    return { kind: 'clarify', question: 'Which category budget would you like to adjust?' };
  }

  const query = extractAdjustmentQuery(prompt);
  if (!query) return null;
  if (!Number.isFinite(query.pct) || query.pct <= 0) {
    return { kind: 'refuse', reason: 'Adjustment percentage must be greater than zero.' };
  }

  const resolved = resolveAdjustmentCategory(query.catQuery, plan.budget.categories);
  if (!resolved) {
    return { kind: 'clarify', question: `Could not find a category matching "${query.catQuery}".` };
  }
  if (resolved.kind === 'clarify') return resolved;

  return buildWeightAdjustmentCommand(
    query.action,
    resolved.cat,
    query.pct,
    plan.budget.categories,
  );
}

/** Parses natural language budget intents including transfers, weight adjustments, and contingency. */
export function parseBudgetIntent(prompt: string, plan: Plan): AssistantResult | null {
  return (
    parseContingency(prompt) ?? parseWeightAdjustment(prompt, plan) ?? parseTransfer(prompt, plan)
  );
}
