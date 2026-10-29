import { describe, it, expect } from 'vitest';
import { allocateLargestRemainder, formatMoney, parseMoney } from '../../src/domain/money';

function createSeededRng(initialSeed = 123456789): () => number {
  let s = initialSeed;
  return function next(): number {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('Money utilities', () => {
  describe('allocateLargestRemainder', () => {
    it('returns empty array when weights are empty', () => {
      expect(allocateLargestRemainder(1000, [])).toEqual([]);
    });

    it('returns zeros when total is zero or negative', () => {
      expect(allocateLargestRemainder(0, [10, 20])).toEqual([0, 0]);
      expect(allocateLargestRemainder(-100, [10, 20])).toEqual([0, 0]);
    });

    it('handles all zero or negative weights with balanced allocation', () => {
      const res = allocateLargestRemainder(100, [0, 0]);
      expect(res).toEqual([50, 50]);
      expect(res.reduce((a, b) => a + b, 0)).toBe(100);
    });

    it('allocates remainders by largest fraction accurately', () => {
      const res = allocateLargestRemainder(100, [1, 1, 1]);
      expect(res).toEqual([34, 33, 33]);
      expect(res.reduce((a, b) => a + b, 0)).toBe(100);
    });

    it('preserves sum invariant over 100 randomized seeded weight runs', () => {
      const rng = createSeededRng(42);
      for (let run = 0; run < 100; run += 1) {
        const total = Math.floor(rng() * 1000000) + 1;
        const count = Math.floor(rng() * 8) + 2;
        const weights: number[] = [];
        for (let c = 0; c < count; c += 1) {
          weights.push(Math.floor(rng() * 100) + 1);
        }
        const allocations = allocateLargestRemainder(total, weights);
        const sum = allocations.reduce((acc, v) => acc + v, 0);
        expect(sum).toBe(total);
      }
    });
  });

  describe('formatMoney', () => {
    it('formats USD currency correctly', () => {
      const formatted = formatMoney(123456, 'USD', 'en-US');
      expect(formatted).toContain('1,234.56');
    });

    it('formats EUR currency correctly', () => {
      const formatted = formatMoney(5000, 'EUR', 'en-US');
      expect(formatted).toContain('50.00');
    });

    it('formats INR currency correctly', () => {
      const formatted = formatMoney(10000000, 'INR', 'en-IN');
      expect(formatted).toContain('1,00,000.00');
    });

    it('formats zero minor units correctly', () => {
      const formatted = formatMoney(0, 'USD', 'en-US');
      expect(formatted).toContain('0.00');
    });
  });

  describe('parseMoney', () => {
    it('parses valid integer and decimal amounts into minor units', () => {
      expect(parseMoney('100')).toEqual({ ok: true, value: 10000 });
      expect(parseMoney('100.5')).toEqual({ ok: true, value: 10050 });
      expect(parseMoney('100.50')).toEqual({ ok: true, value: 10050 });
      expect(parseMoney('0.05')).toEqual({ ok: true, value: 5 });
    });

    it('strips currency symbols and commas cleanly', () => {
      expect(parseMoney('$100.50')).toEqual({ ok: true, value: 10050 });
      expect(parseMoney('₹1,500.25')).toEqual({ ok: true, value: 150025 });
      expect(parseMoney('€ 2,000.00')).toEqual({ ok: true, value: 200000 });
      expect(parseMoney('£50')).toEqual({ ok: true, value: 5000 });
    });

    it('rejects invalid, negative, or malformed inputs', () => {
      expect(parseMoney('-50').ok).toBe(false);
      expect(parseMoney('abc').ok).toBe(false);
      expect(parseMoney('').ok).toBe(false);
      expect(parseMoney('   ').ok).toBe(false);
      expect(parseMoney('10.555').ok).toBe(false);
      expect(parseMoney('10.5.5').ok).toBe(false);
      expect(parseMoney(123 as unknown as string).ok).toBe(false);
      expect(parseMoney('100', 123 as unknown as string).ok).toBe(false);
      expect(parseMoney('100', '').ok).toBe(false);
      expect(parseMoney('999999999999999999999999999999').ok).toBe(false);
    });
  });
});
