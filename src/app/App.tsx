import type { JSX } from 'react';
import { SkipLink } from '../shared/ui/SkipLink';

/** Renders the core application shell with accessible landmarks and header navigation. */
export function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-paper-bg text-ink-text flex flex-col">
      <SkipLink />
      <header
        role="banner"
        className="border-b border-stone-200 bg-white/80 backdrop-blur px-6 py-4"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-teal-primary">Jubilee</span>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-4xl mx-auto px-6 py-12 flex-1 outline-none w-full"
      >
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">Jubilee Event Planner</h1>
        <p className="text-base text-stone-600">Planning shell. Features arrive in later steps.</p>
      </main>

      <footer
        role="contentinfo"
        className="border-t border-stone-200 mt-12 py-6 text-center text-sm text-stone-500"
      >
        <p>Planning heuristics only, not legal, tax, safety or financial advice.</p>
      </footer>
    </div>
  );
}
