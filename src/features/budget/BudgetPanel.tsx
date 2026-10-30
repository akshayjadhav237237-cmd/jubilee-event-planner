import { useState, type JSX } from 'react';
import { usePlan, useDispatch } from '../../state/hooks';
import { Stat, Button, Alert, EmptyState } from '../../shared/ui';
import { computeBudgetSummary, computeCategoryRows, getBudgetAlerts } from './view';
import { ContingencyControl } from './ContingencyControl';
import { TransferModal } from './TransferModal';
import { SpendModal } from './SpendModal';
import { BudgetCategoryList } from './BudgetCategoryList';

/** Primary financial management panel for allocations, contingency, and spend tracking. */
export function BudgetPanel(): JSX.Element {
  const plan = usePlan();
  const { dispatch } = useDispatch();
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isSpendOpen, setIsSpendOpen] = useState(false);

  if (!plan) {
    return (
      <EmptyState title="No Active Plan" description="Create or load a plan to view budgets." />
    );
  }

  const summary = computeBudgetSummary(plan.brief, plan.budget);
  const rows = computeCategoryRows(plan.budget, plan.brief.currency);
  const alerts = getBudgetAlerts(plan.brief, plan.budget);

  return (
    <section aria-labelledby="budget-title" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="budget-title" className="text-2xl font-serif font-bold text-ink-text">
            Celebration Budget
          </h2>
          <p className="text-sm text-stone-600">
            Budget Allocations & Spend. Per-head floor: {summary.perHeadFormatted} / guest across{' '}
            {plan.brief.guestCount} guests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsTransferOpen(true)}>
            Transfer
          </Button>
          <Button variant="primary" onClick={() => setIsSpendOpen(true)}>
            Log Spend
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Budget" value={summary.totalBudgetFormatted} />
        <Stat label="Allocated" value={summary.totalAllocatedFormatted} />
        <Stat label="Spent" value={summary.totalSpentFormatted} />
        <Stat label="Remaining" value={summary.remainingBudgetFormatted} />
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alt, idx) => (
            <Alert
              key={idx}
              severity={alt.severity === 'critical' ? 'critical' : 'warn'}
              title={alt.code}
              message={alt.message}
            />
          ))}
        </div>
      )}

      <ContingencyControl
        rate={plan.budget.contingencyRate}
        onChange={(rate) => dispatch({ type: 'SET_CONTINGENCY', rate })}
      />

      <BudgetCategoryList rows={rows} />

      <TransferModal
        open={isTransferOpen}
        budget={plan.budget}
        currency={plan.brief.currency}
        onClose={() => setIsTransferOpen(false)}
        onTransfer={(fromId, toId, amount) =>
          dispatch({ type: 'TRANSFER_BUDGET', fromCategoryId: fromId, toCategoryId: toId, amount })
        }
      />

      <SpendModal
        open={isSpendOpen}
        budget={plan.budget}
        currency={plan.brief.currency}
        onClose={() => setIsSpendOpen(false)}
        onLogSpend={(categoryId, amount) => dispatch({ type: 'LOG_SPEND', categoryId, amount })}
      />
    </section>
  );
}
