import type { ChangeEvent, JSX } from 'react';
import type { EventSetting } from '../../domain/types';
import { Field, Input, Select } from '../../shared/ui';
import type { IntakeFormState } from './view';

export interface CustomBriefLogisticsFieldsProps {
  readonly form: IntakeFormState;
  readonly onChangeForm: (next: IntakeFormState) => void;
}

/** Logistics inputs: budget, currency, celebration date, and indoor/outdoor setting. */
export function CustomBriefLogisticsFields({
  form,
  onChangeForm,
}: CustomBriefLogisticsFieldsProps): JSX.Element {
  return (
    <>
      <Field id="field-budget" label="Total Budget" required>
        {(props) => (
          <Input
            {...props}
            value={form.budgetMajor}
            placeholder="e.g. 250000"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChangeForm({ ...form, budgetMajor: e.target.value })
            }
          />
        )}
      </Field>

      <Field id="field-currency" label="Currency" required>
        {(props) => (
          <Select
            {...props}
            value={form.currency}
            options={[
              { value: 'INR', label: 'INR (₹)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'EUR', label: 'EUR (€)' },
            ]}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChangeForm({ ...form, currency: e.target.value })
            }
          />
        )}
      </Field>

      <Field id="field-date" label="Event Date" required>
        {(props) => (
          <Input
            {...props}
            type="date"
            value={form.eventDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChangeForm({ ...form, eventDate: e.target.value })
            }
          />
        )}
      </Field>

      <Field id="field-setting" label="Venue Setting" required>
        {(props) => (
          <Select
            {...props}
            value={form.setting}
            options={[
              { value: 'indoor', label: 'Indoor' },
              { value: 'outdoor', label: 'Outdoor' },
              { value: 'hybrid', label: 'Hybrid' },
            ]}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChangeForm({ ...form, setting: e.target.value as EventSetting })
            }
          />
        )}
      </Field>
    </>
  );
}
