import { getVendorGuide } from '../../data/vendors';
import { formatMoney, parseMoney } from '../../domain/money';
import { err, ok, type Result } from '../../domain/result';
import type {
  BudgetState,
  ChecklistItem,
  EventBrief,
  QuoteStatus,
  VendorQuote,
} from '../../domain/types';
import type { VendorGuide } from '../../domain/vendors/types';

export interface VendorCategorySectionView {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly allocatedFormatted: string;
  readonly committedFormatted: string;
  readonly varianceFormatted: string;
  readonly isOverAllocated: boolean;
  readonly guide: VendorGuide | undefined;
  readonly quotes: readonly VendorQuote[];
  readonly checklist: readonly ChecklistItem[];
}

export interface NewQuoteParams {
  readonly vendorName: string;
  readonly category: string;
  readonly amountMajor: string;
  readonly currency: string;
  readonly status: QuoteStatus;
  readonly notes: string;
  readonly id: string;
}

/** Prepares structured category-level view models combining guides, quotes, and checklists. */
export function computeVendorSections(
  brief: EventBrief,
  budget: BudgetState,
  quotes: readonly VendorQuote[],
  checklist: readonly ChecklistItem[],
): readonly VendorCategorySectionView[] {
  return budget.categories.map((cat) => {
    const guide = getVendorGuide(brief.eventType, cat.id);
    const catQuotes = quotes.filter((q) => q.category === cat.id);
    const catChecklist = checklist.filter((item) => item.category === cat.id);

    const acceptedQuotes = catQuotes.filter((q) => q.status === 'accepted');
    const committed =
      acceptedQuotes.length > 0
        ? acceptedQuotes.reduce((acc, q) => acc + q.amount, 0)
        : catQuotes.filter((q) => q.status === 'shortlisted').reduce((acc, q) => acc + q.amount, 0);

    const variance = cat.allocated - committed;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      allocatedFormatted: formatMoney(cat.allocated, brief.currency),
      committedFormatted: formatMoney(committed, brief.currency),
      varianceFormatted: formatMoney(Math.abs(variance), brief.currency),
      isOverAllocated: committed > cat.allocated,
      guide,
      quotes: catQuotes,
      checklist: catChecklist,
    };
  });
}

/** Validates user input and creates a structured VendorQuote domain object. */
export function validateNewQuote(params: NewQuoteParams): Result<VendorQuote, string> {
  const trimmedName = params.vendorName.trim();
  if (trimmedName.length === 0) {
    return err('Vendor name cannot be empty');
  }
  const parsedMoney = parseMoney(params.amountMajor, params.currency);
  if (!parsedMoney.ok || parsedMoney.value <= 0) {
    return err('Quote amount must be a positive number');
  }

  return ok({
    id: params.id,
    vendorName: trimmedName,
    category: params.category,
    amount: parsedMoney.value,
    status: params.status,
    notes: params.notes.trim(),
  });
}
