import { lazy, Suspense, useState, type JSX } from 'react';
import { usePlan, useDispatch } from '../state/hooks';
import { Header } from './Header';
import { VitalsStrip } from './VitalsStrip';
import { AssistantDrawer } from '../features/assistant/AssistantDrawer';
import { WorkspaceModals } from './WorkspaceModals';
import { Tabs } from '../shared/ui';

const BudgetPanel = lazy(() =>
  import('../features/budget/BudgetPanel').then((m) => ({ default: m.BudgetPanel })),
);
const TimelinePanel = lazy(() =>
  import('../features/timeline/TimelinePanel').then((m) => ({ default: m.TimelinePanel })),
);
const VendorsPanel = lazy(() =>
  import('../features/vendors/VendorsPanel').then((m) => ({ default: m.VendorsPanel })),
);
const IdeasPanel = lazy(() =>
  import('../features/ideas/IdeasPanel').then((m) => ({ default: m.IdeasPanel })),
);

export type TabKey = 'budget' | 'timeline' | 'vendors' | 'ideas';

const TABS: readonly { readonly id: TabKey; readonly label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'ideas', label: 'Ideas' },
];

export interface WorkspaceProps {
  readonly defaultTab?: TabKey;
}

function renderActivePanel(tab: TabKey): JSX.Element {
  if (tab === 'timeline') return <TimelinePanel />;
  if (tab === 'vendors') return <VendorsPanel />;
  if (tab === 'ideas') return <IdeasPanel />;
  return <BudgetPanel />;
}

/** Renders the active plan workspace including header, vitals strip, tabs, and feature panels. */
export function Workspace({ defaultTab = 'budget' }: WorkspaceProps = {}): JSX.Element | null {
  const plan = usePlan();
  const { restorePlan, reset } = useDispatch();
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  if (!plan) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col w-full">
      <Header
        onToggleAssistant={() => setIsAssistantOpen((prev) => !prev)}
        isAssistantOpen={isAssistantOpen}
        onExport={() => setIsExportOpen(true)}
        onRestore={() => setIsRestoreOpen(true)}
        onReset={() => setIsResetOpen(true)}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 outline-none w-full"
      >
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink-text">
            {plan.brief.title}
          </h2>
          <p className="text-xs text-stone-700 font-medium uppercase tracking-wider mt-1">
            {plan.brief.eventType} • {plan.brief.guestCount} guests • {plan.brief.eventDate}
          </p>
        </div>

        <VitalsStrip plan={plan} />

        <Tabs
          tabs={TABS}
          selectedId={activeTab}
          onSelect={(id) => setActiveTab(id as TabKey)}
          ariaLabel="Planning sections"
          className="mb-6"
        />

        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="outline-none"
        >
          <Suspense
            fallback={
              <div role="status" aria-live="polite" className="p-6 text-stone-700">
                Loading section...
              </div>
            }
          >
            {renderActivePanel(activeTab)}
          </Suspense>
        </div>
      </main>

      <AssistantDrawer open={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

      <WorkspaceModals
        plan={plan}
        isExportOpen={isExportOpen}
        isRestoreOpen={isRestoreOpen}
        isResetOpen={isResetOpen}
        onCloseExport={() => setIsExportOpen(false)}
        onCloseRestore={() => setIsRestoreOpen(false)}
        onCloseReset={() => setIsResetOpen(false)}
        onRestore={(restored) => restorePlan(restored)}
        onReset={() => reset()}
      />
    </div>
  );
}
