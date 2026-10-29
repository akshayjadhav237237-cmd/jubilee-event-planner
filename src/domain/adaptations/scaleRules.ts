import type { AdaptationRule } from './types';
import { createEmptyEffects } from './types';

function isTightBudget(totalBudget: number, guestCount: number, currency: string): boolean {
  if (guestCount <= 0) {
    return false;
  }
  const perHeadMinor = totalBudget / guestCount;
  const threshold = currency === 'INR' ? 25000 : 2500;
  return perHeadMinor < threshold;
}

export const ruleTightBudget: AdaptationRule = {
  id: 'rule_tight_budget',
  name: 'rule_tight_budget',
  description:
    'Favors essentials (catering and venue) and raises buffer when per-head budget is low.',
  predicate: (brief) => isTightBudget(brief.totalBudget, brief.guestCount, brief.currency),
  getEffects: () => ({
    ...createEmptyEffects(),
    contingencyDelta: 2,
    weightFactors: { catering: 1.15, venue: 1.1 },
  }),
};

export const ruleMicroEvent: AdaptationRule = {
  id: 'rule_micro_event',
  name: 'rule_micro_event',
  description: 'Favors decor and intimacy over coordinator overhead, skipping bulk transit tasks.',
  predicate: (brief) => brief.guestCount < 25,
  getEffects: () => ({
    ...createEmptyEffects(),
    weightFactors: { decor: 1.2, coordinator: 0.8 },
    skipOptionalTasks: true,
  }),
};

export const ruleLargeCrowd: AdaptationRule = {
  id: 'rule_large_crowd',
  name: 'rule_large_crowd',
  description:
    'Adds crowd control, security briefing, and capacity certification for large crowds.',
  predicate: (brief) => brief.guestCount >= 200,
  getEffects: () => ({
    ...createEmptyEffects(),
    contingencyDelta: 3,
    injectTaskIds: ['task_crowd_control_plan', 'task_security_briefing'],
    vendorCheckIds: ['check_venue_capacity_certification'],
  }),
};

export const ruleSponsorship: AdaptationRule = {
  id: 'rule_sponsorship',
  name: 'rule_sponsorship',
  description: 'Injects sponsor recognition coordination tasks for community fundraiser events.',
  predicate: (brief) => brief.eventType === 'community' && brief.subFormat === 'fundraiser',
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_sponsor_recognition_setup'],
  }),
};

export const SCALE_RULES: readonly AdaptationRule[] = [
  ruleTightBudget,
  ruleMicroEvent,
  ruleLargeCrowd,
  ruleSponsorship,
];
