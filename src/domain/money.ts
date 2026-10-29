export type Minor = number & { readonly __brand?: 'Minor' };

export type MoneyParseResult =
  { readonly ok: true; readonly value: number } | { readonly ok: false; readonly error: string };

type RemainderItem = {
  readonly index: number;
  readonly remainder: number;
};

/** Distributes a total amount in integer minor units across weights using the Hare-Niemeyer method. */
export function allocateLargestRemainder(
  total: number,
  weights: readonly number[],
): readonly number[] {
  if (weights.length === 0) {
    return [];
  }
  if (total <= 0) {
    return weights.map(() => 0);
  }

  const sanitized = weights.map((w) => (w > 0 ? w : 0));
  const sanitizedSum = sanitized.reduce((acc, w) => acc + w, 0);
  const effectiveWeights = sanitizedSum <= 0 ? weights.map(() => 1) : sanitized;
  const totalWeight = effectiveWeights.reduce((acc, w) => acc + w, 0);

  const floors: number[] = [];
  const remainders: RemainderItem[] = [];

  for (let i = 0; i < effectiveWeights.length; i += 1) {
    const w = effectiveWeights[i] ?? 0;
    const exact = (w * total) / totalWeight;
    const floorVal = Math.floor(exact);
    floors.push(floorVal);
    remainders.push({ index: i, remainder: exact - floorVal });
  }

  const allocatedSum = floors.reduce((acc, v) => acc + v, 0);
  const diff = total - allocatedSum;

  remainders.sort((a, b) => {
    const remDiff = b.remainder - a.remainder;
    if (Math.abs(remDiff) > 1e-9) {
      return remDiff;
    }
    return a.index - b.index;
  });

  const result = [...floors];
  for (let i = 0; i < diff && i < remainders.length; i += 1) {
    const item = remainders[i];
    if (item !== undefined) {
      result[item.index] = (result[item.index] ?? 0) + 1;
    }
  }

  return result;
}

/** Formats integer minor units into a localized currency string. */
export function formatMoney(minor: number, currency: string, locale = 'en-US'): string {
  const major = minor / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

/** Parses a decimal currency string into integer minor units without floating-point inaccuracies. */
export function parseMoney(input: string, currency = 'USD'): MoneyParseResult {
  if (typeof input !== 'string' || typeof currency !== 'string' || currency.length === 0) {
    return { ok: false, error: 'Input must be a string' };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Input cannot be empty' };
  }
  const cleaned = trimmed.replace(/^[$€£₹]\s*/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return { ok: false, error: 'Invalid numeric money format' };
  }
  const parts = cleaned.split('.');
  const wholePart = Number(parts[0]);
  if (!Number.isSafeInteger(wholePart) || wholePart < 0) {
    return { ok: false, error: 'Amount is out of safe range or negative' };
  }
  const fractionStr = parts[1] ?? '0';
  const paddedFraction = (fractionStr + '00').slice(0, 2);
  const fractionPart = Number(paddedFraction);
  const minor = wholePart * 100 + fractionPart;
  return { ok: true, value: minor };
}
