import type { AdaptationRule } from './types';
import { createEmptyEffects } from './types';

export const ruleYoungKids: AdaptationRule = {
  id: 'rule_young_kids',
  name: 'rule_young_kids',
  description: 'Injects child entertainment and child-safety vendor requirements.',
  predicate: (brief) => brief.flags.kids === true,
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_kid_friendly_entertainment'],
    vendorCheckIds: ['check_child_safety_measures'],
  }),
};

export const ruleSchoolKids: AdaptationRule = {
  id: 'rule_school_kids',
  name: 'rule_school_kids',
  description: 'Injects activity rotation stations for kids party birthdays.',
  predicate: (brief) => brief.eventType === 'birthday' && brief.subFormat === 'kids_party',
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_activity_schedule_stations'],
  }),
};

export const ruleDietaryCultural: AdaptationRule = {
  id: 'rule_dietary_cultural',
  name: 'rule_dietary_cultural',
  description: 'Audits dietary allergens and requires cross-contamination vendor protocols.',
  predicate: (brief) => brief.flags.dietary === true,
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_dietary_allergen_matrix'],
    vendorCheckIds: ['check_cross_contamination_protocols'],
  }),
};

export const ruleAccessibility: AdaptationRule = {
  id: 'rule_accessibility',
  name: 'rule_accessibility',
  description: 'Enforces step-free route audits and accessibility restroom verifications.',
  predicate: (brief) => brief.flags.accessibility === true,
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_accessible_route_audit'],
    vendorCheckIds: ['check_step_free_access_and_restrooms'],
  }),
};

export const ruleMultiCeremony: AdaptationRule = {
  id: 'rule_multi_ceremony',
  name: 'rule_multi_ceremony',
  description:
    'Coordinates multi-ceremony schedules and elevates venue weight for traditional weddings.',
  predicate: (brief) => brief.eventType === 'wedding' && brief.subFormat === 'traditional',
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_ceremony_schedule_coordination'],
    weightFactors: { venue: 1.1 },
  }),
};

export const ruleSurpriseParty: AdaptationRule = {
  id: 'rule_surprise_party',
  name: 'rule_surprise_party',
  description: 'Stages hidden arrival protocol for surprise celebrations.',
  predicate: (brief) => brief.flags.surprise === true,
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_guest_arrival_staging_secret'],
    skipOptionalTasks: false,
  }),
};

export const ruleOpenBar: AdaptationRule = {
  id: 'rule_open_bar',
  name: 'rule_open_bar',
  description:
    'Verifies bartender liquor licensing and responsible beverage service for open bars.',
  predicate: (brief) => brief.flags.openBar === true,
  getEffects: () => ({
    ...createEmptyEffects(),
    contingencyDelta: 1,
    injectTaskIds: ['task_bartender_liquor_license_verification'],
    vendorCheckIds: ['check_responsible_beverage_service'],
  }),
};

export const ruleAmplifiedMusic: AdaptationRule = {
  id: 'rule_amplified_music',
  name: 'rule_amplified_music',
  description: 'Secures sound curfew permits and verifies decibel limit compliance.',
  predicate: (brief) => brief.flags.amplifiedMusic === true,
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_sound_curfew_permit'],
    vendorCheckIds: ['check_decibel_limit_compliance'],
  }),
};

export const ruleCommunityPublic: AdaptationRule = {
  id: 'rule_community_public',
  name: 'rule_community_public',
  description:
    'Requires municipal event permits and public liability waivers for community events.',
  predicate: (brief) => brief.eventType === 'community',
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_public_liability_waiver'],
    vendorCheckIds: ['check_municipal_event_permit'],
  }),
};

export const FEATURE_RULES: readonly AdaptationRule[] = [
  ruleYoungKids,
  ruleSchoolKids,
  ruleDietaryCultural,
  ruleAccessibility,
  ruleMultiCeremony,
  ruleSurpriseParty,
  ruleOpenBar,
  ruleAmplifiedMusic,
  ruleCommunityPublic,
];
