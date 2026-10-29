export type IsoDate = string & { readonly __brand?: 'IsoDate' };

export type DateParseResult =
  { readonly ok: true; readonly value: IsoDate } | { readonly ok: false; readonly error: string };

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) {
    return 30;
  }
  return 31;
}

function formatUtcIso(d: Date): IsoDate {
  const y = String(d.getUTCFullYear()).padStart(4, '0');
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}` as IsoDate;
}

function validateDateRanges(year: number, month: number, day: number): string | null {
  if (year < 1000 || year > 9999) {
    return 'Year must be between 1000 and 9999';
  }
  if (month < 1 || month > 12) {
    return 'Month must be between 01 and 12';
  }
  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    return `Day must be between 01 and ${String(maxDays)}`;
  }
  return null;
}

/** Parses and validates an ISO 8601 date string in YYYY-MM-DD format. */
export function parseIsoDate(input: string): DateParseResult {
  if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return { ok: false, error: 'Invalid date format, expected YYYY-MM-DD' };
  }
  const parts = input.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);

  const rangeError = validateDateRanges(y, m, d);
  if (rangeError !== null) {
    return { ok: false, error: rangeError };
  }
  return { ok: true, value: input as IsoDate };
}

/** Adds or subtracts days to an IsoDate using pure UTC calculation. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const parts = date.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const utcMs = Date.UTC(y, m - 1, d);
  const targetMs = utcMs + days * 86_400_000;
  return formatUtcIso(new Date(targetMs));
}

/** Calculates the number of whole UTC days between two IsoDates. */
export function daysBetween(start: IsoDate, end: IsoDate): number {
  const startParts = start.split('-');
  const endParts = end.split('-');
  const startMs = Date.UTC(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));
  const endMs = Date.UTC(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));
  return Math.round((endMs - startMs) / 86_400_000);
}

/** Determines whether a target IsoDate falls strictly before a reference date. */
export function isPast(date: IsoDate, today: IsoDate): boolean {
  return date < today;
}

/** Returns the current calendar date in UTC as an IsoDate. */
export function startOfTodayUtc(clock: () => Date = () => new Date()): IsoDate {
  return formatUtcIso(clock());
}
