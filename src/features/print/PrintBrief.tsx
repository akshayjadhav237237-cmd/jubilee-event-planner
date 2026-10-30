import type { JSX } from 'react';
import type { Plan } from '../../domain/types';
import { startOfTodayUtc, type IsoDate } from '../../domain/dates';
import { PrintHeader, PrintBudgetSection, PrintTimelineSection } from './PrintSections';
import { PrintVendorsSection, PrintIdeasSection } from './PrintVendorsAndIdeas';

export interface PrintBriefProps {
  readonly plan: Plan;
  readonly today?: IsoDate;
}

/** Formatted celebration brief layout optimized for clean print output and PDF export. */
export function PrintBrief({ plan, today }: PrintBriefProps): JSX.Element {
  const referenceDate = today ?? plan.createdAt ?? startOfTodayUtc();

  return (
    <article
      aria-label="Celebration Plan Print Brief"
      className="print-brief space-y-6 text-black bg-white p-6"
    >
      <PrintHeader plan={plan} today={referenceDate} />
      <PrintBudgetSection plan={plan} />
      <PrintTimelineSection plan={plan} today={referenceDate} />
      <PrintVendorsSection plan={plan} />
      <PrintIdeasSection plan={plan} />
    </article>
  );
}
