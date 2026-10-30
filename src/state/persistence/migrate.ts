import { PlanSchema } from '../../domain/schemas';
import type { BudgetState, EventBrief, Plan } from '../../domain/types';
import type { IsoDate } from '../../domain/dates';
import type { StorageError } from '../../domain/ports';
import { ok, err, type Result } from '../../domain/result';
import {
  asFlags,
  asInt,
  asPriorities,
  asString,
  isRecord,
  toCategory,
  toChecklistItem,
  toIdea,
  toQuote,
  toTask,
} from './migrateHelpers';

function extractPlanRecord(raw: unknown): Record<string, unknown> | null {
  if (!isRecord(raw)) {
    return null;
  }
  if (isRecord(raw.plan)) {
    return raw.plan;
  }
  return raw;
}

function migrateBrief(raw: Record<string, unknown>): EventBrief {
  const b = isRecord(raw.brief) ? raw.brief : {};
  const eventType =
    b.eventType === 'birthday' || b.eventType === 'community' ? b.eventType : 'wedding';
  const setting = b.setting === 'outdoor' || b.setting === 'hybrid' ? b.setting : 'indoor';

  return {
    title: asString(b.title, 'Celebration Plan'),
    eventType,
    subFormat: asString(b.subFormat, 'traditional'),
    guestCount: asInt(b.guestCount, 100),
    totalBudget: asInt(b.totalBudget, 10000000),
    currency: asString(b.currency, 'INR'),
    eventDate: asString(b.eventDate, '2027-01-01') as IsoDate,
    setting,
    flags: asFlags(b.flags),
    top3Priorities: asPriorities(b.top3Priorities),
  };
}

function migrateBudget(raw: Record<string, unknown>, fallbackBudget: number): BudgetState {
  const b = isRecord(raw.budget) ? raw.budget : {};
  const rawCats = Array.isArray(b.categories) ? b.categories : [];
  const categories = rawCats.map(toCategory);
  const contingencyRate = asInt(b.contingencyRate, 10);
  const totalBudget = asInt(b.totalBudget, fallbackBudget);
  return { categories, contingencyRate, totalBudget };
}

/** Migrates legacy version 1 plan data into current version 2 Plan format. */
export function migrateV1ToV2(v1Data: unknown): Result<Plan, StorageError> {
  const data = extractPlanRecord(v1Data);
  if (!data) {
    return err({
      code: 'MIGRATION_FAILED',
      message: 'Invalid v1 plan data: expected object',
    });
  }

  const brief = migrateBrief(data);
  const budget = migrateBudget(data, brief.totalBudget);
  const timeline = Array.isArray(data.timeline) ? data.timeline.map(toTask) : [];
  const vendorChecklist = Array.isArray(data.vendorChecklist)
    ? data.vendorChecklist.map(toChecklistItem)
    : [];
  const quotes = Array.isArray(data.quotes) ? data.quotes.map(toQuote) : [];
  const ideas = Array.isArray(data.ideas) ? data.ideas.map(toIdea) : [];

  const candidate: Plan = {
    id: asString(data.id, 'migrated_plan_1'),
    brief,
    budget,
    timeline,
    vendorChecklist,
    quotes,
    ideas,
    createdAt: asString(data.createdAt, brief.eventDate) as IsoDate,
    updatedAt: asString(data.updatedAt, brief.eventDate) as IsoDate,
  };

  const parsed = PlanSchema.safeParse(candidate);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return err({
      code: 'MIGRATION_FAILED',
      message: firstIssue ? firstIssue.message : 'Failed to validate migrated plan',
    });
  }

  return ok(parsed.data);
}
