import type { JSX } from 'react';
import { Badge } from '../../shared/ui';
import type { VendorCategorySectionView } from './view';
import { VendorQuotesList } from './VendorQuotesList';

export interface CategoryVendorSectionProps {
  readonly section: VendorCategorySectionView;
  readonly onToggleChecklist: (itemId: string) => void;
  readonly onRemoveQuote: (quoteId: string) => void;
}

/** Displays category vendor guide, vetting red flags, contract checklist, and recorded quotes. */
export function CategoryVendorSection({
  section,
  onToggleChecklist,
  onRemoveQuote,
}: CategoryVendorSectionProps): JSX.Element {
  return (
    <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
        <div>
          <h3 className="font-semibold text-lg text-ink-text">{section.categoryName}</h3>
          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
            <span>Allocated: {section.allocatedFormatted}</span>
            <span>Committed: {section.committedFormatted}</span>
          </div>
        </div>
        {section.isOverAllocated && (
          <Badge
            text={`Committed Exceeds Budget (${section.varianceFormatted})`}
            variant="critical"
          />
        )}
      </div>

      {section.guide && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-sand-accent/20 p-3 rounded-lg">
          <div>
            <span className="font-semibold text-stone-800 block mb-1">Key Vetting Questions:</span>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              {section.guide.questions.slice(0, 3).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold text-red-800 block mb-1">Red Flags:</span>
            <ul className="list-disc pl-4 space-y-1 text-red-700">
              {section.guide.redFlags.slice(0, 2).map((rf, i) => (
                <li key={i}>{rf}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {section.checklist.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Contract & Milestone Checklist
          </span>
          <div className="space-y-1">
            {section.checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-2 text-xs text-stone-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggleChecklist(item.id)}
                  className="mt-0.5 rounded text-gold-accent focus:ring-gold-accent"
                />
                <span className={item.completed ? 'line-through text-stone-400' : ''}>
                  {item.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <VendorQuotesList quotes={section.quotes} onRemoveQuote={onRemoveQuote} />
    </div>
  );
}
