import { useContext, type JSX } from 'react';
import { useHistory } from '../state/hooks';
import { AssistantContext } from './AppProviders';
import { cx } from '../shared/lib/cx';

export interface HeaderProps {
  readonly onToggleAssistant?: () => void;
  readonly isAssistantOpen?: boolean;
}

/** Renders the application header banner with title, mode indicator, and history actions. */
export function Header({
  onToggleAssistant,
  isAssistantOpen = false,
}: HeaderProps = {}): JSX.Element {
  const { canUndo, canRedo, undo, redo } = useHistory();
  const assistant = useContext(AssistantContext);
  const isLive = assistant?.mode === 'live';
  const modeText = isLive ? 'Live AI' : 'Offline mode';

  return (
    <header
      role="banner"
      className="border-b border-stone-200 bg-white/90 backdrop-blur px-4 sm:px-6 py-3 w-full"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-teal-primary">
            Jubilee Event Planner
          </h1>
          <span
            role="status"
            aria-label={`System status: ${modeText}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-stone-300 bg-stone-100 text-stone-800"
          >
            <span
              aria-hidden="true"
              className={cx('w-2 h-2 rounded-full', isLive ? 'bg-emerald-500' : 'bg-stone-400')}
            />
            <span>{modeText}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo last action"
            className="inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo last action"
            className="inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={onToggleAssistant}
            aria-label="Open planning assistant"
            aria-expanded={isAssistantOpen}
            aria-controls="assistant-drawer"
            className="inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded border border-teal-primary bg-teal-primary text-white hover:bg-[#004748] focus:outline-none focus:ring-2 focus:ring-teal-primary focus:ring-offset-2"
          >
            Assistant
          </button>
        </div>
      </div>
    </header>
  );
}
