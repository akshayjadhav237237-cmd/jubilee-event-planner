import { lazy, Suspense, type JSX } from 'react';
import type { Plan } from '../domain/types';
import { PrintBrief } from '../features/print/PrintBrief';

const ExportModal = lazy(() =>
  import('../features/export/ExportModal').then((m) => ({ default: m.ExportModal })),
);
const RestoreModal = lazy(() =>
  import('../features/export/RestoreModal').then((m) => ({ default: m.RestoreModal })),
);
const ResetConfirmDialog = lazy(() =>
  import('../features/reset/ResetConfirmDialog').then((m) => ({ default: m.ResetConfirmDialog })),
);

export interface WorkspaceModalsProps {
  readonly plan: Plan;
  readonly isExportOpen: boolean;
  readonly isRestoreOpen: boolean;
  readonly isResetOpen: boolean;
  readonly onCloseExport: () => void;
  readonly onCloseRestore: () => void;
  readonly onCloseReset: () => void;
  readonly onRestore: (plan: Plan) => void;
  readonly onReset: () => void;
}

/** Renders export, restore, reset dialogs and the print-ready brief layout. */
export function WorkspaceModals({
  plan,
  isExportOpen,
  isRestoreOpen,
  isResetOpen,
  onCloseExport,
  onCloseRestore,
  onCloseReset,
  onRestore,
  onReset,
}: WorkspaceModalsProps): JSX.Element {
  return (
    <>
      <Suspense fallback={null}>
        {isExportOpen && <ExportModal isOpen={isExportOpen} onClose={onCloseExport} plan={plan} />}
        {isRestoreOpen && (
          <RestoreModal isOpen={isRestoreOpen} onClose={onCloseRestore} onRestore={onRestore} />
        )}
        {isResetOpen && (
          <ResetConfirmDialog isOpen={isResetOpen} onClose={onCloseReset} onConfirm={onReset} />
        )}
      </Suspense>
      <div className="print-brief hidden print:block">
        <PrintBrief plan={plan} />
      </div>
    </>
  );
}
