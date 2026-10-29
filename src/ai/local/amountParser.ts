export type ParsedAmount = {
  readonly amountMinor: number;
  readonly isPercent: boolean;
  readonly percentValue?: number | undefined;
};

const MULTIPLIERS: Readonly<Record<string, number>> = {
  k: 1_000,
  l: 100_000,
  lakh: 100_000,
  lakhs: 100_000,
  lac: 100_000,
  lacs: 100_000,
  m: 1_000_000,
  million: 1_000_000,
  cr: 10_000_000,
  crore: 10_000_000,
  crores: 10_000_000,
};

function cleanCurrencySymbols(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[$€£₹]\s*/, '')
    .replace(/\s*[$€£₹]$/, '')
    .replace(/\b(usd|eur|gbp|inr|rs\.?)\b/g, '')
    .trim();
}

function resolveMultiplier(suffix: string): number {
  const norm = suffix.toLowerCase().trim();
  if (norm.length === 0) return 1;
  return MULTIPLIERS[norm] ?? 1;
}

function parsePercentAmount(cleaned: string): ParsedAmount | null {
  const match = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*(?:%|percent)$/i);
  if (!match) return null;
  const rawVal = match[1];
  if (rawVal === undefined) return null;
  const val = Number(rawVal);
  if (!Number.isFinite(val) || val <= 0) return null;
  return { amountMinor: 0, isPercent: true, percentValue: val };
}

function parseNumericAmount(cleaned: string): ParsedAmount | null {
  const sanitized = cleaned.replace(/,/g, '');
  const match = sanitized.match(
    /^([0-9]+(?:\.[0-9]+)?)\s*(k|lakhs?|lacs?|l|m|million|cr|crores?)?$/i,
  );
  if (!match) return null;

  const numPart = match[1];
  if (numPart === undefined) return null;
  const baseNum = Number(numPart);
  if (!Number.isFinite(baseNum) || baseNum <= 0) return null;

  const suffix = match[2] ?? '';
  const multiplier = resolveMultiplier(suffix);
  const major = baseNum * multiplier;
  const amountMinor = Math.round(major * 100);

  if (amountMinor <= 0 || !Number.isSafeInteger(amountMinor)) return null;
  return { amountMinor, isPercent: false };
}

/** Parses numeric, percentage, and suffixed currency expressions into minor units. */
export function parseAmount(text: string, currency = 'USD'): ParsedAmount | null {
  const cleaned = cleanCurrencySymbols(text);
  if (cleaned.length === 0) return null;

  const pct = parsePercentAmount(cleaned);
  if (pct) return pct;

  const num = parseNumericAmount(cleaned);
  if (!num || currency.length === 0) return null;
  return num;
}

/** Extracts the first currency amount or percentage from freeform text. */
export function extractAmount(text: string, currency = 'USD'): ParsedAmount | null {
  const percentMatch = text.match(/\b([0-9]+(?:\.[0-9]+)?)\s*(?:%|percent)\b/i);
  if (percentMatch) {
    const matched = percentMatch[0];
    if (matched !== undefined) return parseAmount(matched, currency);
  }

  const tokenPattern =
    /(?:[$€£₹]\s*)?[0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?\s*(?:k|lakhs?|lacs?|l|m|million|cr|crores?)?(?:\s*[$€£₹])?/gi;
  const tokens = text.match(tokenPattern);
  if (!tokens) return null;

  for (const token of tokens) {
    const res = parseAmount(token, currency);
    if (res) return res;
  }
  return null;
}
