import { getBaseTasks, getConditionalTasks } from '../../data/tasks';
import type { AdaptationEffects } from '../adaptationTypes';
import {
  addDays,
  daysBetween,
  isPast,
  parseIsoDate,
  startOfTodayUtc,
  type IsoDate,
} from '../dates';
import { err, ok, type Result } from '../result';
import type { TaskTemplate } from '../templates';
import type { EventBrief, Task } from '../types';
import { sortTasksWithFallback } from './sort';

/** Resolves and filters candidate task templates based on brief and adaptations. */
function selectTemplates(
  brief: EventBrief,
  effects?: AdaptationEffects,
  customTemplates?: readonly TaskTemplate[],
): readonly TaskTemplate[] {
  const source = customTemplates ?? [
    ...getBaseTasks(brief.eventType),
    ...(effects?.injectTaskIds !== undefined ? getConditionalTasks(effects.injectTaskIds) : []),
  ];
  const seen = new Set<string>();
  const result: TaskTemplate[] = [];
  const skipOptional = effects?.skipOptionalTasks === true;

  for (const template of source) {
    if (!seen.has(template.id) && (!skipOptional || !template.optional)) {
      seen.add(template.id);
      result.push(template);
    }
  }
  return result;
}

/** Computes scaled daysBeforeEvent offset when short-notice compression applies. */
function computeOffset(
  templateDays: number,
  maxOffset: number,
  availableDays: number,
  compress: boolean,
): number {
  if (compress && maxOffset > 0 && availableDays < maxOffset) {
    return Math.round((templateDays / maxOffset) * availableDays);
  }
  return templateDays;
}

/** Builds and topologically sorts a timeline of tasks for an event brief. */
export function buildTasks(
  brief: EventBrief,
  effects?: AdaptationEffects,
  today?: IsoDate,
  customTemplates?: readonly TaskTemplate[],
): readonly Task[] {
  const referenceDate = today ?? startOfTodayUtc();
  const templates = selectTemplates(brief, effects, customTemplates);
  const availableDays = Math.max(0, daysBetween(referenceDate, brief.eventDate));
  const compress = effects?.compressTimeline === true || availableDays < 60;

  let maxOffset = 0;
  for (const t of templates) {
    if (t.daysBeforeEvent > maxOffset) {
      maxOffset = t.daysBeforeEvent;
    }
  }

  const tasks: Task[] = templates.map((template): Task => {
    const offset = computeOffset(template.daysBeforeEvent, maxOffset, availableDays, compress);
    const calculated = addDays(brief.eventDate, -offset);
    const dueDate = isPast(calculated, referenceDate) ? referenceDate : calculated;
    return {
      id: template.id,
      title: template.title,
      dueDate,
      completed: false,
      category: template.category,
      dependencies: template.dependencies,
    };
  });

  return sortTasksWithFallback(tasks);
}

/** Toggles the completed status of a specific task. */
export function toggleTask(tasks: readonly Task[], id: string): readonly Task[] {
  return tasks.map((task): Task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
}

function validateDependencyDates(
  tasks: readonly Task[],
  target: Task,
  newDate: IsoDate,
): string | null {
  for (const other of tasks) {
    if (other.dependencies.includes(target.id) && newDate > other.dueDate) {
      return `Cannot reschedule after dependent task "${other.title}" (${other.dueDate})`;
    }
  }
  for (const depId of target.dependencies) {
    const prereq = tasks.find((t): boolean => t.id === depId);
    if (prereq !== undefined && newDate < prereq.dueDate) {
      return `Cannot reschedule before prerequisite task "${prereq.title}" (${prereq.dueDate})`;
    }
  }
  return null;
}

/** Reschedules a task to a new due date while respecting dependency constraints. */
export function rescheduleTask(
  tasks: readonly Task[],
  id: string,
  newDate: IsoDate,
  today?: IsoDate,
): Result<readonly Task[], string> {
  const parseResult = parseIsoDate(newDate);
  if (!parseResult.ok) {
    return err(parseResult.error);
  }

  if (today !== undefined && isPast(newDate, today)) {
    return err(`Cannot reschedule to a past date (${newDate} is before ${today})`);
  }

  const target = tasks.find((t): boolean => t.id === id);
  if (target === undefined) {
    return err(`Task with ID "${id}" was not found`);
  }

  const depError = validateDependencyDates(tasks, target, newDate);
  if (depError !== null) {
    return err(depError);
  }

  const updatedTasks = tasks.map((task): Task => {
    if (task.id === id) {
      return { ...task, dueDate: newDate };
    }
    return task;
  });

  return ok(sortTasksWithFallback(updatedTasks));
}
