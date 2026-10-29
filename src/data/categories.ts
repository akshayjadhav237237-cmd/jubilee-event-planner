import type { EventType } from '../domain/types';
import type { CategoryItem } from '../domain/budget/types';

export type { CategoryItem };

export const CATEGORIES: readonly CategoryItem[] = [
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

/** Returns canonical budget categories configured for an event type in standard order. */
export function getCategoriesForEventType(type: EventType): readonly CategoryItem[] {
  const ids = ORDERED_CATEGORY_IDS[type] ?? [];
  const map = new Map(CATEGORIES.map((item) => [item.id, item]));
  const result: CategoryItem[] = [];
  for (const id of ids) {
    const item = map.get(id);
    if (item) {
      result.push(item);
    }
  }
  return result;
}
