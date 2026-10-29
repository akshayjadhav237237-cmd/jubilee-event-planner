import { z } from 'zod';
import type { Result } from './result';
import type { Plan } from './types';

export type CategoryId = string;

export type ClockPort = () => Date;

export type IdPort = () => string;

export type StorageError = {
  readonly code: string;
  readonly message: string;
};

export type CommandError = {
  readonly code: string;
  readonly message: string;
};

export type StoragePort = {
  readonly load: () => Result<Plan | null, StorageError>;
  readonly save: (plan: Plan) => Result<void, StorageError>;
};

export const StorageErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export const CommandErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});
