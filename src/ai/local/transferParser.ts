import { formatMoney } from '../../domain/money';
import type { Plan } from '../../domain/types';
import type { AssistantResult } from '../ports';
import { parseAmount } from './amountParser';
import { fuzzyMatchCategory } from './fuzzy';

function extractTransferParts(
  prompt: string,
): { amountText: string; fromText: string; toText: string } | null {
  const m1 = prompt.match(
    /\b(?:transfer|move|shift|reallocate)\b\s+(.+?)\s+from\s+(.+?)\s+to\s+(.+)$/i,
  );
  if (m1?.[1] && m1[2] && m1[3]) {
    return { amountText: m1[1].trim(), fromText: m1[2].trim(), toText: m1[3].trim() };
  }
  const m2 = prompt.match(
    /\b(?:transfer|move|shift|reallocate)\b\s+from\s+(.+?)\s+to\s+(.+?)\s+(?:amount\s+)?(.+)$/i,
  );
  if (m2?.[1] && m2[2] && m2[3]) {
    return { fromText: m2[1].trim(), toText: m2[2].trim(), amountText: m2[3].trim() };
  }
  return null;
}

function calculateTransferAmount(
  parsed: ReturnType<typeof parseAmount>,
  fromCatId: string,
  plan: Plan,
): number {
  if (!parsed) return 0;
  if (!parsed.isPercent) return parsed.amountMinor;
  const allocated = plan.budget.categories.find((c) => c.id === fromCatId)?.allocated ?? 0;
  return Math.round(allocated * ((parsed.percentValue ?? 0) / 100));
}

function validateTransferCategories(
  fromCat: { id: string; name: string } | null,
  toCat: { id: string; name: string } | null,
): AssistantResult | null {
  if (!fromCat || !toCat) {
    return {
      kind: 'clarify',
      question: 'Could not identify both categories. Please verify the category names.',
    };
  }
  return fromCat.id === toCat.id
    ? { kind: 'refuse', reason: 'Source and destination categories cannot be the same.' }
    : null;
}

function isTransferPrompt(prompt: string): boolean {
  if (/\b(?:days?|earlier|later|postpone|advance|delay)\b/i.test(prompt)) return false;
  if (/\b(?:transfer|reallocate)\b/i.test(prompt)) return true;
  return /\b(?:move|shift)\b/i.test(prompt) && /\b(?:from|to)\b/i.test(prompt);
}

/** Parses natural language budget transfer intents between categories. */
export function parseTransfer(prompt: string, plan: Plan): AssistantResult | null {
  if (!isTransferPrompt(prompt)) return null;
  if (/-\s*[0-9]+/.test(prompt)) {
    return { kind: 'refuse', reason: 'Transfer amount cannot be negative.' };
  }
  const parts = extractTransferParts(prompt);
  if (!parts) {
    return {
      kind: 'clarify',
      question: 'Please specify the amount, source, and destination categories to transfer.',
    };
  }
  const parsed = parseAmount(parts.amountText, plan.brief.currency);
  if (!parsed || (parsed.amountMinor <= 0 && !parsed.isPercent)) {
    return { kind: 'refuse', reason: 'Transfer amount must be greater than zero.' };
  }
  const fromCat = fuzzyMatchCategory(parts.fromText, plan.budget.categories);
  const toCat = fuzzyMatchCategory(parts.toText, plan.budget.categories);
  const catError = validateTransferCategories(fromCat, toCat);
  if (catError) return catError;

  const from = fromCat as { id: string; name: string };
  const to = toCat as { id: string; name: string };
  const transferMinor = calculateTransferAmount(parsed, from.id, plan);
  if (transferMinor <= 0) {
    return { kind: 'refuse', reason: 'Calculated transfer amount is zero.' };
  }
  return {
    kind: 'commands',
    commands: [
      {
        type: 'TRANSFER_BUDGET',
        fromCategoryId: from.id,
        toCategoryId: to.id,
        amount: transferMinor,
      },
    ],
    summary: `Transferred ${formatMoney(transferMinor, plan.brief.currency)} from ${from.name} to ${to.name}.`,
  };
}
