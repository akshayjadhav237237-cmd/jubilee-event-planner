import type { EventBrief, EventType, IdeaCategory, IdeaItem } from '../types';

/** Template for an event idea stored in the static catalog. */
export type IdeaTemplate = {
  readonly id: string;
  readonly eventType: EventType;
  readonly category: IdeaCategory;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
};

/** Budget tier classification for deterministic idea matching. */
export type BudgetTier = 'budget_modest' | 'budget_premium';

/** Options for selecting and filtering ideas. */
export type SelectIdeasOptions = {
  readonly limit?: number;
  readonly search?: string;
  readonly catalog?: readonly IdeaTemplate[];
};

/** Scored idea template paired with its calculated relevance score. */
export type ScoredIdea = {
  readonly template: IdeaTemplate;
  readonly score: number;
};

export type { IdeaItem, EventBrief };
