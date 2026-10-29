import type { EventBrief, BudgetState } from '../types';
import type { Alert } from '../alerts';
import { getDomainFloor } from './constants';

const cappedBudgets = new WeakSet<object>();

/** Records a budget state instance as having capped contingency. */
export function trackCappedBudget(budget: object): void {
  cappedBudgets.add(budget);
}

/** Determines whether a budget state contingency was capped at the 15% ceiling. */
export function isContingencyCapped(budget: BudgetState): boolean {
  return budget.contingencyRate > 15 || cappedBudgets.has(budget);
}

function checkPerHeadFloor(brief: EventBrief, floor: number, alerts: Alert[]): void {
  if (brief.guestCount > 0 && brief.totalBudget / brief.guestCount < floor) {
    alerts.push({
      code: 'PER_HEAD_FLOOR_VIOLATION',
      severity: 'warn',
      message: `Total budget per head is below planning heuristic floor of ${floor} for ${brief.currency}`,
    });
  }
}

function checkAllocationsAndSpend(budget: BudgetState, netBudget: number, alerts: Alert[]): void {
  for (const cat of budget.categories) {
    if (netBudget > 0 && cat.allocated > 0.45 * netBudget) {
      alerts.push({
        code: 'CATEGORY_OVER_ALLOCATED',
        severity: 'warn',
        message: `Category "${cat.name}" allocation exceeds 45% of net budget`,
        categoryId: cat.id,
      });
    }
    if (cat.spent > cat.allocated) {
      alerts.push({
        code: 'OVERSPENT_BUDGET',
        severity: 'critical',
        message: `Category "${cat.name}" spend exceeds allocated budget`,
        categoryId: cat.id,
      });
    }
  }
}

/** Evaluates budget state against domain rules and returns active alerts. */
export function budgetAlerts(
  brief: EventBrief,
  budget: BudgetState,
  heuristicFloor?: number,
): readonly Alert[] {
  const alerts: Alert[] = [];
  const floor = heuristicFloor ?? getDomainFloor(brief.currency, brief.eventType);

  checkPerHeadFloor(brief, floor, alerts);

  if (isContingencyCapped(budget)) {
    alerts.push({
      code: 'CONTINGENCY_CAPPED',
      severity: 'warn',
      message: 'Contingency rate reached maximum allowable cap of 15%',
    });
  }

  const contingencyAmount = Math.floor((budget.totalBudget * budget.contingencyRate) / 100);
  const netBudget = budget.totalBudget - contingencyAmount;
  checkAllocationsAndSpend(budget, netBudget, alerts);

  const totalAllocated = budget.categories.reduce((acc, cat) => acc + cat.allocated, 0);
  if (totalAllocated + contingencyAmount !== budget.totalBudget) {
    alerts.push({
      code: 'UNALLOCATED_REMAINDER',
      severity: 'critical',
      message: 'Category allocations and contingency do not equal total event budget',
    });
  }

  return alerts;
}
