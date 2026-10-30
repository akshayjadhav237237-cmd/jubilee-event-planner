import type { JSX } from 'react';

/** Renders the inspiration and saved ideas brainstorm panel placeholder. */
export function IdeasPanel(): JSX.Element {
  return (
    <div id="ideas-panel" className="p-6 bg-white rounded-lg border border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-2">Inspiration & Saved Ideas</h2>
      <p className="text-stone-600">
        Brainstorm creative themes, culinary menus, and engaging guest activities.
      </p>
    </div>
  );
}
