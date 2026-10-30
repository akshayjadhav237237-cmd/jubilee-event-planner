import type { JSX } from 'react';

/** Renders the initial planning intake launchpad placeholder. */
export function Launchpad(): JSX.Element {
  return (
    <div id="launchpad-placeholder" className="p-6 bg-white rounded-lg border border-stone-200">
      <h2 className="text-2xl font-bold text-stone-900 mb-2">
        Choose a Demo or Create Your Own Plan
      </h2>
      <p className="text-stone-600">
        Select a template or start with a custom brief to begin organizing your event.
      </p>
    </div>
  );
}
