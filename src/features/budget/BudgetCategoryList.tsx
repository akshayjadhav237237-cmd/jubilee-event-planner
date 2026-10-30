import type { JSX } from 'react';
import { ProgressBar, Badge } from '../../shared/ui';
import type { CategoryRow } from './view';

export interface BudgetCategoryListProps {
  readonly rows: readonly CategoryRow[];
}

/** Renders budget category allocations, spend progress, and overspent indicators. */
export function BudgetCategoryList({ rows }: BudgetCategoryListProps): JSX.Element {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.id}
          className="p-4 rounded-xl border border-stone-200 bg-white shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-text">{row.name}</span>
            <div className="flex items-center gap-2">
              {row.isOverspent ? (
                <Badge text="Overspent" variant="critical" />
              ) : (
                <Badge text={`${row.weight}% wt`} variant="neutral" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Spent: {row.spentFormatted}</span>
            <span>Allocated: {row.allocatedFormatted}</span>
          </div>

          <ProgressBar
            value={row.percentSpent}
            variant={row.isOverspent ? 'critical' : 'default'}
            label={`${row.name} spend progress`}
          />

          <div className="text-right text-xs text-stone-700 font-mono font-medium">
            Remaining: {row.remainingFormatted}
          </div>
        </div>
      ))}
    </div>
  );
}
