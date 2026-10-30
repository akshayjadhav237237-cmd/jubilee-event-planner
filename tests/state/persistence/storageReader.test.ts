import { describe, expect, it, vi } from 'vitest';
import * as PersistenceModule from '../../../src/state/persistence';
import { loadPlanFromStorage, resolveStorage } from '../../../src/state/persistence/storageReader';
import { STORAGE_KEY } from '../../../src/state/persistence/schema';
import { getStorageNotice } from '../../../src/state/persistence/notice';
import { createMockStorage } from './fixtures';

describe('StorageReader and edge cases', () => {
  it('returns STORAGE_UNAVAILABLE when storage.getItem throws', () => {
    const storage = createMockStorage();
    storage.getItem = () => {
      throw new Error('Access denied');
    };
    const result = loadPlanFromStorage(storage, STORAGE_KEY);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('STORAGE_UNAVAILABLE');
    }
  });

  it('returns CORRUPT_DATA when stored data has unsupported version', () => {
    const storage = createMockStorage({
      [STORAGE_KEY]: JSON.stringify({ version: 99, plan: {} }),
    });
    const result = loadPlanFromStorage(storage, STORAGE_KEY);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CORRUPT_DATA');
      expect(result.error.message).toContain('Unsupported storage version');
    }
  });

  it('returns CORRUPT_DATA when parsed JSON is primitive', () => {
    const storage = createMockStorage({ [STORAGE_KEY]: '12345' });
    const result = loadPlanFromStorage(storage, STORAGE_KEY);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CORRUPT_DATA');
    }
  });

  it('records notice and returns error when v1 migration fails on corrupted plan', () => {
    const storage = createMockStorage({
      [STORAGE_KEY]: JSON.stringify({ version: 1, plan: { brief: { eventDate: 'bad' } } }),
    });
    const result = loadPlanFromStorage(storage, STORAGE_KEY);
    expect(result.ok).toBe(false);
    expect(getStorageNotice()?.code).toBe('MIGRATION_FAILED');
  });

  it('records notice and returns error when v2 envelope fails schema validation', () => {
    const storage = createMockStorage({
      [STORAGE_KEY]: JSON.stringify({ version: 2, plan: { invalid: true } }),
    });
    const result = loadPlanFromStorage(storage, STORAGE_KEY);
    expect(result.ok).toBe(false);
    expect(getStorageNotice()?.code).toBe('CORRUPT_DATA');
  });

  it('resolveStorage selects provided storage or global fallback', () => {
    const custom = createMockStorage();
    expect(resolveStorage(custom)).toBe(custom);
    expect(resolveStorage()).not.toBeNull();
  });

  it('defaultScheduler triggers callback via setTimeout', async () => {
    let triggered = false;
    const cancel = PersistenceModule.defaultScheduler(() => {
      triggered = true;
    }, 10);

    expect(typeof cancel).toBe('function');
    await vi.waitFor(() => {
      expect(triggered).toBe(true);
    });
  });

  it('index exports all required persistence utilities and schemas', () => {
    expect(PersistenceModule.STORAGE_KEY).toBe('jubilee_plan_v2');
    expect(PersistenceModule.STORAGE_VERSION).toBe(2);
    expect(PersistenceModule.createLocalStoragePort).toBeDefined();
    expect(PersistenceModule.clearStorage).toBeDefined();
    expect(PersistenceModule.exportPlanToJson).toBeDefined();
    expect(PersistenceModule.importPlanFromJson).toBeDefined();
    expect(PersistenceModule.migrateV1ToV2).toBeDefined();
  });
});
