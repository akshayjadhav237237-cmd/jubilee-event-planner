import { z } from 'zod';

export type AlertSeverity = 'info' | 'warn' | 'critical';

export type AlertCode =
  | 'PER_HEAD_FLOOR_VIOLATION'
  | 'CONTINGENCY_CAPPED'
  | 'CATEGORY_OVER_ALLOCATED'
  | 'OVERSPENT_BUDGET'
  | 'UNALLOCATED_REMAINDER'
  | 'ADAPTATION_TRIGGERED'
  | string;

export type Alert = {
  readonly code: AlertCode;
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly categoryId?: string;
};

export const AlertSeveritySchema = z.enum(['info', 'warn', 'critical']);

export const AlertSchema = z.object({
  code: z.string().min(1),
  severity: AlertSeveritySchema,
  message: z.string().min(1),
  categoryId: z.string().min(1).optional(),
});
