import { describe, expect, it } from 'vitest';
import type { IsoDate } from '../../src/domain/dates';
import type { Task } from '../../src/domain/types';
import { escapeIcsText, foldIcsLine, generateTimelineIcs } from '../../src/export/ics';

describe('ICS Timeline Export', () => {
  describe('escapeIcsText', () => {
    it('escapes backslashes, semicolons, commas, and newlines per RFC 5545', () => {
      const input = 'One, Two; Three \\ Four\nFive\r\nSix';
      const escaped = escapeIcsText(input);
      expect(escaped).toBe('One\\, Two\\; Three \\\\ Four\\nFive\\nSix');
    });
  });

  describe('foldIcsLine', () => {
    it('leaves short lines <= 75 octets untouched', () => {
      const line = 'SUMMARY:Book wedding venue';
      expect(foldIcsLine(line)).toBe(line);
    });

    it('folds long lines > 75 octets by inserting CRLF and a single space', () => {
      const longTitle = 'A'.repeat(80);
      const line = `SUMMARY:${longTitle}`;
      const folded = foldIcsLine(line);

      expect(folded).toContain('\r\n ');
      const parts = folded.split('\r\n');
      expect(parts[0]?.length).toBe(75);
      expect(parts[1]?.startsWith(' ')).toBe(true);
    });

    it('respects UTF-8 byte boundaries for multi-byte characters', () => {
      // '₹' is 3 bytes in UTF-8
      const multiByteLine = 'DESCRIPTION:' + '₹'.repeat(30);
      const folded = foldIcsLine(multiByteLine);
      const parts = folded.split('\r\n');
      const encoder = new TextEncoder();

      for (const part of parts) {
        expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
      }
    });
  });

  describe('generateTimelineIcs', () => {
    const mockTasks: readonly Task[] = [
      {
        id: 'task-101',
        title: 'Review caterer, florist & decor quotes; sign contract',
        dueDate: '2027-06-15' as IsoDate,
        completed: false,
        category: 'Vendors',
        dependencies: ['task-100'],
      },
      {
        id: 'task-102',
        title: 'Finalize RSVP guest count',
        dueDate: '2027-07-01' as IsoDate,
        completed: true,
        category: 'Planning',
        dependencies: [],
      },
    ];

    it('outputs RFC 5545 compliant envelope with CRLF line endings', () => {
      const ics = generateTimelineIcs(mockTasks, 'Grand Gala');

      expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
      expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
      expect(ics).toContain('VERSION:2.0\r\n');
      expect(ics).toContain('PRODID:-//Jubilee//Event Planner//EN\r\n');
      expect(ics).toContain('CALSCALE:GREGORIAN\r\n');
      expect(ics).toContain('METHOD:PUBLISH\r\n');
    });

    it('formats all-day event dates with start date and next-day end date', () => {
      const ics = generateTimelineIcs(mockTasks, 'Grand Gala');

      // Task 101: 2027-06-15 -> start 20270615, end 20270616
      expect(ics).toContain('DTSTART;VALUE=DATE:20270615');
      expect(ics).toContain('DTEND;VALUE=DATE:20270616');

      // Task 102: 2027-07-01 -> start 20270701, end 20270702
      expect(ics).toContain('DTSTART;VALUE=DATE:20270701');
      expect(ics).toContain('DTEND;VALUE=DATE:20270702');
    });

    it('generates deterministic stable UIDs from task ids', () => {
      const ics = generateTimelineIcs(mockTasks, 'Grand Gala');

      expect(ics).toContain('UID:task-task-101@jubilee.app');
      expect(ics).toContain('UID:task-task-102@jubilee.app');
    });

    it('properly escapes commas, semicolons, and special characters in event fields', () => {
      const ics = generateTimelineIcs(mockTasks, 'Grand Gala');

      // Check escaped title: "Review caterer\, florist & decor quotes\; sign contract"
      expect(ics).toContain('Review caterer\\, florist & decor quotes\\; sign contract');
    });

    it('correctly sets STATUS to COMPLETED or NEEDS-ACTION based on task status', () => {
      const ics = generateTimelineIcs(mockTasks, 'Grand Gala');

      expect(ics).toContain('STATUS:NEEDS-ACTION');
      expect(ics).toContain('STATUS:COMPLETED');
    });
  });
});
