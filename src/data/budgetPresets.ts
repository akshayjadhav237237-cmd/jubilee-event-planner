import type { EventType } from '../domain/types';

export const BUDGET_PRESETS: Record<EventType, Record<string, number>> = {
  wedding: {
    venue: 30,
    catering: 25,
    photography: 10,
    attire: 8,
    decor: 8,
    entertainment: 7,
    invitations: 3,
    hair_makeup: 3,
    coordinator: 4,
    transport: 2,
  },
  birthday: {
    venue: 25,
    catering: 25,
    cake: 8,
    entertainment: 15,
    decor: 10,
    favors: 5,
    photography: 8,
    invitations: 4,
  },
  community: {
    venue: 20,
    equipment: 15,
    permits_security: 12,
    marketing: 8,
    catering: 15,
    waste_sanitation: 8,
    activities: 10,
    insurance: 7,
    volunteer_supplies: 5,
  },
};

/** Returns integer percentage category weights summing to 100 for an event type. */
export function getPresetWeights(type: EventType): Record<string, number> {
  const preset = BUDGET_PRESETS[type];
  if (!preset) {
    return BUDGET_PRESETS.wedding;
  }
  return preset;
}
