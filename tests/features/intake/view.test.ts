import { describe, expect, it } from 'vitest';
import type { EventBrief } from '../../../src/domain/types';
import type { IsoDate } from '../../../src/domain/dates';
import {
  fromFormState,
  getAvailablePriorities,
  getPastDateReasons,
  getSubFormatOptions,
  toFormState,
  type IntakeFormState,
} from '../../../src/features/intake/view';

const SAMPLE_BRIEF: EventBrief = {
  title: 'Sample Wedding',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 100,
  totalBudget: 5000000,
  currency: 'INR',
  eventDate: '2027-05-10' as IsoDate,
  setting: 'hybrid',
  flags: {
    kids: true,
    elders: false,
    dietary: true,
    accessibility: false,
    openBar: true,
    amplifiedMusic: false,
    surprise: false,
  },
  top3Priorities: ['Venue & Facilities', 'Catering & Beverages', 'Photography & Videography'],
};

describe('Intake view model', () => {
  it('returns appropriate sub-formats and priorities per event type', () => {
    expect(getSubFormatOptions('wedding')).toContain('traditional');
    expect(getSubFormatOptions('birthday')).toContain('kids_party');
    expect(getSubFormatOptions('community')).toContain('cultural_festival');

    const priorities = getAvailablePriorities('wedding');
    expect(priorities.length).toBeGreaterThan(0);
    expect(priorities).toContain('Venue & Facilities');
  });

  it('converts EventBrief to form state and back', () => {
    const form = toFormState(SAMPLE_BRIEF);
    expect(form.title).toBe('Sample Wedding');
    expect(form.budgetMajor).toBe('50000');

    const result = fromFormState(form);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalBudget).toBe(5000000);
      expect(result.value.top3Priorities).toEqual(SAMPLE_BRIEF.top3Priorities);
    }
  });

  it('rejects invalid budget strings', () => {
    const form: IntakeFormState = {
      ...toFormState(SAMPLE_BRIEF),
      budgetMajor: 'invalid-number',
    };
    const result = fromFormState(form);
    expect(result.ok).toBe(false);
  });

  it('rejects invalid priority counts', () => {
    const form: IntakeFormState = {
      ...toFormState(SAMPLE_BRIEF),
      top3Priorities: ['Only One'],
    };
    const result = fromFormState(form);
    expect(result.ok).toBe(false);
  });

  it('rejects empty priority items', () => {
    const form: IntakeFormState = {
      ...toFormState(SAMPLE_BRIEF),
      top3Priorities: ['One', '', 'Three'],
    };
    const result = fromFormState(form);
    expect(result.ok).toBe(false);
  });

  it('rejects invalid schema values such as non-positive guest count', () => {
    const form: IntakeFormState = {
      ...toFormState(SAMPLE_BRIEF),
      guestCount: 0,
    };
    const result = fromFormState(form);
    expect(result.ok).toBe(false);
  });

  it('detects past dates and extracts adaptation reasons', () => {
    const today = '2026-10-30' as IsoDate;
    const pastReasons = getPastDateReasons('2025-01-01', today);
    expect(pastReasons.length).toBeGreaterThan(0);

    const futureReasons = getPastDateReasons('2027-01-01', today);
    expect(futureReasons.length).toBe(0);
  });
});
