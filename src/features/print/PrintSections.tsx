import type { JSX } from 'react';
import type { Plan } from '../../domain/types';
import { formatMoney } from '../../domain/money';
import { daysBetween, type IsoDate } from '../../domain/dates';
import { evaluateAdaptations } from '../../domain/adaptations';

/** Renders the overview header and triggered adaptation rules for print layout. */
export function PrintHeader({
  plan,
  today,
}: {
  readonly plan: Plan;
  readonly today: IsoDate;
}): JSX.Element {
  const { brief } = plan;
  const adaptations = evaluateAdaptations(brief, today);

  return (
    <header className="border-b border-stone-300 pb-4">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">{brief.title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs text-stone-700">
        <div>
          <span className="font-semibold">Type:</span> {brief.eventType} ({brief.subFormat})
        </div>
        <div>
          <span className="font-semibold">Date:</span> {brief.eventDate}
        </div>
        <div>
          <span className="font-semibold">Guests:</span> {brief.guestCount}
        </div>
        <div>
          <span className="font-semibold">Setting:</span> {brief.setting}
        </div>
      </div>
      <div className="mt-3 text-xs text-stone-700">
        <span className="font-semibold">Priorities:</span> {brief.top3Priorities.join(', ')}
      </div>
      <div className="mt-3 text-xs bg-stone-50 p-2.5 rounded border border-stone-200">
        <div className="font-semibold text-stone-800 mb-1">Adaptation Parameters:</div>
        {adaptations.length === 0 ? (
          <p className="text-stone-600">Standard celebration parameters applied.</p>
        ) : (
          <ul className="list-disc list-inside space-y-0.5 text-stone-600">
            {adaptations.map((a) => (
              <li key={a.id}>
                <span className="font-medium text-stone-800">{a.ruleName}:</span> {a.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}

/** Renders the budget allocations, contingency reserve, and spend table for print layout. */
export function PrintBudgetSection({ plan }: { readonly plan: Plan }): JSX.Element {
  const { budget, brief } = plan;
  const contingencyAmount = Math.round(brief.totalBudget * (budget.contingencyRate / 100));

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-200 pb-1">
        Pillar 1: Budget Allocations
      </h2>
      <div className="flex gap-6 text-xs text-stone-700 font-medium">
        <div>Total: {formatMoney(brief.totalBudget, brief.currency)}</div>
        <div>
          Contingency ({budget.contingencyRate}%): {formatMoney(contingencyAmount, brief.currency)}
        </div>
      </div>
      <table className="w-full text-left text-xs border border-stone-300">
        <thead className="bg-stone-100 border-b border-stone-300">
          <tr>
            <th className="p-1.5 font-semibold">Category</th>
            <th className="p-1.5 font-semibold text-right">Weight</th>
            <th className="p-1.5 font-semibold text-right">Allocated</th>
            <th className="p-1.5 font-semibold text-right">Spent</th>
            <th className="p-1.5 font-semibold text-right">Remaining</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {budget.categories.map((c) => (
            <tr key={c.id}>
              <td className="p-1.5">{c.name}</td>
              <td className="p-1.5 text-right">{c.weight}%</td>
              <td className="p-1.5 text-right">{formatMoney(c.allocated, brief.currency)}</td>
              <td className="p-1.5 text-right">{formatMoney(c.spent, brief.currency)}</td>
              <td className="p-1.5 text-right">
                {formatMoney(c.allocated - c.spent, brief.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** Renders timeline tasks and countdown schedule for print layout. */
export function PrintTimelineSection({
  plan,
  today,
}: {
  readonly plan: Plan;
  readonly today: IsoDate;
}): JSX.Element {
  const { brief, timeline } = plan;
  const days = daysBetween(today, brief.eventDate);
  const countdownText = days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days ago`;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-stone-200 pb-1">
        <h2 className="text-lg font-semibold text-stone-900">Pillar 2: Timeline Schedule</h2>
        <span className="text-xs font-medium text-stone-600">{countdownText}</span>
      </div>
      <table className="w-full text-left text-xs border border-stone-300">
        <thead className="bg-stone-100 border-b border-stone-300">
          <tr>
            <th className="p-1.5 font-semibold">Task</th>
            <th className="p-1.5 font-semibold">Category</th>
            <th className="p-1.5 font-semibold">Due Date</th>
            <th className="p-1.5 font-semibold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {timeline.map((t) => (
            <tr key={t.id}>
              <td className="p-1.5">{t.title}</td>
              <td className="p-1.5">{t.category}</td>
              <td className="p-1.5">{t.dueDate}</td>
              <td className="p-1.5 text-center">{t.completed ? 'Done' : 'Pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
