import { ALL_TASKS } from '../../data/tasks';
import { daysBetween, parseIsoDate, type IsoDate } from '../../domain/dates';
import { evaluateAdaptations } from '../../domain/adaptations';
import { err, ok, type Result } from '../../domain/result';
import type { EventBrief, Task } from '../../domain/types';

export interface PhaseGroup {
  readonly phase: string;
  readonly tasks: readonly Task[];
}

export interface DependencyHint {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
}

export interface CompressionStatus {
  readonly isCompressed: boolean;
  readonly reason: string | null;
}

const TEMPLATE_PHASE_MAP = new Map(ALL_TASKS.map((t) => [t.id, t.phase]));

/** Groups timeline tasks chronologically by planning phase. */
export function groupTasksByPhase(tasks: readonly Task[]): readonly PhaseGroup[] {
  const groups: Map<string, Task[]> = new Map();

  for (const task of tasks) {
    const phase = TEMPLATE_PHASE_MAP.get(task.id) ?? 'General Planning';
    const list = groups.get(phase) ?? [];
    list.push(task);
    groups.set(phase, list);
  }

  const result: PhaseGroup[] = [];
  for (const [phase, phaseTasks] of groups.entries()) {
    result.push({ phase, tasks: phaseTasks });
  }
  return result;
}

/** Resolves dependency details including title and completion state. */
export function getDependencyHints(
  task: Task,
  allTasks: readonly Task[],
): readonly DependencyHint[] {
  const taskMap = new Map(allTasks.map((t) => [t.id, t]));
  const hints: DependencyHint[] = [];

  for (const depId of task.dependencies) {
    const dep = taskMap.get(depId);
    if (dep) {
      hints.push({ id: dep.id, title: dep.title, completed: dep.completed });
    }
  }
  return hints;
}

/** Determines if schedule compression is active via short-notice or past-date adaptations. */
export function checkScheduleCompression(brief: EventBrief, today: IsoDate): CompressionStatus {
  const adaptations = evaluateAdaptations(brief, today);
  const compressedAdaptation = adaptations.find((a) => a.effects.compressTimeline);

  if (compressedAdaptation) {
    return {
      isCompressed: true,
      reason: compressedAdaptation.reason,
    };
  }

  const days = daysBetween(today, brief.eventDate);
  if (days >= 0 && days <= 30) {
    return {
      isCompressed: true,
      reason: `Schedule compressed: Only ${days} days remaining before celebration.`,
    };
  }

  return { isCompressed: false, reason: null };
}

/** Validates ISO date format and basic boundary for task rescheduling. */
export function validateRescheduleDate(dateStr: string): Result<IsoDate, string> {
  const parsed = parseIsoDate(dateStr);
  if (!parsed.ok) {
    return err('Invalid date format. Expected YYYY-MM-DD');
  }
  return ok(parsed.value);
}
