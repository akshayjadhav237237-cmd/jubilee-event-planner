import { describe, expect, it } from 'vitest';
import { generateExportFilename, slugify } from '../../src/export/slug';

describe('Export Slug and Filename', () => {
  describe('slugify', () => {
    it('lowercases and replaces spaces with dashes', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Jubilee Gala Event')).toBe('jubilee-gala-event');
    });

    it('handles special characters and ampersands properly', () => {
      expect(slugify("Ananya & Rohan's Wedding")).toBe('ananya-rohan-s-wedding');
      expect(slugify('Liam: 10th Birthday! (Mega-Adventure)')).toBe(
        'liam-10th-birthday-mega-adventure',
      );
    });

    it('strips leading, trailing, and duplicate dashes', () => {
      expect(slugify('---hello---world---')).toBe('hello-world');
      expect(slugify('   spaced   out   ')).toBe('spaced-out');
    });

    it('handles empty strings and strings with only punctuation', () => {
      expect(slugify('')).toBe('');
      expect(slugify('!@#$%^&*()')).toBe('');
    });

    it('preserves alphanumeric numbers and digits', () => {
      expect(slugify('Party 2027 Route 66')).toBe('party-2027-route-66');
    });
  });

  describe('generateExportFilename', () => {
    it('produces expected filename for wedding scenario with .md', () => {
      const filename = generateExportFilename("Ananya & Rohan's Wedding", '2027-11-20', 'md');
      expect(filename).toBe('jubilee-ananya-rohan-s-wedding-2027-11-20.md');
    });

    it('supports all valid extensions: md, csv, ics, json', () => {
      const title = 'Community Gala';
      const date = '2027-05-15';
      expect(generateExportFilename(title, date, 'csv')).toBe(
        'jubilee-community-gala-2027-05-15.csv',
      );
      expect(generateExportFilename(title, date, 'ics')).toBe(
        'jubilee-community-gala-2027-05-15.ics',
      );
      expect(generateExportFilename(title, date, 'json')).toBe(
        'jubilee-community-gala-2027-05-15.json',
      );
      expect(generateExportFilename(title, date, 'md')).toBe(
        'jubilee-community-gala-2027-05-15.md',
      );
    });

    it('falls back to default event base slug when title has only punctuation or is empty', () => {
      expect(generateExportFilename('!!!', '2027-12-01', 'csv')).toBe(
        'jubilee-event-2027-12-01.csv',
      );
      expect(generateExportFilename('', '2027-12-01', 'md')).toBe('jubilee-event-2027-12-01.md');
    });

    it('omits date segment cleanly when date string is empty', () => {
      expect(generateExportFilename('Birthday Bash', '', 'json')).toBe(
        'jubilee-birthday-bash.json',
      );
    });
  });
});
