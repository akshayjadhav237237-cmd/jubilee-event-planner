import { FEATURE_RULES } from './featureRules';
import { SCALE_RULES } from './scaleRules';
import { TIMELINE_RULES } from './timelineRules';
import type { AdaptationRule } from './types';

/** Comprehensive catalog of all adaptation rules combining timeline, scale, and feature rules. */
export const ALL_ADAPTATION_RULES: readonly AdaptationRule[] = [
  ...TIMELINE_RULES,
  ...SCALE_RULES,
  ...FEATURE_RULES,
];

/** Finds a registered adaptation rule by its unique identifier or rule name. */
export function findAdaptationRule(ruleName: string): AdaptationRule | undefined {
  return ALL_ADAPTATION_RULES.find((rule) => rule.name === ruleName || rule.id === ruleName);
}
