import { describe, it, expect } from 'vitest';
import { cx } from '../../src/shared/lib/cx';

describe('cx classnames utility', () => {
  it('joins regular class names with a space', () => {
    const result = cx('btn', 'btn-primary', 'active');
    expect(result).toBe('btn btn-primary active');
  });

  it('filters out falsy values', () => {
    const result = cx('btn', false, null, undefined, 'btn-large');
    expect(result).toBe('btn btn-large');
  });

  it('ignores empty strings and whitespace-only strings', () => {
    const result = cx('header', '', '   ', 'title');
    expect(result).toBe('header title');
  });

  it('trims leading and trailing spaces from classes', () => {
    const result = cx('  card  ', '  shadow ');
    expect(result).toBe('card shadow');
  });

  it('returns empty string when no arguments are passed', () => {
    expect(cx()).toBe('');
  });

  it('returns empty string when all arguments are falsy', () => {
    expect(cx(false, null, undefined, '')).toBe('');
  });
});
