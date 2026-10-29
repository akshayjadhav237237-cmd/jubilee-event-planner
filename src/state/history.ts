import type { History } from './types';

const DEFAULT_MAX_HISTORY = 50;

/** Creates an immutable history container initialized with a present value. */
export function createHistory<T>(initial: T, max = DEFAULT_MAX_HISTORY): History<T> {
  const safeMax = max > 0 ? max : DEFAULT_MAX_HISTORY;
  return {
    past: [],
    present: initial,
    future: [],
    max: safeMax,
  };
}

/** Pushes a new state to history, trimming past to max bound and clearing future branch. */
export function pushHistory<T>(history: History<T>, next: T): History<T> {
  const combinedPast = [...history.past, history.present];
  const trimmedPast =
    combinedPast.length > history.max
      ? combinedPast.slice(combinedPast.length - history.max)
      : combinedPast;

  return {
    past: trimmedPast,
    present: next,
    future: [],
    max: history.max,
  };
}

/** Steps backward in history, returning previous state or current history if past is empty. */
export function undoHistory<T>(history: History<T>): History<T> {
  if (history.past.length === 0) {
    return history;
  }
  const previous = history.past[history.past.length - 1];
  if (previous === undefined) {
    return history;
  }
  const newPast = history.past.slice(0, history.past.length - 1);
  return {
    past: newPast,
    present: previous,
    future: [history.present, ...history.future],
    max: history.max,
  };
}

/** Steps forward in history, returning next future state or current history if future is empty. */
export function redoHistory<T>(history: History<T>): History<T> {
  if (history.future.length === 0) {
    return history;
  }
  const next = history.future[0];
  if (next === undefined) {
    return history;
  }
  const newFuture = history.future.slice(1);
  return {
    past: [...history.past, history.present],
    present: next,
    future: newFuture,
    max: history.max,
  };
}
