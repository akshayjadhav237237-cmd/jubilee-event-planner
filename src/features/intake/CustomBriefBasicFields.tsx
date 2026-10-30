import type { ChangeEvent, JSX } from 'react';
import type { EventType } from '../../domain/types';
import { Field, Input, Select } from '../../shared/ui';
import type { IntakeFormState } from './view';

export interface CustomBriefBasicFieldsProps {
  readonly form: IntakeFormState;
  readonly subFormats: readonly string[];
  readonly onChangeForm: (next: IntakeFormState) => void;
  readonly onEventTypeChange: (type: EventType) => void;
}

/** Basic event definition inputs: title, type, format, and expected guest count. */
export function CustomBriefBasicFields({
  form,
  subFormats,
  onChangeForm,
  onEventTypeChange,
}: CustomBriefBasicFieldsProps): JSX.Element {
  return (
    <>
      <Field id="field-title" label="Celebration Title" required>
        {(props) => (
          <Input
            {...props}
            value={form.title}
            placeholder="e.g. Maya's Graduation Gala"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChangeForm({ ...form, title: e.target.value })
            }
          />
        )}
      </Field>

      <Field id="field-type" label="Event Type" required>
        {(props) => (
          <Select
            {...props}
            value={form.eventType}
            options={[
              { value: 'wedding', label: 'Wedding' },
              { value: 'birthday', label: 'Birthday' },
              { value: 'community', label: 'Community' },
            ]}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onEventTypeChange(e.target.value as EventType)
            }
          />
        )}
      </Field>

      <Field id="field-format" label="Format Style" required>
        {(props) => (
          <Select
            {...props}
            value={form.subFormat}
            options={subFormats.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChangeForm({ ...form, subFormat: e.target.value })
            }
          />
        )}
      </Field>

      <Field id="field-guests" label="Expected Guests" required>
        {(props) => (
          <Input
            {...props}
            type="number"
            min={1}
            value={form.guestCount.toString()}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChangeForm({ ...form, guestCount: Math.max(1, Number(e.target.value)) })
            }
          />
        )}
      </Field>
    </>
  );
}
