import type { Alert } from '../../domain/alerts';
import { budgetAlerts } from '../../domain/budget';
import { formatMoney, parseMoney } from '../../domain/money';
import { err, ok, type Result } from '../../domain/result';
import type { BudgetState, EventBrief } from '../../domain/types';

export interface BudgetSummary {
  readonly totalBudgetFormatted: string;
  readonly totalAllocatedFormatted: string;
  readonly totalSpentFormatted: string;
  readonly remainingBudgetFormatted: string;
  readonly contingencyRate: number;
  readonly contingencyAmountFormatted: string;
  readonly perHeadFormatted: string;
  readonly totalSpentMinor: number;
  readonly totalBudgetMinor: number;
  readonly spendPercentage: number;
}

export interface CategoryRow {
  readonly id: string;
  readonly name: string;
  readonly allocatedFormatted: string;
  readonly spentFormatted: string;
  readonly remainingFormatted: string;
  readonly allocatedMinor: number;
  readonly spentMinor: number;
  readonly remainingMinor: number;
  readonly percentSpent: number;
  readonly isOverspent: boolean;
  readonly weight: number;
}

export interface TransferParams {
  readonly fromId: string;
  readonly toId: string;
  readonly amountMajor: string;
  readonly currency: string;
}

/** Computes high-level financial metrics and formatted currency summaries. */
export function computeBudgetSummary(brief: EventBrief, budget: BudgetState): BudgetSummary {
  const totalMinor = budget.totalBudget;
  const spentMinor = budget.categories.reduce((acc, c) => acc + c.spent, 0);
  const allocatedMinor = budget.categories.reduce((acc, c) => acc + c.allocated, 0);
  const remainingMinor = Math.max(0, totalMinor - spentMinor);
  const contingencyMinor = Math.round((totalMinor * budget.contingencyRate) / 100);
  const perHeadMinor = brief.guestCount > 0 ? Math.floor(totalMinor / brief.guestCount) : 0;
  const spendPct = totalMinor > 0 ? Math.min(100, Math.round((spentMinor / totalMinor) * 100)) : 0;

  return {
    totalBudgetFormatted: formatMoney(totalMinor, brief.currency),
    totalAllocatedFormatted: formatMoney(allocatedMinor, brief.currency),
    totalSpentFormatted: formatMoney(spentMinor, brief.currency),
    remainingBudgetFormatted: formatMoney(remainingMinor, brief.currency),
    contingencyRate: budget.contingencyRate,
    contingencyAmountFormatted: formatMoney(contingencyMinor, brief.currency),
    perHeadFormatted: formatMoney(perHeadMinor, brief.currency),
    totalSpentMinor: spentMinor,
    totalBudgetMinor: totalMinor,
    spendPercentage: spendPct,
  };
}

/** Formats category rows with progress percentages and overspend indicators. */
export function computeCategoryRows(budget: BudgetState, currency: string): readonly CategoryRow[] {
  return budget.categories.map((cat) => {
    const remaining = cat.allocated - cat.spent;
    const isOverspent = cat.spent > cat.allocated;
    const pct =
      cat.allocated > 0 ? Math.min(100, Math.round((cat.spent / cat.allocated) * 100)) : 0;

    return {
      id: cat.id,
      name: cat.name,
      allocatedFormatted: formatMoney(cat.allocated, currency),
      spentFormatted: formatMoney(cat.spent, currency),
      remainingFormatted: formatMoney(Math.max(0, remaining), currency),
      allocatedMinor: cat.allocated,
      spentMinor: cat.spent,
      remainingMinor: remaining,
      percentSpent: pct,
      isOverspent,
      weight: cat.weight,
    };
  });
}

/** Validates budget reallocations across categories. */
export function validateTransfer(
  budget: BudgetState,
  params: TransferParams,
): Result<
  { readonly fromCategoryId: string; readonly toCategoryId: string; readonly amount: number },
  string
> {
  if (params.fromId === params.toId) {
    return err('Source and destination categories must be different');
  }
  const fromCat = budget.categories.find((c) => c.id === params.fromId);
  const toCat = budget.categories.find((c) => c.id === params.toId);
  if (!fromCat || !toCat) {
    return err('One or both categories not found');
  }

  const parsed = parseMoney(params.amountMajor, params.currency);
  if (!parsed.ok || parsed.value <= 0) {
    return err('Transfer amount must be a positive number');
  }
  if (parsed.value > fromCat.allocated) {
    return err(
      `Transfer amount exceeds available category allocation (${formatMoney(fromCat.allocated, params.currency)})`,
    );
  }

  return ok({
    fromCategoryId: params.fromId,
    toCategoryId: params.toId,
    amount: parsed.value,
  });
}

/** Validates spend logging inputs for a category. */
export function validateSpend(
  budget: BudgetState,
  categoryId: string,
  amountMajor: string,
  currency: string,
): Result<{ readonly categoryId: string; readonly amount: number }, string> {
  const cat = budget.categories.find((c) => c.id === categoryId);
  if (!cat) {
    return err('Category not found');
  }
  const parsed = parseMoney(amountMajor, currency);
  if (!parsed.ok || parsed.value <= 0) {
    return err('Spend amount must be a positive number');
  }
  return ok({
    categoryId,
    amount: parsed.value,
  });
}

/** Evaluates and returns domain budget alerts. */
export function getBudgetAlerts(brief: EventBrief, budget: BudgetState): readonly Alert[] {
  return budgetAlerts(brief, budget);
}
