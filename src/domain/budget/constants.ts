import type { EventType } from '../types';
import type { CategoryItem } from './types';

export const DEFAULT_CATEGORIES: readonly CategoryItem[] = [
  { id: 'venue', name: 'Venue & Facilities', eventTypes: ['wedding', 'birthday', 'community'] },
  {
    id: 'catering',
    name: 'Catering & Beverages',
    eventTypes: ['wedding', 'birthday', 'community'],
  },
  { id: 'photography', name: 'Photography & Videography', eventTypes: ['wedding', 'birthday'] },
  { id: 'attire', name: 'Attire & Rings', eventTypes: ['wedding'] },
  { id: 'decor', name: 'Decor & Floral', eventTypes: ['wedding', 'birthday'] },
  { id: 'entertainment', name: 'Entertainment & Music', eventTypes: ['wedding', 'birthday'] },
  { id: 'invitations', name: 'Invitations & Stationery', eventTypes: ['wedding', 'birthday'] },
  { id: 'hair_makeup', name: 'Hair & Makeup', eventTypes: ['wedding'] },
  { id: 'coordinator', name: 'Planning & Coordination', eventTypes: ['wedding'] },
  { id: 'transport', name: 'Transport & Logistics', eventTypes: ['wedding'] },
  { id: 'cake', name: 'Cake & Desserts', eventTypes: ['birthday'] },
  { id: 'favors', name: 'Favors & Gifts', eventTypes: ['birthday'] },
  { id: 'equipment', name: 'AV & Equipment', eventTypes: ['community'] },
  { id: 'permits_security', name: 'Permits & Security', eventTypes: ['community'] },
  { id: 'marketing', name: 'Marketing & Promotion', eventTypes: ['community'] },
  { id: 'waste_sanitation', name: 'Waste Management & Sanitation', eventTypes: ['community'] },
  { id: 'activities', name: 'Activities & Workshops', eventTypes: ['community'] },
  { id: 'insurance', name: 'Insurance & Legal', eventTypes: ['community'] },
  { id: 'volunteer_supplies', name: 'Volunteer Supplies', eventTypes: ['community'] },
];

const ORDERED_CATEGORY_IDS: Record<EventType, readonly string[]> = {
  wedding: [
    'venue',
    'catering',
    'photography',
    'attire',
    'decor',
    'entertainment',
    'invitations',
    'hair_makeup',
    'coordinator',
    'transport',
  ],
  birthday: [
    'venue',
    'catering',
    'cake',
    'entertainment',
    'decor',
    'favors',
    'photography',
    'invitations',
  ],
  community: [
    'venue',
    'equipment',
    'permits_security',
    'marketing',
    'catering',
    'waste_sanitation',
    'activities',
    'insurance',
    'volunteer_supplies',
  ],
};

export const DEFAULT_PRESETS: Record<EventType, Record<string, number>> = {
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

export const DEFAULT_FLOORS: Record<string, Record<EventType, number>> = {
  INR: { wedding: 60000, birthday: 25000, community: 15000 },
  USD: { wedding: 5000, birthday: 2000, community: 1000 },
  EUR: { wedding: 4500, birthday: 1800, community: 900 },
  GBP: { wedding: 4000, birthday: 1600, community: 800 },
};

/** Resolves domain category items for an event type in standard display order. */
export function getDomainCategories(type: EventType): readonly CategoryItem[] {
  const orderedIds = ORDERED_CATEGORY_IDS[type] ?? [];
  const map = new Map(DEFAULT_CATEGORIES.map((item) => [item.id, item]));
  const result: CategoryItem[] = [];
  for (const id of orderedIds) {
    const item = map.get(id);
    if (item) {
      result.push(item);
    }
  }
  return result;
}

/** Resolves default preset weights for an event type summing to 100. */
export function getDomainPresetWeights(type: EventType): Record<string, number> {
  return DEFAULT_PRESETS[type] ?? DEFAULT_PRESETS.wedding;
}

/** Resolves planning heuristic per-head floor in minor units for a currency and event type. */
export function getDomainFloor(currency: string, type: EventType): number {
  const currencyFloors = DEFAULT_FLOORS[currency];
  if (!currencyFloors) {
    return 1000;
  }
  return currencyFloors[type] ?? 1000;
}
