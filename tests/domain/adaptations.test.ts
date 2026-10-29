import { describe, it, expect } from 'vitest';
import type { AdaptationEffects } from '../../src/domain/adaptationTypes';
import type { IsoDate } from '../../src/domain/dates';
import type { EventBrief } from '../../src/domain/types';
import {
  aggregateEffects,
  createEmptyEffects,
  evaluateAdaptations,
  generateAdaptationReason,
} from '../../src/domain/adaptations';

const flags = {
  kids: false,
  elders: false,
  dietary: false,
  accessibility: false,
  openBar: false,
  amplifiedMusic: false,
  surprise: false,
};

const d = (iso: string): IsoDate => iso as IsoDate;
const today = d('2026-06-01');

function brief(overrides: Partial<EventBrief> = {}): EventBrief {
  return {
    title: 'Silver Jubilee',
    eventType: 'wedding',
    subFormat: 'reception_only',
    guestCount: 50,
    totalBudget: 500000,
    currency: 'USD',
    eventDate: d('2026-10-01'),
    setting: 'indoor',
    flags,
    top3Priorities: ['Venue', 'Catering', 'Music'],
    ...overrides,
  };
}

const hasTask = (e: AdaptationEffects, id: string): boolean => e.injectTaskIds.includes(id);
const hasCheck = (e: AdaptationEffects, id: string): boolean => e.vendorCheckIds.includes(id);

type Case = readonly [string, EventBrief, (e: AdaptationEffects) => boolean];
const c = (r: string, b: EventBrief, p: (e: AdaptationEffects) => boolean): Case => [r, b, p];

describe('Adaptation Rules Engine', () => {
  const cases: readonly Case[] = [
    c(
      'rule_past_date',
      brief({ eventDate: d('2026-05-01') }),
      (e) => e.compressTimeline && e.alerts.length > 0,
    ),
    c(
      'rule_short_notice',
      brief({ eventDate: d('2026-06-15') }),
      (e) => e.compressTimeline && e.skipOptionalTasks && e.contingencyDelta === 2,
    ),
    c(
      'rule_tight_budget',
      brief({ totalBudget: 5000, guestCount: 10 }),
      (e) => e.contingencyDelta === 2 && e.weightFactors['catering'] === 1.15,
    ),
    c(
      'rule_micro_event',
      brief({ guestCount: 15 }),
      (e) => e.skipOptionalTasks && e.weightFactors['decor'] === 1.2,
    ),
    c(
      'rule_large_crowd',
      brief({ guestCount: 250 }),
      (e) => e.contingencyDelta === 3 && hasTask(e, 'task_crowd_control_plan'),
    ),
    c('rule_young_kids', brief({ flags: { ...flags, kids: true } }), (e) =>
      hasTask(e, 'task_kid_friendly_entertainment'),
    ),
    c('rule_school_kids', brief({ eventType: 'birthday', subFormat: 'kids_party' }), (e) =>
      hasTask(e, 'task_activity_schedule_stations'),
    ),
    c(
      'rule_outdoor_weather',
      brief({ setting: 'outdoor' }),
      (e) => e.contingencyDelta === 2 && hasCheck(e, 'check_weatherproofing_and_power'),
    ),
    c('rule_hot_wet_season', brief({ setting: 'hybrid', eventDate: d('2026-07-15') }), (e) =>
      hasTask(e, 'task_cooling_or_heating_provisions'),
    ),
    c('rule_dietary_cultural', brief({ flags: { ...flags, dietary: true } }), (e) =>
      hasTask(e, 'task_dietary_allergen_matrix'),
    ),
    c('rule_accessibility', brief({ flags: { ...flags, accessibility: true } }), (e) =>
      hasCheck(e, 'check_step_free_access_and_restrooms'),
    ),
    c(
      'rule_multi_ceremony',
      brief({ eventType: 'wedding', subFormat: 'traditional' }),
      (e) => e.weightFactors['venue'] === 1.1 && hasTask(e, 'task_ceremony_schedule_coordination'),
    ),
    c('rule_surprise_party', brief({ flags: { ...flags, surprise: true } }), (e) =>
      hasTask(e, 'task_guest_arrival_staging_secret'),
    ),
    c(
      'rule_open_bar',
      brief({ flags: { ...flags, openBar: true } }),
      (e) => e.contingencyDelta === 1 && hasCheck(e, 'check_responsible_beverage_service'),
    ),
    c('rule_amplified_music', brief({ flags: { ...flags, amplifiedMusic: true } }), (e) =>
      hasTask(e, 'task_sound_curfew_permit'),
    ),
    c('rule_community_public', brief({ eventType: 'community' }), (e) =>
      hasCheck(e, 'check_municipal_event_permit'),
    ),
    c('rule_sponsorship', brief({ eventType: 'community', subFormat: 'fundraiser' }), (e) =>
      hasTask(e, 'task_sponsor_recognition_setup'),
    ),
  ];

  it.each(cases)('triggers rule %s and applies claimed effects', (rule, testBrief, check) => {
    const list = evaluateAdaptations(testBrief, today);
    const match = list.find((item) => item.ruleName === rule);
    expect(match).toBeDefined();
    if (match !== undefined) {
      expect(check(match.effects)).toBe(true);
      expect(match.reason).toContain(rule);
    }
  });

  it('evaluates baseline neutral brief with zero adaptations', () => {
    const list = evaluateAdaptations(brief(), today);
    expect(list.length).toBe(0);
  });
});

describe('Deterministic Adaptation Reason Generator', () => {
  it('formats empty adjustments cleanly', () => {
    const reason = generateAdaptationReason('test_rule', createEmptyEffects());
    expect(reason).toBe('[test_rule] no effect adjustments');
  });

  it('formats combined effect attributes deterministically', () => {
    const reason = generateAdaptationReason('rule_demo', {
      contingencyDelta: 3,
      weightFactors: { venue: 1.1, catering: 1.2 },
      injectTaskIds: ['task_a'],
      vendorCheckIds: ['check_b'],
      alerts: [{ code: 'ADAPTATION_TRIGGERED', severity: 'warn', message: 'test' }],
      compressTimeline: true,
      skipOptionalTasks: true,
    });
    expect(reason).toContain('contingency +3%');
    expect(reason).toContain('catering x1.2, venue x1.1');
    expect(reason).toContain('injected tasks: task_a');
    expect(reason).toContain('vendor checks: check_b');
    expect(reason).toContain('alerts: warn:ADAPTATION_TRIGGERED');
    expect(reason).toContain('compress timeline');
    expect(reason).toContain('skip optional tasks');
  });
});

describe('aggregateEffects', () => {
  it('aggregates and deduplicates composite adaptation effects', () => {
    const list = evaluateAdaptations(
      brief({
        guestCount: 250,
        totalBudget: 2_500_000,
        flags: { ...flags, openBar: true },
      }),
      today,
    );
    const agg = aggregateEffects(list);
    expect(agg.contingencyDelta).toBe(4);
    expect(agg.injectTaskIds).toContain('task_crowd_control_plan');
    expect(agg.injectTaskIds).toContain('task_bartender_liquor_license_verification');
  });

  it('handles empty adaptation list with default zero effects', () => {
    const agg = aggregateEffects([]);
    expect(agg.contingencyDelta).toBe(0);
    expect(agg.skipOptionalTasks).toBe(false);
    expect(agg.compressTimeline).toBe(false);
  });
});
