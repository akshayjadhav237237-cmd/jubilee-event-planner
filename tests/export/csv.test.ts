import { describe, expect, it } from 'vitest';
import type { BudgetState } from '../../src/domain/types';
import { generateBudgetCsv, sanitizeCsvCell } from '../../src/export/csv';

describe('CSV Budget Export', () => {
  describe('sanitizeCsvCell formula injection guard', () => {
    it('prepends single quote to neutralize leading equals sign', () => {
      expect(sanitizeCsvCell('=1+1')).toBe("'=1+1");
      expect(sanitizeCsvCell("=cmd|' /C calc'!'A1'")).toBe("'" + "=cmd|' /C calc'!'A1'");
    });

    it('neutralizes leading plus sign', () => {
      expect(sanitizeCsvCell('+cmd|')).toBe("'+cmd|");
    });

    it('neutralizes leading minus sign', () => {
      expect(sanitizeCsvCell('-50.00')).toBe("'-50.00");
    });

    it('neutralizes leading at-sign and wraps in quotes when comma is present', () => {
      expect(sanitizeCsvCell('@SUM(A1,A2)')).toBe('"\'@SUM(A1,A2)"');
    });

    it('neutralizes leading tab character', () => {
      expect(sanitizeCsvCell('\tsecret')).toBe("'\tsecret");
    });

    it('neutralizes leading carriage return and wraps in quotes', () => {
      expect(sanitizeCsvCell('\rsecret')).toBe('"\'\rsecret"');
    });

    it('escapes inner double quotes and wraps with quotes', () => {
      expect(sanitizeCsvCell('Say "Hello"')).toBe('"Say ""Hello"""');
    });

    it('wraps cells with commas or newlines in double quotes', () => {
      expect(sanitizeCsvCell('Catering, Banquet & Bar')).toBe('"Catering, Banquet & Bar"');
      expect(sanitizeCsvCell('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    });

    it('leaves standard alphanumeric strings and numbers untouched', () => {
      expect(sanitizeCsvCell('Venue')).toBe('Venue');
      expect(sanitizeCsvCell(2500)).toBe('2500');
    });
  });

  describe('generateBudgetCsv', () => {
    const mockBudget: BudgetState = {
      totalBudget: 10000000, // 100,000.00 in minor
      contingencyRate: 10,
      categories: [
        {
          id: 'venue',
          name: 'Venue & Facilities',
          allocated: 5000000, // 50,000.00
          spent: 2000000, // 20,000.00
          weight: 50,
        },
        {
          id: 'catering',
          name: 'Catering & Beverages',
          allocated: 4000000, // 40,000.00
          spent: 4500000, // 45,000.00 (overspent by 50.00)
          weight: 40,
        },
      ],
    };

    it('generates correct header row with five required columns', () => {
      const csv = generateBudgetCsv(mockBudget, 'USD');
      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('Category,Allocated,Spent,Remaining,Weight (%)');
    });

    it('generates category rows with formatted major units (minor / 100)', () => {
      const csv = generateBudgetCsv(mockBudget, 'USD');
      const lines = csv.split('\r\n');

      expect(lines[1]).toBe('Venue & Facilities,50000.00,20000.00,30000.00,50');
      expect(lines[2]).toBe("Catering & Beverages,40000.00,45000.00,'-5000.00,40");
    });

    it('includes all four required summary rows with accurate totals', () => {
      const csv = generateBudgetCsv(mockBudget, 'USD');
      const lines = csv.split('\r\n');

      // Total Budget row: 100,000.00 total, 65,000.00 spent, 35,000.00 remaining, 100%
      const totalRow = lines.find((l) => l.startsWith('Total Budget'));
      expect(totalRow).toBe('Total Budget,100000.00,65000.00,35000.00,100');

      // Contingency Reserve: 10% of 100,000.00 = 10,000.00
      const contingencyRow = lines.find((l) => l.startsWith('Contingency Reserve'));
      expect(contingencyRow).toBe('Contingency Reserve,10000.00,0.00,10000.00,10');

      // Net Spend: Allocated = 90,000.00, Spent = 65,000.00, Remaining = 25,000.00
      const netSpendRow = lines.find((l) => l.startsWith('Net Spend'));
      expect(netSpendRow).toBe('Net Spend,90000.00,65000.00,25000.00,');

      // Unspent: remaining from total budget = 35,000.00
      const unspentRow = lines.find((l) => l.startsWith('Unspent'));
      expect(unspentRow).toBe('Unspent,,,35000.00,');
    });
  });
});
