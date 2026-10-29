import type { EventBrief, Plan } from '../domain/types';
import type { ClockPort, IdPort } from '../domain/ports';
import { startOfTodayUtc } from '../domain/dates';
import { evaluateAdaptations, aggregateEffects } from '../domain/adaptations';
import { buildBudget } from '../domain/budget';
import { buildTasks } from '../domain/timeline';
import { buildVendorState } from '../domain/vendors';
import { selectIdeas } from '../domain/ideas';

export type BuildPlanDependencies = {
  readonly clock: ClockPort;
  readonly ids: IdPort;
};

/** Builds a complete event plan by composing budget, timeline, vendors, and ideas domain engines. */
export function buildPlan(brief: EventBrief, deps: BuildPlanDependencies): Plan {
  const today = startOfTodayUtc(deps.clock);
  const adaptations = evaluateAdaptations(brief, today);
  const effects = aggregateEffects(adaptations);
  const budget = buildBudget(brief, effects);
  const timeline = buildTasks(brief, effects, today);
  const vendorState = buildVendorState(brief, budget, effects);
  const ideas = selectIdeas(brief);
  const id = deps.ids();

  return {
    id,
    brief,
    budget,
    timeline,
    vendorChecklist: vendorState.checklist,
    quotes: vendorState.quotes,
    ideas,
    createdAt: today,
    updatedAt: today,
  };
}
