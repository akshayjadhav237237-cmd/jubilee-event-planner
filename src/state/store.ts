import { createStore } from 'zustand/vanilla';
import type { Plan, EventBrief } from '../domain/types';
import type { StoragePort, ClockPort, IdPort, CommandError } from '../domain/ports';
import type { PlanCommand } from '../domain/commands';
import { ok, err, type Result } from '../domain/result';
import { createHistory, pushHistory, undoHistory, redoHistory } from './history';
import { applyCommand, applyCommands } from './reducer';
import { buildPlan } from './buildPlan';
import type { PlanStore, PlanStoreValue, PlanStoreActions } from './types';

export type PlanStoreDependencies = {
  readonly storage: StoragePort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
};

type StoreSet = (
  next: Partial<PlanStoreValue> | ((prev: PlanStoreValue) => Partial<PlanStoreValue>),
) => void;

type StoreGet = () => PlanStoreValue;

function createDispatchActions(
  deps: PlanStoreDependencies,
  set: StoreSet,
  get: StoreGet,
): Pick<PlanStoreActions, 'dispatch' | 'dispatchMany'> {
  return {
    dispatch: (cmd: PlanCommand): Result<Plan, CommandError> => {
      const current = get().history.present;
      if (current === null) {
        return err({
          code: 'NO_ACTIVE_PLAN',
          message: 'Cannot dispatch command without an active plan',
        });
      }
      const res = applyCommand(current, cmd);
      if (!res.ok) {
        return res;
      }
      set((prev) => ({ history: pushHistory(prev.history, res.value) }));
      deps.storage.save(res.value);
      return res;
    },
    dispatchMany: (cmds: readonly PlanCommand[]): Result<Plan, CommandError> => {
      const current = get().history.present;
      if (current === null) {
        return err({
          code: 'NO_ACTIVE_PLAN',
          message: 'Cannot dispatch commands without an active plan',
        });
      }
      const res = applyCommands(current, cmds);
      if (!res.ok) {
        return res;
      }
      set((prev) => ({ history: pushHistory(prev.history, res.value) }));
      deps.storage.save(res.value);
      return res;
    },
  };
}

function createHistoryActions(
  deps: PlanStoreDependencies,
  set: StoreSet,
  get: StoreGet,
): Pick<PlanStoreActions, 'undo' | 'redo' | 'reset' | 'getPlan'> {
  return {
    undo: (): boolean => {
      const currentHistory = get().history;
      if (currentHistory.past.length === 0) {
        return false;
      }
      const next = undoHistory(currentHistory);
      set({ history: next });
      if (next.present !== null) {
        deps.storage.save(next.present);
      }
      return true;
    },
    redo: (): boolean => {
      const currentHistory = get().history;
      if (currentHistory.future.length === 0) {
        return false;
      }
      const next = redoHistory(currentHistory);
      set({ history: next });
      if (next.present !== null) {
        deps.storage.save(next.present);
      }
      return true;
    },
    reset: (): void => {
      set({ history: createHistory<Plan | null>(null) });
    },
    getPlan: (): Plan | null => get().history.present,
  };
}

function createStoreActions(
  deps: PlanStoreDependencies,
  set: StoreSet,
  get: StoreGet,
): PlanStoreActions {
  return {
    createPlan: (brief: EventBrief): Result<Plan, CommandError> => {
      const plan = buildPlan(brief, { clock: deps.clock, ids: deps.ids });
      set((prev) => ({ history: pushHistory(prev.history, plan) }));
      deps.storage.save(plan);
      return ok(plan);
    },
    ...createDispatchActions(deps, set, get),
    ...createHistoryActions(deps, set, get),
  };
}

/** Creates a reactive Zustand vanilla store managing plan state, undo/redo history, and persistence. */
export function createPlanStore(deps: PlanStoreDependencies): PlanStore {
  const loadRes = deps.storage.load();
  const initialPlan = loadRes.ok ? loadRes.value : null;

  const vanillaStore = createStore<PlanStoreValue>((set, get) => ({
    history: createHistory<Plan | null>(initialPlan),
    ...createStoreActions(deps, set, get),
  }));

  return Object.assign(vanillaStore, {
    createPlan: (brief: EventBrief): Result<Plan, CommandError> =>
      vanillaStore.getState().createPlan(brief),
    dispatch: (cmd: PlanCommand): Result<Plan, CommandError> =>
      vanillaStore.getState().dispatch(cmd),
    dispatchMany: (cmds: readonly PlanCommand[]): Result<Plan, CommandError> =>
      vanillaStore.getState().dispatchMany(cmds),
    undo: (): boolean => vanillaStore.getState().undo(),
    redo: (): boolean => vanillaStore.getState().redo(),
    reset: (): void => vanillaStore.getState().reset(),
    getPlan: (): Plan | null => vanillaStore.getState().getPlan(),
  });
}
