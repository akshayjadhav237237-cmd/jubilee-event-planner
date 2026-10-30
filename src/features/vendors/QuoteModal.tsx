import { useState, type FormEvent, type JSX } from 'react';
import type { BudgetState, QuoteStatus, VendorQuote } from '../../domain/types';
import { Dialog, Button, Alert } from '../../shared/ui';
import { validateNewQuote } from './view';
import { QuoteModalFields } from './QuoteModalFields';

export interface QuoteModalProps {
  readonly open: boolean;
  readonly budget: BudgetState;
  readonly currency: string;
  readonly onClose: () => void;
  readonly onAddQuote: (quote: VendorQuote) => void;
}

const STATUS_OPTIONS: readonly { readonly value: QuoteStatus; readonly label: string }[] = [
  { value: 'draft', label: 'Draft / Inquiry' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted / Booked' },
  { value: 'declined', label: 'Declined' },
];

/** Dialog modal for logging and evaluating vendor estimates against category allocations. */
export function QuoteModal({
  open,
  budget,
  currency,
  onClose,
  onAddQuote,
}: QuoteModalProps): JSX.Element {
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState(budget.categories[0]?.id ?? '');
  const [amountMajor, setAmountMajor] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('shortlisted');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = budget.categories.map((c) => ({ value: c.id, label: c.name }));

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const id = `quote-${String(Date.now())}`;
    const result = validateNewQuote({
      vendorName,
      category,
      amountMajor,
      currency,
      status,
      notes,
      id,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onAddQuote(result.value);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Vendor Quote">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert severity="critical" message={error} />}

        <QuoteModalFields
          vendorName={vendorName}
          category={category}
          amountMajor={amountMajor}
          currency={currency}
          status={status}
          notes={notes}
          categoryOptions={categoryOptions}
          statusOptions={STATUS_OPTIONS}
          onVendorNameChange={setVendorName}
          onCategoryChange={setCategory}
          onAmountChange={setAmountMajor}
          onStatusChange={setStatus}
          onNotesChange={setNotes}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Quote
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
