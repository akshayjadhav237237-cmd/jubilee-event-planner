import type { PlanCommand } from '../../domain/commands';

function describeFinancialCommand(cmd: PlanCommand): string | null {
  switch (cmd.type) {
    case 'SET_BRIEF':
      return `Update celebration brief to "${cmd.brief.title}" (${cmd.brief.guestCount} guests, budget: ${(cmd.brief.totalBudget / 100).toLocaleString()} ${cmd.brief.currency}).`;
    case 'SET_CATEGORY_WEIGHT':
      return `Adjust budget category "${cmd.categoryId}" weight to ${cmd.weight}%.`;
    case 'TRANSFER_BUDGET':
      return `Transfer ${(cmd.amount / 100).toLocaleString()} from category "${cmd.fromCategoryId}" to "${cmd.toCategoryId}".`;
    case 'SET_CONTINGENCY':
      return `Update contingency reserve rate to ${cmd.rate}%.`;
    case 'LOG_SPEND':
      return `Log ${(cmd.amount / 100).toLocaleString()} actual spend against category "${cmd.categoryId}".`;
    default:
      return null;
  }
}

function describeOperationalCommand(cmd: PlanCommand): string {
  switch (cmd.type) {
    case 'TOGGLE_TASK':
      return `Toggle completion status for task "${cmd.taskId}".`;
    case 'RESCHEDULE_TASK':
      return `Reschedule task "${cmd.taskId}" due date to ${cmd.dueDate}.`;
    case 'ADD_QUOTE':
      return `Record vendor quote from "${cmd.quote.vendorName}" (${(cmd.quote.amount / 100).toLocaleString()}) for category "${cmd.quote.category}".`;
    case 'REMOVE_QUOTE':
      return `Remove vendor quote "${cmd.quoteId}".`;
    case 'TOGGLE_CHECKLIST_ITEM':
      return `Toggle vendor checklist item "${cmd.itemId}".`;
    case 'SAVE_IDEA':
      return `Save celebration idea "${cmd.idea.title}" (${cmd.idea.category}) to active plan.`;
    case 'REMOVE_IDEA':
      return `Remove celebration idea "${cmd.ideaId}" from active plan.`;
    default:
      return `Execute command ${(cmd as { type: string }).type}`;
  }
}

/** Generates a plain-language human-readable explanation of an atomic plan command. */
export function describeCommand(cmd: PlanCommand): string {
  const financial = describeFinancialCommand(cmd);
  if (financial !== null) {
    return financial;
  }
  return describeOperationalCommand(cmd);
}
