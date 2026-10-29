import { daysBetween, isPast } from '../dates';
import type { AdaptationRule } from './types';
import { createEmptyEffects } from './types';

function getIsoMonth(date: string): number {
  const parts = date.split('-');
  const monthStr = parts[1];
  return monthStr !== undefined ? Number(monthStr) : 0;
}

export const rulePastDate: AdaptationRule = {
  id: 'rule_past_date',
  name: 'rule_past_date',
  description: 'Detects event dates in the past and switches timeline to retrospective mode.',
  predicate: (brief, today) => isPast(brief.eventDate, today),
  getEffects: () => ({
    ...createEmptyEffects(),
    compressTimeline: true,
    alerts: [
      {
        code: 'ADAPTATION_TRIGGERED',
        severity: 'critical',
        message: 'Event date is in the past. Timeline is in retrospective mode.',
      },
    ],
  }),
};

export const ruleShortNotice: AdaptationRule = {
  id: 'rule_short_notice',
  name: 'rule_short_notice',
  description: 'Compresses schedule and raises contingency for bookings within 30 days.',
  predicate: (brief, today) => {
    const days = daysBetween(today, brief.eventDate);
    return days >= 0 && days <= 30;
  },
  getEffects: () => ({
    ...createEmptyEffects(),
    contingencyDelta: 2,
    compressTimeline: true,
    skipOptionalTasks: true,
  }),
};

export const ruleOutdoorWeather: AdaptationRule = {
  id: 'rule_outdoor_weather',
  name: 'rule_outdoor_weather',
  description: 'Adds contingency and rain backup tasks for outdoor events.',
  predicate: (brief) => brief.setting === 'outdoor',
  getEffects: () => ({
    ...createEmptyEffects(),
    contingencyDelta: 2,
    injectTaskIds: ['task_weather_backup_plan', 'task_shelter_inspection'],
    vendorCheckIds: ['check_weatherproofing_and_power'],
  }),
};

export const ruleHotWetSeason: AdaptationRule = {
  id: 'rule_hot_wet_season',
  name: 'rule_hot_wet_season',
  description: 'Injects temperature and rain control tasks for non-indoor extreme weather months.',
  predicate: (brief) => {
    if (brief.setting === 'indoor') {
      return false;
    }
    const month = getIsoMonth(brief.eventDate);
    return month === 1 || month === 6 || month === 7 || month === 8 || month === 12;
  },
  getEffects: () => ({
    ...createEmptyEffects(),
    injectTaskIds: ['task_cooling_or_heating_provisions'],
  }),
};

export const TIMELINE_RULES: readonly AdaptationRule[] = [
  rulePastDate,
  ruleShortNotice,
  ruleOutdoorWeather,
  ruleHotWetSeason,
];
