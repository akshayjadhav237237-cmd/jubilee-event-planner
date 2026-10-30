import { useState, type FormEvent, type JSX } from 'react';
import type { EventBrief, EventType } from '../../domain/types';
import type { IsoDate } from '../../domain/dates';
import { Button, Alert } from '../../shared/ui';
import {
  fromFormState,
  getAvailablePriorities,
  getPastDateReasons,
  getSubFormatOptions,
  type IntakeFormState,
} from './view';
import { IntakeFlagsAndPriorities } from './IntakeFlagsAndPriorities';
import { CustomBriefBasicFields } from './CustomBriefBasicFields';
import { CustomBriefLogisticsFields } from './CustomBriefLogisticsFields';

export interface CustomBriefFormProps {
  readonly today: IsoDate;
  readonly onSubmit: (brief: EventBrief) => void;
}

const INITIAL_FORM: IntakeFormState = {
  title: '',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 100,
  budgetMajor: '500000',
  currency: 'INR',
  eventDate: '2027-10-15',
  setting: 'indoor',
  flags: {
    kids: false,
    elders: false,
    dietary: false,
    accessibility: false,
    openBar: false,
    amplifiedMusic: false,
    surprise: false,
  },
  top3Priorities: ['Catering & Beverages', 'Venue & Facilities', 'Decor & Floral'],
};

/** Form component for creating a tailored celebration plan from scratch. */
export function CustomBriefForm({ today, onSubmit }: CustomBriefFormProps): JSX.Element {
  const [form, setForm] = useState<IntakeFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<readonly string[]>([]);

  const subFormats = getSubFormatOptions(form.eventType);
  const priorities = getAvailablePriorities(form.eventType);
  const pastReasons = getPastDateReasons(form.eventDate, today);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const result = fromFormState(form);
    if (!result.ok) {
      setErrors(result.error);
      return;
    }
    setErrors([]);
    onSubmit(result.value);
  };

  const handleEventTypeChange = (nextType: EventType): void => {
    const nextSub = getSubFormatOptions(nextType)[0] ?? 'standard';
    setForm({ ...form, eventType: nextType, subFormat: nextSub, top3Priorities: [] });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-stone-200"
    >
      <h2 className="text-xl font-serif font-bold text-ink-text">Create a Custom Plan</h2>

      {errors.length > 0 && (
        <Alert severity="critical" title="Validation Errors" message={errors.join('; ')} />
      )}

      {pastReasons.length > 0 && (
        <Alert
          severity="warn"
          title="Past Date Adaptation Triggered"
          message={pastReasons.join(', ')}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomBriefBasicFields
          form={form}
          subFormats={subFormats}
          onChangeForm={setForm}
          onEventTypeChange={handleEventTypeChange}
        />
        <CustomBriefLogisticsFields form={form} onChangeForm={setForm} />
      </div>

      <IntakeFlagsAndPriorities
        flags={form.flags}
        onChangeFlags={(flags) => setForm({ ...form, flags })}
        availablePriorities={priorities}
        top3Priorities={form.top3Priorities}
        onChangePriorities={(top3Priorities) => setForm({ ...form, top3Priorities })}
      />

      <div className="pt-4 border-t border-stone-200">
        <Button variant="primary" type="submit">
          Generate Celebration Plan
        </Button>
      </div>
    </form>
  );
}
