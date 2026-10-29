import { z } from 'zod';

export type TaskTemplate = {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly daysBeforeEvent: number;
  readonly phase: string;
  readonly optional: boolean;
  readonly dependencies: readonly string[];
  readonly adaptationId?: string;
};

export const TaskTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  daysBeforeEvent: z.number().int(),
  phase: z.string().min(1),
  optional: z.boolean(),
  dependencies: z.array(z.string()).readonly(),
  adaptationId: z.string().min(1).optional(),
});
