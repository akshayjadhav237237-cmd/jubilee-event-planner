import type { AdaptationEffects } from '../adaptationTypes';
import type { BudgetState, ChecklistItem, EventBrief } from '../types';
import { findConditionalCheck } from './conditionalChecks';
import { resolveVendorGuides } from './guidesProvider';
import type { VendorGuide, VendorState } from './types';

export { addQuote, removeQuote, toggleChecklistItem } from './stateActions';
export { summarizeQuotes } from './quoteMath';

type InjectedChecks = {
  readonly questions: ReadonlyMap<string, readonly string[]>;
  readonly redFlags: ReadonlyMap<string, readonly string[]>;
};

function collectInjectedChecks(checkIds?: readonly string[]): InjectedChecks {
  const qMap = new Map<string, string[]>();
  const rfMap = new Map<string, string[]>();
  if (checkIds === undefined) {
    return { questions: qMap, redFlags: rfMap };
  }
  for (const id of checkIds) {
    const check = findConditionalCheck(id);
    if (check !== undefined) {
      const qExisting = qMap.get(check.categoryId) ?? [];
      qMap.set(check.categoryId, [...qExisting, ...check.questions]);
      const rfExisting = rfMap.get(check.categoryId) ?? [];
      rfMap.set(check.categoryId, [...rfExisting, ...check.redFlags]);
    }
  }
  return { questions: qMap, redFlags: rfMap };
}

function dedupeStrings(base: readonly string[], extra?: readonly string[]): readonly string[] {
  const combined = extra !== undefined ? [...base, ...extra] : base;
  return Array.from(new Set(combined));
}

function createFallbackGuides(brief: EventBrief, budget: BudgetState): readonly VendorGuide[] {
  return budget.categories.map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    eventType: brief.eventType,
    questions: [`What is your standard scope of service for ${c.name}?`],
    redFlags: [`Missing contract or insurance for ${c.name}`],
    contractChecks: [`Payment milestones for ${c.name} clearly defined`],
  }));
}

/** Constructs the initial vendor state with guides, conditional checklist items, and quotes. */
export function buildVendorState(
  brief: EventBrief,
  budget: BudgetState,
  effects?: AdaptationEffects,
  guides?: readonly VendorGuide[],
): VendorState {
  const resolved = resolveVendorGuides(brief.eventType, guides);
  const activeGuides = resolved.length > 0 ? resolved : createFallbackGuides(brief, budget);
  const injected = collectInjectedChecks(effects?.vendorCheckIds);

  const checklist: ChecklistItem[] = activeGuides.map((guide) => ({
    id: `chk-${guide.categoryId}`,
    title: `${guide.categoryName} Checklist`,
    completed: false,
    category: guide.categoryId,
    questions: dedupeStrings(guide.questions, injected.questions.get(guide.categoryId)),
    redFlags: dedupeStrings(guide.redFlags, injected.redFlags.get(guide.categoryId)),
  }));

  for (const cat of budget.categories) {
    if (!activeGuides.some((g) => g.categoryId === cat.id)) {
      checklist.push({
        id: `chk-${cat.id}`,
        title: `${cat.name} Checklist`,
        completed: false,
        category: cat.id,
        questions: dedupeStrings([], injected.questions.get(cat.id)),
        redFlags: dedupeStrings([], injected.redFlags.get(cat.id)),
      });
    }
  }

  return { guides: activeGuides, checklist, quotes: [] };
}
