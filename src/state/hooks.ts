import { createContext, useContext, useSyncExternalStore } from 'react';
import type { Plan } from '../domain/types';
import type { PlanStore, PlanStoreActions } from './types';

export const PlanStoreContext = createContext<PlanStore | null>(null);

export type DispatchActions = {
  readonly dispatch: PlanStoreActions['dispatch'];
  readonly dispatchMany: PlanStoreActions['dispatchMany'];
  readonly createPlan: PlanStoreActions['createPlan'];
  readonly restorePlan: PlanStoreActions['restorePlan'];
  readonly reset: PlanStoreActions['reset'];
};

export type HistoryState = {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly undo: () => boolean;
  readonly redo: () => boolean;
  readonly reset: () => void;
};

/** Returns the active PlanStore instance from React context. */
export function usePlanStore(): PlanStore {
  const store = useContext(PlanStoreContext);
  if (!store) {
    throw new Error('usePlanStore must be used within a PlanStoreContext.Provider');
  }
  return store;
}

/** Subscribes to the active plan in the store, returning the present plan or null. */
export function usePlan(): Plan | null {
  const store = usePlanStore();
  return useSyncExternalStore(store.subscribe, () => store.getState().history.present);
}

/** Returns the dispatching action methods from the active plan store. */
export function useDispatch(): DispatchActions {
  const store = usePlanStore();
  return {
    dispatch: store.dispatch,
    dispatchMany: store.dispatchMany,
    createPlan: store.createPlan,
    restorePlan: store.restorePlan,
    reset: store.reset,
  };
}

/** Subscribes to the undo/redo history state and exposes navigation actions. */
export function useHistory(): HistoryState {
  const store = usePlanStore();
  const history = useSyncExternalStore(store.subscribe, () => store.getState().history);
  return {
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo: store.undo,
    redo: store.redo,
    reset: store.reset,
  };
}
