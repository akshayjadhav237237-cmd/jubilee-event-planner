import type { TaskTemplate } from '../../domain/templates';
import type { EventType } from '../../domain/types';
import { BIRTHDAY_TASKS } from './birthdayTasks';
import { COMMUNITY_TASKS } from './communityTasks';
import { CONDITIONAL_TASKS } from './conditionalTasks';
import { WEDDING_TASKS } from './weddingTasks';

export { BIRTHDAY_TASKS, COMMUNITY_TASKS, CONDITIONAL_TASKS, WEDDING_TASKS };

export const ALL_TASKS: readonly TaskTemplate[] = [
  ...WEDDING_TASKS,
  ...BIRTHDAY_TASKS,
  ...COMMUNITY_TASKS,
  ...CONDITIONAL_TASKS,
];

/** Returns base task templates for a given event type. */
export function getBaseTasks(eventType: EventType): readonly TaskTemplate[] {
  switch (eventType) {
    case 'wedding':
      return WEDDING_TASKS;
    case 'birthday':
      return BIRTHDAY_TASKS;
    case 'community':
      return COMMUNITY_TASKS;
    default:
      return [];
  }
}

/** Resolves conditional tasks matching requested task IDs or adaptation IDs. */
export function getConditionalTasks(injectIds: readonly string[]): readonly TaskTemplate[] {
  if (injectIds.length === 0) {
    return [];
  }
  const idSet = new Set(injectIds);
  return CONDITIONAL_TASKS.filter(
    (task): boolean =>
      idSet.has(task.id) || (task.adaptationId !== undefined && idSet.has(task.adaptationId)),
  );
}
