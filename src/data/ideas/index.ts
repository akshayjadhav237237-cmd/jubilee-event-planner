import type { EventType, IdeaCategory } from '../../domain/types';
import type { IdeaTemplate } from '../../domain/ideas/types';
import { WEDDING_THEMES } from './weddingThemes';
import { WEDDING_MENU } from './weddingMenu';
import { WEDDING_ACTIVITIES } from './weddingActivities';
import { BIRTHDAY_THEMES } from './birthdayThemes';
import { BIRTHDAY_MENU } from './birthdayMenu';
import { BIRTHDAY_ACTIVITIES } from './birthdayActivities';
import { COMMUNITY_THEMES } from './communityThemes';
import { COMMUNITY_MENU } from './communityMenu';
import { COMMUNITY_ACTIVITIES } from './communityActivities';

export {
  WEDDING_THEMES,
  WEDDING_MENU,
  WEDDING_ACTIVITIES,
  BIRTHDAY_THEMES,
  BIRTHDAY_MENU,
  BIRTHDAY_ACTIVITIES,
  COMMUNITY_THEMES,
  COMMUNITY_MENU,
  COMMUNITY_ACTIVITIES,
};

/** Complete static catalog of curated ideas across all event formats and categories. */
export const ALL_IDEAS: readonly IdeaTemplate[] = [
  ...WEDDING_THEMES,
  ...WEDDING_MENU,
  ...WEDDING_ACTIVITIES,
  ...BIRTHDAY_THEMES,
  ...BIRTHDAY_MENU,
  ...BIRTHDAY_ACTIVITIES,
  ...COMMUNITY_THEMES,
  ...COMMUNITY_MENU,
  ...COMMUNITY_ACTIVITIES,
];

/** Filters catalog templates matching a specific event format. */
export function getIdeasByEventType(eventType: EventType): readonly IdeaTemplate[] {
  return ALL_IDEAS.filter((idea) => idea.eventType === eventType);
}

/** Filters catalog templates matching a specific category. */
export function getIdeasByCategory(category: IdeaCategory): readonly IdeaTemplate[] {
  return ALL_IDEAS.filter((idea) => idea.category === category);
}
