import { useState, type FormEvent, type JSX } from 'react';
import type { BudgetState } from '../../domain/types';
import { Dialog, Select, Input, Field, Button, Alert } from '../../shared/ui';
import { validateTransfer } from './view';

export interface TransferModalProps {
  readonly open: boolean;
  readonly budget: BudgetState;
  readonly currency: string;
  readonly onClose: () => void;
  readonly onTransfer: (fromId: string, toId: string, amountMinor: number) => void;
}

/** Modal dialog for transferring allocated funds between categories. */
export function TransferModal({
  open,
  budget,
  currency,
  onClose,
  onTransfer,
}: TransferModalProps): JSX.Element {
  const [fromId, setFromId] = useState(budget.categories[0]?.id ?? '');
  const [toId, setToId] = useState(budget.categories[1]?.id ?? '');
  const [amountMajor, setAmountMajor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = budget.categories.map((c) => ({ value: c.id, label: c.name }));

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const result = validateTransfer(budget, { fromId, toId, amountMajor, currency });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onTransfer(result.value.fromCategoryId, result.value.toCategoryId, result.value.amount);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Transfer Category Budget">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert severity="critical" message={error} />}

        <Field id="transfer-from" label="Source Category" required>
          {(props) => (
            <Select
              {...props}
              value={fromId}
              options={categoryOptions}
              onChange={(e) => setFromId(e.target.value)}
            />
          )}
        </Field>

        <Field id="transfer-to" label="Destination Category" required>
          {(props) => (
            <Select
              {...props}
              value={toId}
              options={categoryOptions}
              onChange={(e) => setToId(e.target.value)}
            />
          )}
        </Field>

        <Field id="transfer-amount" label={`Amount (${currency})`} required>
          {(props) => (
            <Input
              {...props}
              value={amountMajor}
              placeholder="e.g. 5000"
              onChange={(e) => setAmountMajor(e.target.value)}
            />
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm Transfer
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
