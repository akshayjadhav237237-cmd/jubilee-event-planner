import type { JSX } from 'react';

/** Renders the vendor checklist and quote comparison panel placeholder. */
export function VendorsPanel(): JSX.Element {
  return (
    <div id="vendors-panel" className="p-6 bg-white rounded-lg border border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-2">Vendor Checklist & Quotes</h2>
      <p className="text-stone-600">
        Compare vendor quotes, review critical vetting questions, and track contracted services.
      </p>
    </div>
  );
}
