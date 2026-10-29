import { describe, it, expect } from 'vitest';
import { createCounterPort, generateDeterministicId } from '../../src/domain/ids';

describe('Deterministic ID generator', () => {
  it('increments sequentially starting from default value 1', () => {
    const counter = createCounterPort();
    expect(counter()).toBe(1);
    expect(counter()).toBe(2);
    expect(counter()).toBe(3);
  });

  it('increments sequentially starting from custom initial value', () => {
    const counter = createCounterPort(100);
    expect(counter()).toBe(100);
    expect(counter()).toBe(101);
  });

  it('generates deterministic IDs with given prefix', () => {
    const counter = createCounterPort(1);
    const id1 = generateDeterministicId('task', counter);
    const id2 = generateDeterministicId('task', counter);
    const id3 = generateDeterministicId('quote', counter);

    expect(id1).toBe('task-1');
    expect(id2).toBe('task-2');
    expect(id3).toBe('quote-3');
  });

  it('maintains independent counters for different port instances', () => {
    const counterA = createCounterPort(1);
    const counterB = createCounterPort(1);

    expect(generateDeterministicId('a', counterA)).toBe('a-1');
    expect(generateDeterministicId('b', counterB)).toBe('b-1');
    expect(generateDeterministicId('a', counterA)).toBe('a-2');
    expect(generateDeterministicId('b', counterB)).toBe('b-2');
  });
});
