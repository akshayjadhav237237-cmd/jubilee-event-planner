import type { JSX } from 'react';

/** Renders the event timeline and milestone schedule panel placeholder. */
export function TimelinePanel(): JSX.Element {
  return (
    <div id="timeline-panel" className="p-6 bg-white rounded-lg border border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-2">Event Timeline</h2>
      <p className="text-stone-600">
        Track milestone deadlines, task dependencies, and upcoming preparation schedules.
      </p>
    </div>
  );
}
