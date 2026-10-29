import { z } from 'zod';
import { AlertSchema, type Alert } from './alerts';

export type AdaptationId = string;

export type AdaptationEffects = {
  readonly contingencyDelta: number;
  readonly weightFactors: Partial<Record<string, number>>;
  readonly injectTaskIds: readonly string[];
  readonly vendorCheckIds: readonly string[];
  readonly alerts: readonly Alert[];
  readonly skipOptionalTasks: boolean;
  readonly compressTimeline: boolean;
};

export type Adaptation = {
  readonly id: AdaptationId;
  readonly ruleName: string;
  readonly reason: string;
  readonly effects: AdaptationEffects;
};

export const AdaptationEffectsSchema = z.object({
  contingencyDelta: z.number().int(),
  weightFactors: z.record(z.string(), z.number()),
  injectTaskIds: z.array(z.string()).readonly(),
  vendorCheckIds: z.array(z.string()).readonly(),
  alerts: z.array(AlertSchema).readonly(),
  skipOptionalTasks: z.boolean(),
  compressTimeline: z.boolean(),
});

export const AdaptationSchema = z.object({
  id: z.string().min(1),
  ruleName: z.string().min(1),
  reason: z.string().min(1),
  effects: AdaptationEffectsSchema,
});
