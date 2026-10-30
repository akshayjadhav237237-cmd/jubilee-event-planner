import type { JSX } from 'react';

/** Renders the budget allocations and expense tracking panel placeholder. */
export function BudgetPanel(): JSX.Element {
  return (
    <div id="budget-panel" className="p-6 bg-white rounded-lg border border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-2">Budget Allocations</h2>
      <p className="text-stone-600">
        Review category spending, track paid expenses, and adjust contingency reserves.
      </p>
    </div>
  );
}
