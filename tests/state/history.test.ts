import { describe, expect, it } from 'vitest';
import { createHistory, pushHistory, redoHistory, undoHistory } from '../../src/state/history';

describe('History state container', () => {
  it('creates history with initial value and empty past/future', () => {
    const history = createHistory('initial');
    expect(history.present).toBe('initial');
    expect(history.past).toEqual([]);
    expect(history.future).toEqual([]);
    expect(history.max).toBe(50);
  });

  it('pushes new state, appends present to past, and clears future', () => {
    const h0 = createHistory('step-0');
    const h1 = pushHistory(h0, 'step-1');
    expect(h1.present).toBe('step-1');
    expect(h1.past).toEqual(['step-0']);
    expect(h1.future).toEqual([]);

    const h2 = pushHistory(h1, 'step-2');
    expect(h2.present).toBe('step-2');
    expect(h2.past).toEqual(['step-0', 'step-1']);

    const undone = undoHistory(h2);
    expect(undone.present).toBe('step-1');
    expect(undone.future).toEqual(['step-2']);

    const h3 = pushHistory(undone, 'step-branch');
    expect(h3.present).toBe('step-branch');
    expect(h3.past).toEqual(['step-0', 'step-1']);
    expect(h3.future).toEqual([]);
  });

  it('undoes back to previous state and adds to future', () => {
    const h = pushHistory(pushHistory(createHistory('a'), 'b'), 'c');
    const u1 = undoHistory(h);
    expect(u1.present).toBe('b');
    expect(u1.future).toEqual(['c']);
    expect(u1.past).toEqual(['a']);

    const u2 = undoHistory(u1);
    expect(u2.present).toBe('a');
    expect(u2.future).toEqual(['b', 'c']);
    expect(u2.past).toEqual([]);

    const u3 = undoHistory(u2);
    expect(u3.present).toBe('a');
    expect(u3.past).toEqual([]);
    expect(u3.future).toEqual(['b', 'c']);
  });

  it('redoes forward from future into past', () => {
    const h = pushHistory(pushHistory(createHistory('a'), 'b'), 'c');
    const u2 = undoHistory(undoHistory(h));

    const r1 = redoHistory(u2);
    expect(r1.present).toBe('b');
    expect(r1.past).toEqual(['a']);
    expect(r1.future).toEqual(['c']);

    const r2 = redoHistory(r1);
    expect(r2.present).toBe('c');
    expect(r2.past).toEqual(['a', 'b']);
    expect(r2.future).toEqual([]);

    const r3 = redoHistory(r2);
    expect(r3.present).toBe('c');
    expect(r3.future).toEqual([]);
  });

  it('enforces maximum history size bound at 50 by default', () => {
    let h = createHistory(0);
    for (let i = 1; i <= 60; i += 1) {
      h = pushHistory(h, i);
    }
    expect(h.present).toBe(60);
    expect(h.past.length).toBe(50);
    expect(h.past[0]).toBe(10);
    expect(h.past[49]).toBe(59);
  });

  it('respects custom max bound when specified', () => {
    let h = createHistory('v0', 3);
    expect(h.max).toBe(3);
    h = pushHistory(h, 'v1');
    h = pushHistory(h, 'v2');
    h = pushHistory(h, 'v3');
    h = pushHistory(h, 'v4');
    expect(h.present).toBe('v4');
    expect(h.past.length).toBe(3);
    expect(h.past).toEqual(['v1', 'v2', 'v3']);
  });
});
