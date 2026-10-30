import { describe, expect, it } from 'vitest';
import { generateTimelineIcs, escapeIcsText } from '../../src/export/ics';
import type { Task } from '../../src/domain/types';
import type { IsoDate } from '../../src/domain/dates';

describe('ICS Timeline Golden File and RFC 5545 Compliance', () => {
  const SAMPLE_TASKS: readonly Task[] = [
    {
      id: 'task_catering_tasting',
      title: 'Menu Tasting & Chef Selection; with vendors, planners',
      dueDate: '2027-05-15' as IsoDate,
      category: 'catering',
      completed: false,
      dependencies: [],
    },
    {
      id: 'task_venue_deposit',
      title: 'Pay Final Venue Booking Deposit',
      dueDate: '2027-08-01' as IsoDate,
      category: 'venue',
      completed: true,
      dependencies: [],
    },
  ];

  it('generates strictly CRLF-terminated lines without standalone bare LFs', () => {
    const ics = generateTimelineIcs(SAMPLE_TASKS, "Rohan & Ananya's Wedding");
    // Ensure all newlines are CRLF
    const crlfCount = (ics.match(/\r\n/g) ?? []).length;
    const bareLfCount = (ics.replace(/\r\n/g, '').match(/\n/g) ?? []).length;

    expect(crlfCount).toBeGreaterThan(10);
    expect(bareLfCount).toBe(0);
  });

  it('guarantees every single line does not exceed 75 octets per RFC 5545', () => {
    const tasksWithLongText: readonly Task[] = [
      {
        id: 'task_ultra_long',
        title: 'Super Long Task Title Exceeding Normal Single Line Limits For Calendar Events',
        dueDate: '2027-06-01' as IsoDate,
        category: 'decor',
        completed: false,
        dependencies: [],
      },
    ];

    const ics = generateTimelineIcs(tasksWithLongText, 'Extravaganza');
    const lines = ics.split('\r\n');

    for (const line of lines) {
      const octetLength = new TextEncoder().encode(line).length;
      expect(octetLength).toBeLessThanOrEqual(75);
    }
  });

  it('correctly escapes special characters according to RFC 5545', () => {
    const escaped = escapeIcsText('Hello, World; One \\ Two\nThree');
    expect(escaped).toBe('Hello\\, World\\; One \\\\ Two\\nThree');
  });

  it('generates stable deterministic UIDs derived from task ids', () => {
    const ics = generateTimelineIcs(SAMPLE_TASKS, 'Celebration');
    expect(ics).toContain('UID:task-task_catering_tasting@jubilee.app');
    expect(ics).toContain('UID:task-task_venue_deposit@jubilee.app');
  });

  it('matches expected golden RFC 5545 structure', () => {
    const singleTask: readonly Task[] = [
      {
        id: 'golden_task_1',
        title: 'Sign Agreement',
        dueDate: '2027-04-10' as IsoDate,
        category: 'venue',
        completed: false,
        dependencies: [],
      },
    ];

    const ics = generateTimelineIcs(singleTask, 'Golden Jubilee');

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Jubilee//Event Planner//EN');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:task-golden_task_1@jubilee.app');
    expect(ics).toContain('SUMMARY:Sign Agreement');
    expect(ics).toContain('DTSTART;VALUE=DATE:20270410');
    expect(ics).toContain('DTEND;VALUE=DATE:20270411');
    expect(ics).toContain('STATUS:NEEDS-ACTION');
    expect(ics).toContain('DESCRIPTION:Golden Jubilee - venue');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });
});
