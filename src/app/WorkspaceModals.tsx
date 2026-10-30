import type { JSX } from 'react';
import type { Plan } from '../domain/types';
import { ExportModal } from '../features/export/ExportModal';
import { RestoreModal } from '../features/export/RestoreModal';
import { ResetConfirmDialog } from '../features/reset/ResetConfirmDialog';
import { PrintBrief } from '../features/print/PrintBrief';

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
      <ExportModal isOpen={isExportOpen} onClose={onCloseExport} plan={plan} />
      <RestoreModal isOpen={isRestoreOpen} onClose={onCloseRestore} onRestore={onRestore} />
      <ResetConfirmDialog isOpen={isResetOpen} onClose={onCloseReset} onConfirm={onReset} />
      <div className="print-brief hidden print:block">
        <PrintBrief plan={plan} />
      </div>
    </>
  );
}
