import { daysBetween, type IsoDate, startOfTodayUtc } from '../domain/dates';
import type { EventFlags, Plan } from '../domain/types';

export interface AiContextCategory {
  readonly id: string;
  readonly name: string;
  readonly weight: number;
  readonly allocatedMinor: number;
}

export interface AiContextTask {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly phase?: string;
}

export interface AiContext {
  readonly eventType: string;
  readonly subFormat: string;
  readonly guestCount: number;
  readonly currency: string;
  readonly totalBudget: number;
  readonly setting: string;
  readonly flags: EventFlags;
  readonly priorities: readonly string[];
  readonly daysUntilEvent: number;
  readonly categories: readonly AiContextCategory[];
  readonly tasks: readonly AiContextTask[];
}

function mapCategories(plan: Plan): readonly AiContextCategory[] {
  return plan.budget.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    weight: cat.weight,
    allocatedMinor: cat.allocated,
  }));
}

function mapTasks(plan: Plan): readonly AiContextTask[] {
  return plan.timeline.map((task) => ({
    id: task.id,
    title: task.title,
    completed: task.completed,
  }));
}

/** Builds an anonymized AI context from a plan, withholding all private data. */
export function buildAiContext(plan: Plan, today?: IsoDate): AiContext {
  const referenceDate = today ?? startOfTodayUtc();
  const daysUntilEvent = daysBetween(referenceDate, plan.brief.eventDate);

  return {
    eventType: plan.brief.eventType,
    subFormat: plan.brief.subFormat,
    guestCount: plan.brief.guestCount,
    currency: plan.brief.currency,
    totalBudget: plan.brief.totalBudget,
    setting: plan.brief.setting,
    flags: plan.brief.flags,
    priorities: plan.brief.top3Priorities,
    daysUntilEvent,
    categories: mapCategories(plan),
    tasks: mapTasks(plan),
  };
}
