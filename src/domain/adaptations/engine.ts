import type { Adaptation, AdaptationEffects } from '../adaptationTypes';
import type { Alert } from '../alerts';
import type { IsoDate } from '../dates';
import type { EventBrief } from '../types';
import { generateAdaptationReason } from './reason';
import { ALL_ADAPTATION_RULES } from './rules';

function combineWeightFactors(list: readonly Adaptation[]): Partial<Record<string, number>> {
  const combined: Record<string, number> = {};
  for (const item of list) {
    for (const [key, factor] of Object.entries(item.effects.weightFactors)) {
      if (factor !== undefined) {
        const current = combined[key] ?? 1.0;
        const next = current * factor;
        combined[key] = Math.round(next * 10000) / 10000;
      }
    }
  }
  return combined;
}

function deduplicateStrings(groups: readonly (readonly string[])[]): readonly string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (!seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    }
  }
  return result;
}

function deduplicateAlerts(groups: readonly (readonly Alert[])[]): readonly Alert[] {
  const seen = new Set<string>();
  const result: Alert[] = [];
  for (const group of groups) {
    for (const alert of group) {
      const key = `${alert.code}:${alert.severity}:${alert.message}:${alert.categoryId ?? ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(alert);
      }
    }
  }
  return result;
}

/** Evaluates all domain adaptation rules against an event brief and returns active adaptations. */
export function evaluateAdaptations(brief: EventBrief, today: IsoDate): readonly Adaptation[] {
  const matched: Adaptation[] = [];

  for (const rule of ALL_ADAPTATION_RULES) {
    if (rule.predicate(brief, today)) {
      const effects = rule.getEffects(brief, today);
      const reason = generateAdaptationReason(rule.name, effects);
      matched.push({
        id: `adapt_${rule.name}`,
        ruleName: rule.name,
        reason,
        effects,
      });
    }
  }

  return matched;
}

/** Aggregates a list of triggered adaptations into a unified composite effects object. */
export function aggregateEffects(list: readonly Adaptation[]): AdaptationEffects {
  const contingencyDelta = list.reduce((acc, a) => acc + a.effects.contingencyDelta, 0);
  const weightFactors = combineWeightFactors(list);
  const injectTaskIds = deduplicateStrings(list.map((a) => a.effects.injectTaskIds));
  const vendorCheckIds = deduplicateStrings(list.map((a) => a.effects.vendorCheckIds));
  const alerts = deduplicateAlerts(list.map((a) => a.effects.alerts));
  const skipOptionalTasks = list.some((a) => a.effects.skipOptionalTasks);
  const compressTimeline = list.some((a) => a.effects.compressTimeline);

  return {
    contingencyDelta,
    weightFactors,
    injectTaskIds,
    vendorCheckIds,
    alerts,
    skipOptionalTasks,
    compressTimeline,
  };
}
