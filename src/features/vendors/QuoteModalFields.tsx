import type { JSX } from 'react';
import type { QuoteStatus } from '../../domain/types';
import { Select, Input, Field, Textarea } from '../../shared/ui';

export interface QuoteModalFieldsProps {
  readonly vendorName: string;
  readonly category: string;
  readonly amountMajor: string;
  readonly currency: string;
  readonly status: QuoteStatus;
  readonly notes: string;
  readonly categoryOptions: readonly { readonly value: string; readonly label: string }[];
  readonly statusOptions: readonly { readonly value: QuoteStatus; readonly label: string }[];
  readonly onVendorNameChange: (val: string) => void;
  readonly onCategoryChange: (val: string) => void;
  readonly onAmountChange: (val: string) => void;
  readonly onStatusChange: (val: QuoteStatus) => void;
  readonly onNotesChange: (val: string) => void;
}

/** Input controls rendered inside the add vendor quote modal. */
export function QuoteModalFields({
  vendorName,
  category,
  amountMajor,
  currency,
  status,
  notes,
  categoryOptions,
  statusOptions,
  onVendorNameChange,
  onCategoryChange,
  onAmountChange,
  onStatusChange,
  onNotesChange,
}: QuoteModalFieldsProps): JSX.Element {
  return (
    <>
      <Field id="quote-vendor-name" label="Vendor / Company Name" required>
        {(props) => (
          <Input
            {...props}
            value={vendorName}
            placeholder="e.g. Royal Blooms Floral"
            onChange={(e) => onVendorNameChange(e.target.value)}
          />
        )}
      </Field>

      <Field id="quote-category" label="Category" required>
        {(props) => (
          <Select
            {...props}
            value={category}
            options={categoryOptions}
            onChange={(e) => onCategoryChange(e.target.value)}
          />
        )}
      </Field>

      <Field id="quote-amount" label={`Quote Amount (${currency})`} required>
        {(props) => (
          <Input
            {...props}
            value={amountMajor}
            placeholder="e.g. 50000"
            onChange={(e) => onAmountChange(e.target.value)}
          />
        )}
      </Field>

      <Field id="quote-status" label="Status" required>
        {(props) => (
          <Select
            {...props}
            value={status}
            options={statusOptions}
            onChange={(e) => onStatusChange(e.target.value as QuoteStatus)}
          />
        )}
      </Field>

      <Field id="quote-notes" label="Notes & Inclusions">
        {(props) => (
          <Textarea
            {...props}
            value={notes}
            placeholder="Scope of work, payment schedules, cancellation clauses"
            onChange={(e) => onNotesChange(e.target.value)}
          />
        )}
      </Field>
    </>
  );
}
