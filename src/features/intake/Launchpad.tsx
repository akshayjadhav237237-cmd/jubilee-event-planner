import { type JSX } from 'react';
import type { EventBrief } from '../../domain/types';
import type { IsoDate } from '../../domain/dates';
import { useDispatch } from '../../state/hooks';
import { DemoScenariosList } from './DemoScenariosList';
import { CustomBriefForm } from './CustomBriefForm';

export interface LaunchpadProps {
  readonly today?: IsoDate;
}

/** Intake hub presenting celebration presets and custom brief intake forms. */
export function Launchpad({ today = '2026-10-30' as IsoDate }: LaunchpadProps): JSX.Element {
  const { createPlan } = useDispatch();

  const handleCreatePlan = (brief: EventBrief): void => {
    createPlan(brief);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink-text tracking-tight">
          Celebration & Event Planner
        </h2>
        <p className="text-stone-600 font-medium">Choose a Demo or Create Your Own Plan</p>
        <p className="text-stone-600 max-w-2xl leading-relaxed text-sm">
          Generate realistic budgets, synchronized countdown timelines, and actionable vendor
          checklists tailored to your wedding, birthday, or community gathering.
        </p>
      </div>

      <DemoScenariosList onSelectScenario={(scenario) => handleCreatePlan(scenario.brief)} />

      <section aria-labelledby="custom-heading" className="pt-8 border-t border-stone-200">
        <CustomBriefForm today={today} onSubmit={handleCreatePlan} />
      </section>
    </div>
  );
}
