import { describe, it, expect } from 'vitest';
import { assertNever, err, isOk, mapResult, ok, type Result } from '../../src/shared/result';

describe('Result utilities', () => {
  it('creates an Ok result with the given value', () => {
    const res = ok(42);
    expect(res.ok).toBe(true);
    expect(res.value).toBe(42);
  });

  it('creates an Err result with the given error', () => {
    const res = err('something failed');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('something failed');
  });

  it('correctly discriminates with isOk type guard', () => {
    const success: Result<number, string> = ok(10);
    const failure: Result<number, string> = err('failed');

    expect(isOk(success)).toBe(true);
    expect(isOk(failure)).toBe(false);

    if (isOk(success)) {
      expect(success.value).toBe(10);
    }
  });

  it('maps an Ok value to a new value', () => {
    const initial: Result<number, string> = ok(5);
    const mapped = mapResult(initial, (v) => v * 2);

    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(10);
    }
  });

  it('does not map an Err value and returns it unchanged', () => {
    const initial: Result<number, string> = err('bad input');
    const mapped = mapResult(initial, (v: number) => v * 2);

    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe('bad input');
    }
  });

  it('throws in assertNever with default and custom messages', () => {
    const unreachableVal = 'mystery' as never;
    expect(() => assertNever(unreachableVal)).toThrow('Unexpected unreachable value: mystery');
    expect(() => assertNever(unreachableVal, 'Custom error')).toThrow('Custom error: mystery');
  });
});
