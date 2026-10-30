import type { JSX } from 'react';

export interface AssistantDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

/** Renders the slide-out planning assistant drawer placeholder. */
export function AssistantDrawer({ open, onClose }: AssistantDrawerProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <aside
      id="assistant-drawer"
      aria-label="Planning assistant"
      className="fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-2xl border-l border-stone-200 p-6 z-50 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
        <h2 className="text-lg font-bold text-stone-900">Planning Assistant</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close assistant"
          className="text-stone-500 hover:text-stone-800 p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-primary"
        >
          ✕
        </button>
      </div>
      <p className="text-sm text-stone-600">
        Ask questions, explore suggestions, or test automated scenario adjustments.
      </p>
    </aside>
  );
}
