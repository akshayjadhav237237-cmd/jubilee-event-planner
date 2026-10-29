import type { EventType, CategoryAllocation, BudgetState } from '../types';
import type { Alert } from '../alerts';
import type { AdaptationEffects } from '../adaptationTypes';

export type CategoryItem = {
  readonly id: string;
  readonly name: string;
  readonly eventTypes: readonly EventType[];
};

export type { CategoryAllocation, BudgetState, Alert, AdaptationEffects };
