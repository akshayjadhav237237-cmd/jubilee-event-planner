import { useState, type FormEvent, type JSX } from 'react';
import type { BudgetState } from '../../domain/types';
import { Dialog, Select, Input, Field, Button, Alert } from '../../shared/ui';
import { validateSpend } from './view';

export interface SpendModalProps {
  readonly open: boolean;
  readonly budget: BudgetState;
  readonly currency: string;
  readonly onClose: () => void;
  readonly onLogSpend: (categoryId: string, amountMinor: number) => void;
}

/** Modal dialog for recording actual expenses against a budget category. */
export function SpendModal({
  open,
  budget,
  currency,
  onClose,
  onLogSpend,
}: SpendModalProps): JSX.Element {
  const [categoryId, setCategoryId] = useState(budget.categories[0]?.id ?? '');
  const [amountMajor, setAmountMajor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = budget.categories.map((c) => ({ value: c.id, label: c.name }));

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const result = validateSpend(budget, categoryId, amountMajor, currency);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onLogSpend(result.value.categoryId, result.value.amount);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Log Actual Spend">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert severity="critical" message={error} />}

        <Field id="spend-cat" label="Category" required>
          {(props) => (
            <Select
              {...props}
              value={categoryId}
              options={categoryOptions}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          )}
        </Field>

        <Field id="spend-amount" label={`Spend Amount (${currency})`} required>
          {(props) => (
            <Input
              {...props}
              value={amountMajor}
              placeholder="e.g. 15000"
              onChange={(e) => setAmountMajor(e.target.value)}
            />
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Record Spend
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
