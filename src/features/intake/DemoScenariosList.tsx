import type { JSX } from 'react';
import { DEMO_SCENARIOS, type DemoScenario } from '../../data/demoScenarios';
import { Button } from '../../shared/ui/Button';

export interface DemoScenariosListProps {
  readonly onSelectScenario: (scenario: DemoScenario) => void;
}

/** Renders cards for pre-configured celebration scenarios to enable single-click exploration. */
export function DemoScenariosList({ onSelectScenario }: DemoScenariosListProps): JSX.Element {
  return (
    <section aria-labelledby="demo-heading" className="space-y-4">
      <div className="border-b border-stone-200 pb-3">
        <h2 id="demo-heading" className="text-xl font-serif font-bold text-ink-text">
          Explore Ready-Made Celebrations
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Pick a realistic scenario to immediately inspect budgets, timelines, and vendor guides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_SCENARIOS.map((demo) => (
          <div
            key={demo.id}
            className="flex flex-col justify-between p-5 rounded-xl border border-stone-200 bg-white shadow-sm hover:border-gold-accent transition-colors"
          >
            <div>
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-sand-accent text-stone-800 uppercase tracking-wider mb-2">
                {demo.brief.eventType}
              </span>
              <h3 className="font-semibold text-lg text-ink-text">{demo.name}</h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{demo.tagline}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-700 font-mono font-medium">
                {demo.brief.currency} {(demo.brief.totalBudget / 100).toLocaleString()}
              </span>
              <Button
                variant="primary"
                onClick={() => onSelectScenario(demo)}
                aria-label={`Load demo plan: ${demo.name}`}
              >
                Load Plan
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
