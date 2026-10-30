import { useState, type JSX } from 'react';
import { usePlan, useDispatch } from '../../state/hooks';
import { Button, EmptyState } from '../../shared/ui';
import { computeVendorSections } from './view';
import { QuoteModal } from './QuoteModal';
import { CategoryVendorSection } from './CategoryVendorSection';

/** Vendors panel managing category vetting questions, red flags, contract checks, and quotes. */
export function VendorsPanel(): JSX.Element {
  const plan = usePlan();
  const { dispatch } = useDispatch();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  if (!plan) {
    return (
      <EmptyState title="No Active Plan" description="Create or load a plan to view vendors." />
    );
  }

  const sections = computeVendorSections(
    plan.brief,
    plan.budget,
    plan.quotes,
    plan.vendorChecklist,
  );

  return (
    <section aria-labelledby="vendors-title" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="vendors-title" className="text-2xl font-serif font-bold text-ink-text">
            Vendors & Contracting
          </h2>
          <p className="text-sm text-stone-600">
            Vetting guidelines, negotiation red flags, and competitive quote comparisons.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsQuoteModalOpen(true)}>
          Add Vendor Quote
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <CategoryVendorSection
            key={section.categoryId}
            section={section}
            onToggleChecklist={(itemId) => dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', itemId })}
            onRemoveQuote={(quoteId) => dispatch({ type: 'REMOVE_QUOTE', quoteId })}
          />
        ))}
      </div>

      <QuoteModal
        open={isQuoteModalOpen}
        budget={plan.budget}
        currency={plan.brief.currency}
        onClose={() => setIsQuoteModalOpen(false)}
        onAddQuote={(quote) => dispatch({ type: 'ADD_QUOTE', quote })}
      />
    </section>
  );
}
