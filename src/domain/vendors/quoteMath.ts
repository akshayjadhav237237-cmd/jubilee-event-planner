import type { BudgetState, VendorQuote } from '../types';
import type { CategoryQuoteSummary, VendorState, VendorSummary } from './types';

function computeCategoryCommitted(quotes: readonly VendorQuote[]): number {
  const accepted = quotes.filter((q) => q.status === 'accepted');
  if (accepted.length > 0) {
    return accepted.reduce((sum, q) => sum + Math.round(q.amount), 0);
  }
  const shortlisted = quotes.filter((q) => q.status === 'shortlisted');
  return shortlisted.reduce((sum, q) => sum + Math.round(q.amount), 0);
}

function collectCategoryIds(
  budget: BudgetState,
  quotes: readonly VendorQuote[],
): readonly string[] {
  const ids = new Set<string>();
  for (const cat of budget.categories) {
    ids.add(cat.id);
  }
  for (const quote of quotes) {
    ids.add(quote.category);
  }
  return Array.from(ids);
}

/** Calculates committed vendor expenses and budget variance across categories. */
export function summarizeQuotes(state: VendorState, budget: BudgetState): VendorSummary {
  const categoryIds = collectCategoryIds(budget, state.quotes);
  const byCategory: Record<string, CategoryQuoteSummary> = {};
  let committedTotal = 0;
  let allocatedTotal = 0;

  for (const catId of categoryIds) {
    const budgetCat = budget.categories.find((c) => c.id === catId);
    const allocated = budgetCat !== undefined ? Math.round(budgetCat.allocated) : 0;
    const catQuotes = state.quotes.filter((q) => q.category === catId);
    const committed = computeCategoryCommitted(catQuotes);
    const variance = allocated - committed;

    byCategory[catId] = { categoryId: catId, allocated, committed, variance };
    committedTotal += committed;
    allocatedTotal += allocated;
  }

  const overallVariance = allocatedTotal - committedTotal;
  return { committedTotal, variance: overallVariance, byCategory };
}
