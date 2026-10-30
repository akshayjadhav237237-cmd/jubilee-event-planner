import { useState, type JSX } from 'react';
import { usePlan } from '../state/hooks';
import { SkipLink } from '../shared/ui/SkipLink';
import { Header } from './Header';
import { Workspace } from './Workspace';
import { Launchpad } from '../features/intake/Launchpad';
import { AssistantDrawer } from '../features/assistant/AssistantDrawer';
import { AppProviders } from './AppProviders';

/** Renders the inner application layout based on plan presence. */
export function AppContent(): JSX.Element {
  const plan = usePlan();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper-bg text-ink-text flex flex-col">
      <SkipLink targetId="main-content" />

      {plan === null ? (
        <>
          <Header
            onToggleAssistant={() => setIsAssistantOpen((prev) => !prev)}
            isAssistantOpen={isAssistantOpen}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1 outline-none w-full"
          >
            <Launchpad />
          </main>
          <AssistantDrawer open={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
        </>
      ) : (
        <Workspace />
      )}

      <footer
        role="contentinfo"
        className="border-t border-stone-200 mt-12 py-6 text-center text-sm text-stone-500"
      >
        <p>Planning heuristics only, not legal, tax, safety or financial advice.</p>
      </footer>
    </div>
  );
}

/** Root component connecting providers and top-level application shell layout. */
export function App(): JSX.Element {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
