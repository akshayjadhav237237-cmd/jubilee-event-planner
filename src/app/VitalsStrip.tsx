import type { JSX } from 'react';
import type { Plan } from '../domain/types';
import type { IsoDate } from '../domain/dates';
import { daysBetween, startOfTodayUtc } from '../domain/dates';
import { formatMoney } from '../domain/money';

export interface VitalsStripProps {
  readonly plan: Plan;
}

function resolveDaysLabel(targetDate: IsoDate): string {
  const today = startOfTodayUtc();
  const days = daysBetween(today, targetDate);
  if (days < 0) {
    return 'Event concluded';
  }
  if (days === 0) {
    return 'Today is event day';
  }
  if (days === 1) {
    return '1 day remaining';
  }
  return `${days} days remaining`;
}

/** Renders high-level event metrics including countdown, budget totals, and task progress. */
export function VitalsStrip({ plan }: VitalsStripProps): JSX.Element {
  const daysText = resolveDaysLabel(plan.brief.eventDate);
  const totalBudget = plan.budget.totalBudget;
  const totalSpent = plan.budget.categories.reduce((acc, cat) => acc + cat.spent, 0);
  const currency = plan.brief.currency;
  const budgetText = `${formatMoney(totalSpent, currency)} spent of ${formatMoney(totalBudget, currency)}`;

  const totalTasks = plan.timeline.length;
  const completedTasks = plan.timeline.filter((task) => task.completed).length;
  const tasksText = `${completedTasks} of ${totalTasks} tasks completed`;

  return (
    <section aria-label="Event vitals" className="mb-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
          <span className="block text-xs uppercase font-semibold text-stone-700 tracking-wider mb-1">
            Timeline
          </span>
          <span className="text-lg font-bold text-stone-900">{daysText}</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
          <span className="block text-xs uppercase font-semibold text-stone-700 tracking-wider mb-1">
            Budget
          </span>
          <span className="text-lg font-bold text-stone-900">{budgetText}</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
          <span className="block text-xs uppercase font-semibold text-stone-700 tracking-wider mb-1">
            Checklist
          </span>
          <span className="text-lg font-bold text-stone-900">{tasksText}</span>
        </div>
      </div>
    </section>
  );
}
