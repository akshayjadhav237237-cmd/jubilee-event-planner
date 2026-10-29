import { describe, it, expect } from 'vitest';
import {
  addDays,
  daysBetween,
  isPast,
  parseIsoDate,
  startOfTodayUtc,
  type IsoDate,
} from '../../src/domain/dates';

describe('ISO Date utilities', () => {
  it('parses valid calendar dates including leap years', () => {
    const leap = parseIsoDate('2024-02-29');
    expect(leap.ok).toBe(true);
    if (leap.ok) {
      expect(leap.value).toBe('2024-02-29');
    }

    const regular = parseIsoDate('2026-06-15');
    expect(regular.ok).toBe(true);

    const yearEnd = parseIsoDate('2026-12-31');
    expect(yearEnd.ok).toBe(true);
  });

  it('rejects invalid February dates and non-leap years', () => {
    const nonLeapFeb = parseIsoDate('2026-02-29');
    expect(nonLeapFeb.ok).toBe(false);

    const leapFeb30 = parseIsoDate('2024-02-30');
    expect(leapFeb30.ok).toBe(false);
  });

  it('rejects invalid month numbers and day counts', () => {
    expect(parseIsoDate('2026-00-10').ok).toBe(false);
    expect(parseIsoDate('2026-13-10').ok).toBe(false);
    expect(parseIsoDate('2026-04-31').ok).toBe(false);
    expect(parseIsoDate('2026-01-32').ok).toBe(false);
    expect(parseIsoDate('2026-01-00').ok).toBe(false);
    expect(parseIsoDate('999-01-01').ok).toBe(false);
    expect(parseIsoDate('10000-01-01').ok).toBe(false);
  });

  it('rejects malformed date strings or non-string inputs', () => {
    expect(parseIsoDate('not-a-date').ok).toBe(false);
    expect(parseIsoDate('2026/01/01').ok).toBe(false);
    expect(parseIsoDate('').ok).toBe(false);
    expect(parseIsoDate(123 as unknown as string).ok).toBe(false);
  });

  it('adds positive and negative days across month boundaries', () => {
    const base = '2026-01-30' as IsoDate;
    expect(addDays(base, 3)).toBe('2026-02-02');

    const march1NonLeap = '2026-03-01' as IsoDate;
    expect(addDays(march1NonLeap, -1)).toBe('2026-02-28');

    const march1Leap = '2024-03-01' as IsoDate;
    expect(addDays(march1Leap, -1)).toBe('2024-02-29');

    expect(addDays(base, 0)).toBe('2026-01-30');
  });

  it('computes daysBetween two dates correctly', () => {
    const d1 = '2026-06-01' as IsoDate;
    const d2 = '2026-06-10' as IsoDate;

    expect(daysBetween(d1, d2)).toBe(9);
    expect(daysBetween(d2, d1)).toBe(-9);
    expect(daysBetween(d1, d1)).toBe(0);

    const leapStart = '2024-02-28' as IsoDate;
    const leapEnd = '2024-03-01' as IsoDate;
    expect(daysBetween(leapStart, leapEnd)).toBe(2);
  });

  it('checks if a date is in the past relative to reference date', () => {
    const today = '2026-06-15' as IsoDate;
    const yesterday = '2026-06-14' as IsoDate;
    const tomorrow = '2026-06-16' as IsoDate;

    expect(isPast(yesterday, today)).toBe(true);
    expect(isPast(today, today)).toBe(false);
    expect(isPast(tomorrow, today)).toBe(false);
  });

  it('returns today as UTC IsoDate with mock or default clock', () => {
    const mockClock = (): Date => new Date(Date.UTC(2026, 9, 29, 12, 0, 0));
    expect(startOfTodayUtc(mockClock)).toBe('2026-10-29');

    const todayStr = startOfTodayUtc();
    expect(/^\d{4}-\d{2}-\d{2}$/.test(todayStr)).toBe(true);
  });
});
