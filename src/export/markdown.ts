import { startOfTodayUtc, type IsoDate } from '../domain/dates';
import type { Plan } from '../domain/types';
import {
  formatBudgetPillar,
  formatHeaderAndAdaptations,
  formatIdeasPillar,
  formatTimelinePillar,
  formatVendorsPillar,
} from './markdownSections';

/** Generates a complete comprehensive event planning brief formatted in Markdown. */
export function generateMarkdownBrief(plan: Plan, today?: IsoDate): string {
  const referenceDate = today ?? plan.createdAt ?? startOfTodayUtc();

  return [
    formatHeaderAndAdaptations(plan, referenceDate),
    '',
    formatBudgetPillar(plan),
    '',
    formatTimelinePillar(plan, referenceDate),
    '',
    formatVendorsPillar(plan),
    '',
    formatIdeasPillar(plan),
    '',
  ].join('\n');
}
