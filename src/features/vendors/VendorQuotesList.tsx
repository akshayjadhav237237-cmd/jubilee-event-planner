import type { JSX } from 'react';
import type { VendorQuote } from '../../domain/types';
import { Button } from '../../shared/ui';

export interface VendorQuotesListProps {
  readonly quotes: readonly VendorQuote[];
  readonly onRemoveQuote: (quoteId: string) => void;
}

/** Lists recorded vendor proposals and estimates with monetary breakdown. */
export function VendorQuotesList({ quotes, onRemoveQuote }: VendorQuotesListProps): JSX.Element {
  if (quotes.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-2 pt-2 border-t border-stone-100">
      <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
        Quotes ({quotes.length})
      </span>
      <div className="space-y-2">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="flex items-center justify-between p-2.5 rounded border border-stone-200 text-xs"
          >
            <div>
              <span className="font-semibold text-ink-text">{q.vendorName}</span>
              <div className="text-stone-700 font-mono font-medium mt-0.5">
                Amount: {(q.amount / 100).toLocaleString()} | Status: {q.status}
              </div>
              {q.notes && <p className="text-stone-600 mt-1 italic">{q.notes}</p>}
            </div>
            <Button
              variant="ghost"
              onClick={() => onRemoveQuote(q.id)}
              aria-label={`Remove quote from ${q.vendorName}`}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
