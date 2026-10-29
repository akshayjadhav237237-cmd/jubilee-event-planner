import { addDays, isPast, type IsoDate } from '../../domain/dates';
import { rescheduleTask } from '../../domain/timeline';
import type { Plan, Task } from '../../domain/types';
import type { AssistantResult } from '../ports';
import { findTaskCandidates, fuzzyMatchTask } from './fuzzy';

function extractToggleQuery(prompt: string): { query: string; isUndone: boolean } | null {
  const undoneMatch =
    prompt.match(/\b(?:undo|uncheck|reopen)\b\s+(?:task\s+)?(.+)/i) ??
    prompt.match(/\bmark\b\s+(?:task\s+)?(.+?)\s+as\s+(?:undone|incomplete|not\s+done|pending)\b/i);

  if (undoneMatch && undoneMatch[1]) {
    return { query: undoneMatch[1].trim(), isUndone: true };
  }

  const doneMatch =
    prompt.match(/\bmark\s+task\s+complete:\s*(.+)/i) ??
    prompt.match(/\b(?:complete|finish)\b\s+(?:task\s+)?(.+)/i) ??
    prompt.match(
      /\bmark\b\s+(?:task\s+)?(.+?)\s+(?:as\s+)?(?:done|complete|completed|finished)\b/i,
    ) ??
    prompt.match(/\bdone\s+with\b\s+(.+)/i);

  if (doneMatch && doneMatch[1]) {
    return { query: doneMatch[1].trim(), isUndone: false };
  }
  return null;
}

function validateToggle(task: Task, isUndone: boolean): AssistantResult | null {
  if (isUndone && !task.completed) {
    return { kind: 'refuse', reason: `Task "${task.title}" is already incomplete.` };
  }
  if (!isUndone && task.completed) {
    return { kind: 'refuse', reason: `Task "${task.title}" is already completed.` };
  }
  return null;
}

function parseToggleIntent(prompt: string, plan: Plan): AssistantResult | null {
  const extracted = extractToggleQuery(prompt);
  if (!extracted) return null;

  const taskQuery = extracted.query.replace(/^(task|the)\s+/i, '').replace(/[.!?]+$/, '');
  const match = fuzzyMatchTask(taskQuery, plan.timeline);
  if (!match) {
    const candidates = findTaskCandidates(taskQuery, plan.timeline);
    if (candidates.length > 1) {
      const titles = candidates
        .slice(0, 2)
        .map((c) => `"${c.task.title}"`)
        .join(' or ');
      return { kind: 'clarify', question: `Did you mean ${titles}?` };
    }
    return null;
  }

  const stateError = validateToggle(match.task, extracted.isUndone);
  if (stateError) return stateError;

  const statusWord = extracted.isUndone ? 'incomplete' : 'completed';
  return {
    kind: 'commands',
    commands: [{ type: 'TOGGLE_TASK', taskId: match.task.id }],
    summary: `Marked "${match.task.title}" as ${statusWord}.`,
  };
}

type RescheduleExtraction = {
  rawQuery: string;
  days: number;
  direction: 'earlier' | 'later';
};

function matchRescheduleWithBy(prompt: string): RescheduleExtraction | null {
  const p1 =
    /\b(?:move|reschedule|shift|postpone|advance|delay)\b\s+(?:task\s+)?(.+?)\s+by\s+([0-9]+)\s+days?\s*(earlier|later|forward|back)?/i;
  const m1 = prompt.match(p1);
  if (!m1 || !m1[1] || !m1[2]) return null;

  const actionWord = prompt.toLowerCase();
  const dirSpec = m1[3]?.toLowerCase();
  const isEarlier = dirSpec === 'earlier' || dirSpec === 'back' || actionWord.includes('advance');
  return {
    rawQuery: m1[1].trim(),
    days: Number(m1[2]),
    direction: isEarlier ? 'earlier' : 'later',
  };
}

function matchRescheduleDirect(prompt: string): RescheduleExtraction | null {
  const p2 =
    /\b(?:move|reschedule|shift|postpone|delay)\b\s+(?:task\s+)?(.+?)\s+([0-9]+)\s+days?\s*(earlier|later|forward|back)/i;
  const m2 = prompt.match(p2);
  if (!m2 || !m2[1] || !m2[2] || !m2[3]) return null;

  const isEarlier = m2[3].toLowerCase() === 'earlier' || m2[3].toLowerCase() === 'back';
  return {
    rawQuery: m2[1].trim(),
    days: Number(m2[2]),
    direction: isEarlier ? 'earlier' : 'later',
  };
}

function extractReschedule(prompt: string): RescheduleExtraction | null {
  return matchRescheduleWithBy(prompt) ?? matchRescheduleDirect(prompt);
}

function parseRescheduleIntent(
  prompt: string,
  plan: Plan,
  today?: IsoDate,
): AssistantResult | null {
  const extraction = extractReschedule(prompt);
  if (!extraction) return null;

  const { rawQuery, days, direction } = extraction;
  if (!Number.isFinite(days) || days <= 0) {
    return { kind: 'refuse', reason: 'Reschedule offset must be a positive number of days.' };
  }

  const taskQuery = rawQuery.replace(/^(task|the)\s+/i, '').replace(/[.!?]+$/, '');
  const match = fuzzyMatchTask(taskQuery, plan.timeline);
  if (!match) {
    const candidates = findTaskCandidates(taskQuery, plan.timeline);
    if (candidates.length > 1) {
      const titles = candidates
        .slice(0, 2)
        .map((c) => `"${c.task.title}"`)
        .join(' or ');
      return { kind: 'clarify', question: `Did you mean ${titles}?` };
    }
    return null;
  }

  const { task } = match;
  const signedDays = direction === 'earlier' ? -days : days;
  const newDueDate = addDays(task.dueDate, signedDays);

  if (today !== undefined && isPast(newDueDate, today)) {
    return {
      kind: 'refuse',
      reason: `Cannot reschedule "${task.title}" to a past date (${newDueDate}).`,
    };
  }

  const rescheduleRes = rescheduleTask(plan.timeline, task.id, newDueDate, today);
  if (!rescheduleRes.ok) {
    return { kind: 'refuse', reason: rescheduleRes.error };
  }

  return {
    kind: 'commands',
    commands: [{ type: 'RESCHEDULE_TASK', taskId: task.id, dueDate: newDueDate }],
    summary: `Rescheduled "${task.title}" ${days} days ${direction} to ${newDueDate}.`,
  };
}

/** Parses natural language timeline intents including task completion toggling and rescheduling. */
export function parseTimelineIntent(
  prompt: string,
  plan: Plan,
  today?: IsoDate,
): AssistantResult | null {
  const toggleRes = parseToggleIntent(prompt, plan);
  if (toggleRes) return toggleRes;

  const rescheduleRes = parseRescheduleIntent(prompt, plan, today);
  if (rescheduleRes) return rescheduleRes;

  return null;
}
