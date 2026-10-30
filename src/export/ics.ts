import { addDays } from '../domain/dates';
import type { Task } from '../domain/types';

/** Escapes special text characters for RFC 5545 iCalendar format. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

/** Folds an iCalendar content line to 75 octets per RFC 5545 with CRLF and leading space. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) {
    return line;
  }

  const chunks: string[] = [];
  let currentChunk = '';
  let currentBytes = 0;
  const maxBytes = 75;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    if (currentBytes + charBytes > maxBytes) {
      chunks.push(currentChunk);
      currentChunk = ` ${char}`;
      currentBytes = 1 + charBytes;
    } else {
      currentChunk += char;
      currentBytes += charBytes;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks.join('\r\n');
}

function buildVEvent(task: Task, briefTitle: string): readonly string[] {
  const startDate = task.dueDate.replace(/-/g, '');
  const endDate = addDays(task.dueDate, 1).replace(/-/g, '');
  const uid = `task-${task.id}@jubilee.app`;
  const summary = escapeIcsText(task.title);
  const status = task.completed ? 'COMPLETED' : 'NEEDS-ACTION';
  const category = escapeIcsText(task.category);

  const dependencies = task.dependencies ?? [];
  const depStr = dependencies.length > 0 ? ` (Depends on: ${dependencies.join(', ')})` : '';
  const description = escapeIcsText(`${briefTitle} - ${task.category}${depStr}`);

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `CATEGORIES:${category}`,
    `STATUS:${status}`,
    'END:VEVENT',
  ];
}

/** Generates an RFC 5545 compliant iCalendar string for all timeline tasks. */
export function generateTimelineIcs(tasks: readonly Task[], briefTitle: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jubilee//Event Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const task of tasks) {
    const eventLines = buildVEvent(task, briefTitle);
    lines.push(...eventLines);
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}
