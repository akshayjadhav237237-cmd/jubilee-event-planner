import type { JSX } from 'react';
import type { Plan } from '../../domain/types';
import { formatMoney } from '../../domain/money';

/** Renders vendor contracting checklist and quotes comparison for print layout. */
export function PrintVendorsSection({ plan }: { readonly plan: Plan }): JSX.Element {
  const { vendorChecklist, quotes, brief } = plan;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-200 pb-1">
        Pillar 3: Vendors & Contracting
      </h2>
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
          Vetting Checklist
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
          {vendorChecklist.map((c) => (
            <li key={c.id} className="flex items-center gap-1.5">
              <span className="font-mono text-stone-500">[{c.completed ? 'X' : ' '}]</span>
              <span>{c.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 mt-3">
        <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
          Vendor Quotes
        </h3>
        {quotes.length === 0 ? (
          <p className="text-xs text-stone-500 italic">No vendor quotes recorded yet.</p>
        ) : (
          <table className="w-full text-left text-xs border border-stone-300">
            <thead className="bg-stone-100 border-b border-stone-300">
              <tr>
                <th className="p-1.5 font-semibold">Vendor</th>
                <th className="p-1.5 font-semibold">Category</th>
                <th className="p-1.5 font-semibold text-right">Amount</th>
                <th className="p-1.5 font-semibold">Status</th>
                <th className="p-1.5 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {quotes.map((q) => (
                <tr key={q.id}>
                  <td className="p-1.5 font-medium">{q.vendorName}</td>
                  <td className="p-1.5">{q.category}</td>
                  <td className="p-1.5 text-right">{formatMoney(q.amount, brief.currency)}</td>
                  <td className="p-1.5 capitalize">{q.status}</td>
                  <td className="p-1.5 text-stone-600">{q.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

/** Renders curated personalized celebration ideas for print layout. */
export function PrintIdeasSection({ plan }: { readonly plan: Plan }): JSX.Element {
  const { ideas } = plan;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-200 pb-1">
        Pillar 4: Personalized Ideas & Concepts
      </h2>
      {ideas.length === 0 ? (
        <p className="text-xs text-stone-500 italic">No ideas selected yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="border border-stone-200 rounded p-2.5 text-xs bg-stone-50/50"
            >
              <div className="font-semibold text-stone-900">{idea.title}</div>
              <div className="text-stone-500 capitalize text-[11px] mb-1">{idea.category}</div>
              <p className="text-stone-700 leading-normal">{idea.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
