import type { JSX } from 'react';
import { Dialog } from '../../shared/ui/Dialog';
import { Button } from '../../shared/ui/Button';

export interface ResetConfirmDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

/** Confirmation dialog warning the user before resetting the active celebration plan. */
export function ResetConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
}: ResetConfirmDialogProps): JSX.Element {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Reset Celebration Plan"
      id="reset-confirm-dialog"
    >
      <div className="space-y-4">
        <p className="text-stone-700 leading-relaxed text-sm">
          Are you sure you want to reset this plan? All unsaved changes and progress will be
          cleared, and you will return to the Launchpad.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={onConfirm}
            className="bg-rose-700 hover:bg-rose-800 active:bg-rose-900 border-rose-700 focus:ring-rose-600 text-white"
          >
            Reset Plan
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
