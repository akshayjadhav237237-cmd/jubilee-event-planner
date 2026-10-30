import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createLocalStoragePort,
  clearStorage,
} from '../../../src/state/persistence/localStoragePort';
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  MAX_STORAGE_BYTES,
} from '../../../src/state/persistence/schema';
import { getStorageNotice, clearStorageNotice } from '../../../src/state/persistence/notice';
import { createMockStorage, SAMPLE_VALID_PLAN, SAMPLE_V1_FIXTURE } from './fixtures';

describe('LocalStoragePort implementation', () => {
  beforeEach(() => {
    clearStorageNotice();
    vi.useRealTimers();
  });

  it('load returns ok(null) when key does not exist and sets no notice', () => {
    const storage = createMockStorage();
    const port = createLocalStoragePort({ storage });
    const result = port.load();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
    expect(getStorageNotice()).toBeNull();
  });

  it('load returns ok(plan) when valid v2 envelope is stored', () => {
    const envelope = { version: STORAGE_VERSION, plan: SAMPLE_VALID_PLAN };
    const storage = createMockStorage({ [STORAGE_KEY]: JSON.stringify(envelope) });
    const port = createLocalStoragePort({ storage });

    const result = port.load();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(SAMPLE_VALID_PLAN);
    }
    expect(getStorageNotice()).toBeNull();
  });

  it('load migrates legacy v1 envelope to v2 plan successfully', () => {
    const storage = createMockStorage({ [STORAGE_KEY]: JSON.stringify(SAMPLE_V1_FIXTURE) });
    const port = createLocalStoragePort({ storage });

    const result = port.load();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value?.id).toBe('legacy-plan-999');
      expect(result.value?.brief.flags.kids).toBe(false);
    }
  });

  it('load returns OVERSIZED_DATA error and records notice when stored data exceeds 1MB', () => {
    const hugeString = 'x'.repeat(MAX_STORAGE_BYTES + 5);
    const storage = createMockStorage({ [STORAGE_KEY]: hugeString });
    const port = createLocalStoragePort({ storage });

    const result = port.load();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('OVERSIZED_DATA');
      expect(result.error.message).toContain('1MB');
    }

    const notice = getStorageNotice();
    expect(notice?.code).toBe('OVERSIZED_DATA');
  });

  it('load returns CORRUPT_DATA error and records notice on invalid JSON or broken envelope', () => {
    const storage = createMockStorage({ [STORAGE_KEY]: '{ invalid json' });
    const port = createLocalStoragePort({ storage });

    const result = port.load();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CORRUPT_DATA');
    }

    const notice = getStorageNotice();
    expect(notice?.code).toBe('CORRUPT_DATA');
  });

  it('debounces save calls, canceling previous timers and executing only the latest save', () => {
    vi.useFakeTimers();
    const storage = createMockStorage();
    const port = createLocalStoragePort({ storage, delayMs: 250 });

    const saveResult1 = port.save({ ...SAMPLE_VALID_PLAN, id: 'plan_first' });
    expect(saveResult1.ok).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();

    vi.advanceTimersByTime(100);
    const saveResult2 = port.save({ ...SAMPLE_VALID_PLAN, id: 'plan_second' });
    expect(saveResult2.ok).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();

    vi.advanceTimersByTime(250);
    const written = storage.getItem(STORAGE_KEY);
    expect(written).not.toBeNull();
    if (written) {
      const parsed = JSON.parse(written) as { plan: { id: string } };
      expect(parsed.plan.id).toBe('plan_second');
    }
  });

  it('handles QuotaExceededError during save, returning error and recording notice', () => {
    const storage = createMockStorage();
    storage.setItem = () => {
      const quotaErr = new Error('The quota has been exceeded.');
      quotaErr.name = 'QuotaExceededError';
      throw quotaErr;
    };

    const immediateScheduler = (cb: () => void): (() => void) => {
      cb();
      return () => {};
    };

    const port = createLocalStoragePort({
      storage,
      scheduler: immediateScheduler,
    });

    const result = port.save(SAMPLE_VALID_PLAN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('QUOTA_EXCEEDED');
      expect(result.error.message).toContain('quota exceeded');
    }

    const notice = getStorageNotice();
    expect(notice?.code).toBe('QUOTA_EXCEEDED');
  });

  it('clearStorage removes the stored item from target storage', () => {
    const storage = createMockStorage({ [STORAGE_KEY]: '{"some":"data"}' });
    const result = clearStorage(storage);

    expect(result.ok).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clearStorage handles unexpected storage exceptions gracefully', () => {
    const storage = createMockStorage();
    storage.removeItem = () => {
      throw new Error('Storage write access denied');
    };

    const result = clearStorage(storage);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('STORAGE_ERROR');
    }
  });
});
