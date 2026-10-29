import type { Plan } from '../domain/types';
import type { CommandError } from '../domain/ports';
import { ok, err, type Result } from '../domain/result';
import { startOfTodayUtc } from '../domain/dates';
import { setCategoryWeight, transferBudget, setContingency, logSpend } from '../domain/budget';
import { toggleTask, rescheduleTask } from '../domain/timeline';
import { addQuote, removeQuote, toggleChecklistItem, type VendorState } from '../domain/vendors';
import type {
  SetBriefCommand,
  SetCategoryWeightCommand,
  TransferBudgetCommand,
  SetContingencyCommand,
  LogSpendCommand,
  ToggleTaskCommand,
  RescheduleTaskCommand,
  AddQuoteCommand,
  RemoveQuoteCommand,
  ToggleChecklistItemCommand,
  SaveIdeaCommand,
  RemoveIdeaCommand,
} from '../domain/commands';

export type BudgetPlanCommand =
  SetCategoryWeightCommand | TransferBudgetCommand | SetContingencyCommand | LogSpendCommand;

export type TimelinePlanCommand = ToggleTaskCommand | RescheduleTaskCommand;

export type VendorPlanCommand = AddQuoteCommand | RemoveQuoteCommand | ToggleChecklistItemCommand;

export type IdeaPlanCommand = SaveIdeaCommand | RemoveIdeaCommand;

/** Handles SET_BRIEF command, updating brief and timestamp. */
export function applyBriefCommand(plan: Plan, cmd: SetBriefCommand): Result<Plan, CommandError> {
  return ok({
    ...plan,
    brief: cmd.brief,
    updatedAt: startOfTodayUtc(),
  });
}

/** Handles all budget category, transfer, contingency, and spend commands. */
export function applyBudgetCommand(plan: Plan, cmd: BudgetPlanCommand): Result<Plan, CommandError> {
  switch (cmd.type) {
    case 'SET_CATEGORY_WEIGHT':
      return ok({
        ...plan,
        budget: setCategoryWeight(plan.budget, cmd.categoryId, cmd.weight),
      });
    case 'TRANSFER_BUDGET':
      return ok({
        ...plan,
        budget: transferBudget(plan.budget, cmd.fromCategoryId, cmd.toCategoryId, cmd.amount),
      });
    case 'SET_CONTINGENCY':
      return ok({
        ...plan,
        budget: setContingency(plan.budget, cmd.rate),
      });
    case 'LOG_SPEND':
      return ok({
        ...plan,
        budget: logSpend(plan.budget, cmd.categoryId, cmd.amount),
      });
  }
}

/** Handles task completion toggle and reschedule commands. */
export function applyTimelineCommand(
  plan: Plan,
  cmd: TimelinePlanCommand,
): Result<Plan, CommandError> {
  switch (cmd.type) {
    case 'TOGGLE_TASK':
      return ok({
        ...plan,
        timeline: toggleTask(plan.timeline, cmd.taskId),
      });
    case 'RESCHEDULE_TASK': {
      const res = rescheduleTask(plan.timeline, cmd.taskId, cmd.dueDate);
      if (!res.ok) {
        return err({
          code: 'RESCHEDULE_TASK_FAILED',
          message: res.error,
        });
      }
      return ok({
        ...plan,
        timeline: res.value,
      });
    }
  }
}

/** Handles vendor quotes and checklist item interactions. */
export function applyVendorCommand(plan: Plan, cmd: VendorPlanCommand): Result<Plan, CommandError> {
  const currentVendorState: VendorState = {
    guides: [],
    checklist: plan.vendorChecklist,
    quotes: plan.quotes,
  };

  switch (cmd.type) {
    case 'ADD_QUOTE': {
      const updated = addQuote(currentVendorState, cmd.quote);
      return ok({
        ...plan,
        quotes: updated.quotes,
      });
    }
    case 'REMOVE_QUOTE': {
      const updated = removeQuote(currentVendorState, cmd.quoteId);
      return ok({
        ...plan,
        quotes: updated.quotes,
      });
    }
    case 'TOGGLE_CHECKLIST_ITEM': {
      const updated = toggleChecklistItem(currentVendorState, cmd.itemId);
      return ok({
        ...plan,
        vendorChecklist: updated.checklist,
      });
    }
  }
}

/** Handles saving and removing personalized ideas. */
export function applyIdeaCommand(plan: Plan, cmd: IdeaPlanCommand): Result<Plan, CommandError> {
  switch (cmd.type) {
    case 'SAVE_IDEA': {
      const existingIdx = plan.ideas.findIndex((item) => item.id === cmd.idea.id);
      const ideas =
        existingIdx >= 0
          ? plan.ideas.map((item, idx) => (idx === existingIdx ? cmd.idea : item))
          : [...plan.ideas, cmd.idea];
      return ok({
        ...plan,
        ideas,
      });
    }
    case 'REMOVE_IDEA':
      return ok({
        ...plan,
        ideas: plan.ideas.filter((item) => item.id !== cmd.ideaId),
      });
  }
}
