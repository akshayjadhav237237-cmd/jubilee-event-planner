import type { Plan } from '../domain/types';
import type { CommandError } from '../domain/ports';
import type { PlanCommand } from '../domain/commands';
import { ok, type Result } from '../domain/result';
import {
  applyBriefCommand,
  applyBudgetCommand,
  applyIdeaCommand,
  applyTimelineCommand,
  applyVendorCommand,
} from './commandHandlers';

type OperationalCommand =
  | Extract<PlanCommand, { type: 'SET_BRIEF' }>
  | Extract<PlanCommand, { type: 'SET_CATEGORY_WEIGHT' }>
  | Extract<PlanCommand, { type: 'TRANSFER_BUDGET' }>
  | Extract<PlanCommand, { type: 'SET_CONTINGENCY' }>
  | Extract<PlanCommand, { type: 'LOG_SPEND' }>
  | Extract<PlanCommand, { type: 'TOGGLE_TASK' }>
  | Extract<PlanCommand, { type: 'RESCHEDULE_TASK' }>;

type ContentCommand = Exclude<PlanCommand, OperationalCommand>;

function isOperationalCommand(cmd: PlanCommand): cmd is OperationalCommand {
  switch (cmd.type) {
    case 'SET_BRIEF':
    case 'SET_CATEGORY_WEIGHT':
    case 'TRANSFER_BUDGET':
    case 'SET_CONTINGENCY':
    case 'LOG_SPEND':
    case 'TOGGLE_TASK':
    case 'RESCHEDULE_TASK':
      return true;
    default:
      return false;
  }
}

function applyOperationalCommand(plan: Plan, cmd: OperationalCommand): Result<Plan, CommandError> {
  switch (cmd.type) {
    case 'SET_BRIEF':
      return applyBriefCommand(plan, cmd);
    case 'SET_CATEGORY_WEIGHT':
    case 'TRANSFER_BUDGET':
    case 'SET_CONTINGENCY':
    case 'LOG_SPEND':
      return applyBudgetCommand(plan, cmd);
    case 'TOGGLE_TASK':
    case 'RESCHEDULE_TASK':
      return applyTimelineCommand(plan, cmd);
  }
}

function applyContentCommand(plan: Plan, cmd: ContentCommand): Result<Plan, CommandError> {
  switch (cmd.type) {
    case 'ADD_QUOTE':
    case 'REMOVE_QUOTE':
    case 'TOGGLE_CHECKLIST_ITEM':
      return applyVendorCommand(plan, cmd);
    case 'SAVE_IDEA':
    case 'REMOVE_IDEA':
      return applyIdeaCommand(plan, cmd);
  }
}

/** Applies a single domain command to a Plan, returning the updated Plan or a CommandError. */
export function applyCommand(plan: Plan, cmd: PlanCommand): Result<Plan, CommandError> {
  if (isOperationalCommand(cmd)) {
    return applyOperationalCommand(plan, cmd);
  }
  return applyContentCommand(plan, cmd);
}

/** Applies an array of commands sequentially and atomically; reverts completely if any fails. */
export function applyCommands(
  plan: Plan,
  cmds: readonly PlanCommand[],
): Result<Plan, CommandError> {
  let current = plan;
  for (const cmd of cmds) {
    const res = applyCommand(current, cmd);
    if (!res.ok) {
      return res;
    }
    current = res.value;
  }
  return ok(current);
}
