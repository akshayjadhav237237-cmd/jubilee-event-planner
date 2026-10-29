import type { EventType } from '../domain/types';

/**
 * Planning heuristic per-head floors in integer minor units.
 * Used to flag early budget inadequacy before vendor commitments.
 */
export const PER_HEAD_FLOORS: Record<string, Record<EventType, number>> = {
  INR: {
    wedding: 60000,
    birthday: 25000,
    community: 15000,
  },
  USD: {
    wedding: 5000,
    birthday: 2000,
    community: 1000,
  },
  EUR: {
    wedding: 4500,
    birthday: 1800,
    community: 900,
  },
  GBP: {
    wedding: 4000,
    birthday: 1600,
    community: 800,
  },
};

/** Resolves the planning heuristic per-head floor in minor units for a currency and event type. */
export function getPerHeadFloor(currency: string, eventType: EventType): number {
  const currencyFloors = PER_HEAD_FLOORS[currency];
  if (!currencyFloors) {
    return 1000;
  }
  return currencyFloors[eventType] ?? 1000;
}
