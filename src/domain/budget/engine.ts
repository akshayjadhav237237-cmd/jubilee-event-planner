import type { EventBrief, BudgetState, CategoryAllocation } from '../types';
import type { AdaptationEffects } from '../adaptationTypes';
import { allocateLargestRemainder } from '../money';
import { getDomainCategories, getDomainPresetWeights } from './constants';
import { trackCappedBudget, budgetAlerts } from './alerts';

/** Builds initial budget state allocating net funds across categories with Hare-Niemeyer rounding. */
export function buildBudget(brief: EventBrief, effects?: AdaptationEffects): BudgetState {
  const safeTotal = Math.max(0, Math.floor(brief.totalBudget));
  const rawContingency = 5 + (effects?.contingencyDelta ?? 0);
  const contingencyRate = Math.min(15, Math.max(0, rawContingency));
  const contingencyAmount = Math.floor((safeTotal * contingencyRate) / 100);
  const netBudget = safeTotal - contingencyAmount;

  const categories = getDomainCategories(brief.eventType);
  const baseWeights = getDomainPresetWeights(brief.eventType);

  const effectiveWeights = categories.map((cat) => {
    const baseWeight = baseWeights[cat.id] ?? 10;
    const factor = effects?.weightFactors[cat.id] ?? 1;
    return Math.max(0, Math.round(baseWeight * factor));
  });

  const allocations = allocateLargestRemainder(netBudget, effectiveWeights);

  const categoryAllocations: readonly CategoryAllocation[] = categories.map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    allocated: allocations[idx] ?? 0,
    spent: 0,
    weight: effectiveWeights[idx] ?? 10,
  }));

  const budgetState: BudgetState = {
    categories: categoryAllocations,
    contingencyRate,
    totalBudget: safeTotal,
  };

  if (rawContingency > 15) {
    trackCappedBudget(budgetState);
  }

  return budgetState;
}

/** Updates a category weight and reallocates the net budget across all categories. */
export function setCategoryWeight(budget: BudgetState, id: string, weight: number): BudgetState {
  const targetIndex = budget.categories.findIndex((cat) => cat.id === id);
  if (targetIndex === -1) {
    return budget;
  }

  const safeWeight = Math.max(0, Math.round(weight));
  const contingencyAmount = Math.floor((budget.totalBudget * budget.contingencyRate) / 100);
  const netBudget = budget.totalBudget - contingencyAmount;

  const newWeights = budget.categories.map((cat, idx) =>
    idx === targetIndex ? safeWeight : cat.weight,
  );
  const allocations = allocateLargestRemainder(netBudget, newWeights);

  const newCategories = budget.categories.map((cat, idx) => ({
    ...cat,
    weight: newWeights[idx] ?? cat.weight,
    allocated: allocations[idx] ?? 0,
  }));

  return {
    ...budget,
    categories: newCategories,
  };
}

/** Transfers an allocated amount between two categories while maintaining total budget balance. */
export function transferBudget(
  budget: BudgetState,
  from: string,
  to: string,
  amount: number,
): BudgetState {
  if (from === to || amount <= 0) {
    return budget;
  }

  const fromCategory = budget.categories.find((c) => c.id === from);
  const toCategory = budget.categories.find((c) => c.id === to);
  if (!fromCategory || !toCategory) {
    return budget;
  }

  const transferAmount = Math.min(fromCategory.allocated, Math.floor(amount));
  if (transferAmount <= 0) {
    return budget;
  }

  const newCategories = budget.categories.map((cat) => {
    if (cat.id === from) {
      return { ...cat, allocated: cat.allocated - transferAmount };
    }
    if (cat.id === to) {
      return { ...cat, allocated: cat.allocated + transferAmount };
    }
    return cat;
  });

  return {
    ...budget,
    categories: newCategories,
  };
}

/** Updates the contingency rate within 0% to 15% and reallocates remaining net budget. */
export function setContingency(budget: BudgetState, pct: number): BudgetState {
  const roundedPct = Math.round(pct);
  const cappedRate = Math.min(15, Math.max(0, roundedPct));
  const contingencyAmount = Math.floor((budget.totalBudget * cappedRate) / 100);
  const netBudget = budget.totalBudget - contingencyAmount;

  const weights = budget.categories.map((cat) => cat.weight);
  const allocations = allocateLargestRemainder(netBudget, weights);

  const newCategories = budget.categories.map((cat, idx) => ({
    ...cat,
    allocated: allocations[idx] ?? 0,
  }));

  const nextState: BudgetState = {
    ...budget,
    contingencyRate: cappedRate,
    categories: newCategories,
  };

  if (roundedPct > 15) {
    trackCappedBudget(nextState);
  }

  return nextState;
}

/** Records an expenditure against a category ID without modifying allocated amounts. */
export function logSpend(budget: BudgetState, id: string, amount: number): BudgetState {
  const target = budget.categories.find((c) => c.id === id);
  if (!target) {
    return budget;
  }

  const safeAmount = Math.floor(amount);
  const newCategories = budget.categories.map((cat) => {
    if (cat.id === id) {
      return { ...cat, spent: Math.max(0, cat.spent + safeAmount) };
    }
    return cat;
  });

  return {
    ...budget,
    categories: newCategories,
  };
}

export { budgetAlerts };
