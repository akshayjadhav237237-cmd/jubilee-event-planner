import { z } from 'zod';
import { parseIsoDate } from './dates';

export const IsoDateSchema = z.string().refine((val): boolean => parseIsoDate(val).ok, {
  message: 'Invalid ISO 8601 date string (YYYY-MM-DD)',
});

export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community']);

export const EventSettingSchema = z.enum(['indoor', 'outdoor', 'hybrid']);

export const EventFlagsSchema = z.object({
  kids: z.boolean(),
  elders: z.boolean(),
  dietary: z.boolean(),
  accessibility: z.boolean(),
  openBar: z.boolean(),
  amplifiedMusic: z.boolean(),
  surprise: z.boolean(),
});

export const EventBriefSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  eventType: EventTypeSchema,
  subFormat: z.string().min(1, 'Sub-format is required'),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1'),
  totalBudget: z.number().int().positive('Total budget must be a positive integer'),
  currency: z.string().min(1, 'Currency is required'),
  eventDate: IsoDateSchema,
  setting: EventSettingSchema,
  flags: EventFlagsSchema,
  top3Priorities: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]).readonly(),
});

export const CategoryAllocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  allocated: z.number().int().nonnegative('Allocated amount must be non-negative'),
  spent: z.number().int().nonnegative('Spent amount must be non-negative'),
  weight: z.number().nonnegative('Weight must be non-negative'),
});

export const BudgetStateSchema = z.object({
  categories: z.array(CategoryAllocationSchema).readonly(),
  contingencyRate: z.number().min(0).max(100, 'Contingency rate must be between 0 and 100'),
  totalBudget: z.number().int().nonnegative('Total budget must be non-negative'),
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  dueDate: IsoDateSchema,
  completed: z.boolean(),
  category: z.string().min(1),
  dependencies: z.array(z.string()).readonly(),
});

export const QuoteStatusSchema = z.enum(['draft', 'shortlisted', 'accepted', 'declined']);

export const VendorQuoteSchema = z.object({
  id: z.string().min(1),
  vendorName: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().int().nonnegative('Quote amount must be non-negative'),
  status: QuoteStatusSchema,
  notes: z.string(),
});

export const ChecklistItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  completed: z.boolean(),
  category: z.string().min(1),
  redFlags: z.array(z.string()).readonly(),
  questions: z.array(z.string()).readonly(),
});

export const IdeaCategorySchema = z.enum(['theme', 'menu', 'activity']);

export const IdeaItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: IdeaCategorySchema,
  description: z.string(),
  votes: z.number().int().nonnegative('Votes must be non-negative'),
});

export const PlanSchema = z.object({
  id: z.string().min(1),
  brief: EventBriefSchema,
  budget: BudgetStateSchema,
  timeline: z.array(TaskSchema).readonly(),
  vendorChecklist: z.array(ChecklistItemSchema).readonly(),
  quotes: z.array(VendorQuoteSchema).readonly(),
  ideas: z.array(IdeaItemSchema).readonly(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
