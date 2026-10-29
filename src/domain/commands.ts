import { z } from 'zod';
import { EventBriefSchema, IdeaItemSchema, IsoDateSchema, VendorQuoteSchema } from './schemas';

export const SetBriefCommandSchema = z.object({
  type: z.literal('SET_BRIEF'),
  brief: EventBriefSchema,
});

export const SetCategoryWeightCommandSchema = z.object({
  type: z.literal('SET_CATEGORY_WEIGHT'),
  categoryId: z.string().min(1),
  weight: z.number().nonnegative(),
});

export const TransferBudgetCommandSchema = z.object({
  type: z.literal('TRANSFER_BUDGET'),
  fromCategoryId: z.string().min(1),
  toCategoryId: z.string().min(1),
  amount: z.number().int().positive(),
});

export const SetContingencyCommandSchema = z.object({
  type: z.literal('SET_CONTINGENCY'),
  rate: z.number().min(0).max(100),
});

export const LogSpendCommandSchema = z.object({
  type: z.literal('LOG_SPEND'),
  categoryId: z.string().min(1),
  amount: z.number().int(),
});

export const ToggleTaskCommandSchema = z.object({
  type: z.literal('TOGGLE_TASK'),
  taskId: z.string().min(1),
});

export const RescheduleTaskCommandSchema = z.object({
  type: z.literal('RESCHEDULE_TASK'),
  taskId: z.string().min(1),
  dueDate: IsoDateSchema,
});

export const AddQuoteCommandSchema = z.object({
  type: z.literal('ADD_QUOTE'),
  quote: VendorQuoteSchema,
});

export const RemoveQuoteCommandSchema = z.object({
  type: z.literal('REMOVE_QUOTE'),
  quoteId: z.string().min(1),
});

export const ToggleChecklistItemCommandSchema = z.object({
  type: z.literal('TOGGLE_CHECKLIST_ITEM'),
  itemId: z.string().min(1),
});

export const SaveIdeaCommandSchema = z.object({
  type: z.literal('SAVE_IDEA'),
  idea: IdeaItemSchema,
});

export const RemoveIdeaCommandSchema = z.object({
  type: z.literal('REMOVE_IDEA'),
  ideaId: z.string().min(1),
});

export const PlanCommandSchema = z.discriminatedUnion('type', [
  SetBriefCommandSchema,
  SetCategoryWeightCommandSchema,
  TransferBudgetCommandSchema,
  SetContingencyCommandSchema,
  LogSpendCommandSchema,
  ToggleTaskCommandSchema,
  RescheduleTaskCommandSchema,
  AddQuoteCommandSchema,
  RemoveQuoteCommandSchema,
  ToggleChecklistItemCommandSchema,
  SaveIdeaCommandSchema,
  RemoveIdeaCommandSchema,
]);

export type SetBriefCommand = z.infer<typeof SetBriefCommandSchema>;
export type SetCategoryWeightCommand = z.infer<typeof SetCategoryWeightCommandSchema>;
export type TransferBudgetCommand = z.infer<typeof TransferBudgetCommandSchema>;
export type SetContingencyCommand = z.infer<typeof SetContingencyCommandSchema>;
export type LogSpendCommand = z.infer<typeof LogSpendCommandSchema>;
export type ToggleTaskCommand = z.infer<typeof ToggleTaskCommandSchema>;
export type RescheduleTaskCommand = z.infer<typeof RescheduleTaskCommandSchema>;
export type AddQuoteCommand = z.infer<typeof AddQuoteCommandSchema>;
export type RemoveQuoteCommand = z.infer<typeof RemoveQuoteCommandSchema>;
export type ToggleChecklistItemCommand = z.infer<typeof ToggleChecklistItemCommandSchema>;
export type SaveIdeaCommand = z.infer<typeof SaveIdeaCommandSchema>;
export type RemoveIdeaCommand = z.infer<typeof RemoveIdeaCommandSchema>;

export type PlanCommand = z.infer<typeof PlanCommandSchema>;

export const CommandListSchema = z.array(PlanCommandSchema).max(12);

export type CommandList = z.infer<typeof CommandListSchema>;

/** Asserts compile-time exhaustive checking for discriminated command unions. */
export function assertNever(x: never, message = 'Unhandled command type'): never {
  throw new Error(`${message}: ${String(x)}`);
}
