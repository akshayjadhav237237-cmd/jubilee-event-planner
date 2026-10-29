import type { StoreApi } from 'zustand/vanilla';
import type { EventBrief, Plan } from '../domain/types';
import type { CommandError } from '../domain/ports';
import type { PlanCommand } from '../domain/commands';
import type { Result } from '../domain/result';

export type History<T> = {
  readonly past: readonly T[];
  readonly present: T;
  readonly future: readonly T[];
  readonly max: number;
};

export type PlanStoreState = {
  readonly history: History<Plan | null>;
};

export type PlanStoreActions = {
  readonly createPlan: (brief: EventBrief) => Result<Plan, CommandError>;
  readonly dispatch: (cmd: PlanCommand) => Result<Plan, CommandError>;
  readonly dispatchMany: (cmds: readonly PlanCommand[]) => Result<Plan, CommandError>;
  readonly undo: () => boolean;
  readonly redo: () => boolean;
  readonly reset: () => void;
  readonly getPlan: () => Plan | null;
};

export type PlanStoreValue = PlanStoreState & PlanStoreActions;

export type PlanStore = StoreApi<PlanStoreValue> & PlanStoreActions;
