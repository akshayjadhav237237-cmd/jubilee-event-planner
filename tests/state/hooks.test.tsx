import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { createPlanStore } from '../../src/state/store';
import { createMemoryStorage } from '../../src/state/memoryStorage';
import {
  PlanStoreContext,
  usePlanStore,
  usePlan,
  useDispatch,
  useHistory,
} from '../../src/state/hooks';
import type { PlanStore } from '../../src/state/types';
import { makeBrief } from '../helpers/briefs';

function createTestStore(): PlanStore {
  return createPlanStore({
    storage: createMemoryStorage(),
    clock: () => new Date('2026-10-30T00:00:00Z'),
    ids: () => `id_${Math.random().toString(36).slice(2, 7)}`,
  });
}

function createWrapper(store: PlanStore) {
  return function StoreWrapper({ children }: { readonly children: ReactNode }) {
    return <PlanStoreContext.Provider value={store}>{children}</PlanStoreContext.Provider>;
  };
}

describe('State Hooks', () => {
  describe('usePlanStore', () => {
    it('throws error when accessed outside provider', () => {
      expect(() => renderHook(() => usePlanStore())).toThrow(
        'usePlanStore must be used within a PlanStoreContext.Provider',
      );
    });

    it('returns active plan store when within provider', () => {
      const store = createTestStore();
      const { result } = renderHook(() => usePlanStore(), { wrapper: createWrapper(store) });
      expect(result.current).toBe(store);
    });
  });

  describe('usePlan', () => {
    it('returns null when no plan has been created', () => {
      const store = createTestStore();
      const { result } = renderHook(() => usePlan(), { wrapper: createWrapper(store) });
      expect(result.current).toBeNull();
    });

    it('returns plan once created and updates synchronously on store change', () => {
      const store = createTestStore();
      const { result } = renderHook(() => usePlan(), { wrapper: createWrapper(store) });
      expect(result.current).toBeNull();

      act(() => {
        store.createPlan(makeBrief());
      });

      expect(result.current).not.toBeNull();
      expect(result.current?.brief.title).toBe(makeBrief().title);
    });
  });

  describe('useDispatch', () => {
    it('provides createPlan, dispatch, and dispatchMany actions', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useDispatch(), { wrapper: createWrapper(store) });

      let planResult: ReturnType<typeof result.current.createPlan> | undefined;
      act(() => {
        planResult = result.current.createPlan(makeBrief());
      });
      expect(planResult?.ok).toBe(true);
      expect(store.getState().history.present).not.toBeNull();

      act(() => {
        result.current.dispatch({ type: 'SET_CONTINGENCY', rate: 12 });
      });
      expect(store.getState().history.present?.budget.contingencyRate).toBe(12);

      act(() => {
        result.current.dispatchMany([{ type: 'SET_CONTINGENCY', rate: 15 }]);
      });
      expect(store.getState().history.present?.budget.contingencyRate).toBe(15);
    });
  });

  describe('useHistory', () => {
    it('tracks undo, redo, and reset accurately across history events', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useHistory(), { wrapper: createWrapper(store) });

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      act(() => {
        store.createPlan(makeBrief());
      });
      expect(result.current.canUndo).toBe(true);

      act(() => {
        store.dispatch({ type: 'SET_CONTINGENCY', rate: 15 });
      });
      expect(result.current.canUndo).toBe(true);

      let undoSuccess = false;
      act(() => {
        undoSuccess = result.current.undo();
      });
      expect(undoSuccess).toBe(true);
      expect(result.current.canRedo).toBe(true);

      let redoSuccess = false;
      act(() => {
        redoSuccess = result.current.redo();
      });
      expect(redoSuccess).toBe(true);
      expect(result.current.canRedo).toBe(false);

      act(() => {
        result.current.reset();
      });
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });
});
