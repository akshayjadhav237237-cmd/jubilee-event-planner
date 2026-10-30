import { type JSX, type ReactNode, useEffect, useRef } from 'react';
import { cx } from '../lib/cx';

export interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly id?: string;
  readonly className?: string;
}

/** Renders an accessible modal dialog wrapping the native HTML dialog element. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  id = 'dialog-modal',
  className,
}: DialogProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveRef.current = document.activeElement;
      }
      if (!dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    } else {
      if (dialog.open && typeof dialog.close === 'function') {
        dialog.close();
      }
      if (previousActiveRef.current) {
        previousActiveRef.current.focus();
        previousActiveRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClick = (e: MouseEvent): void => {
      if (e.target === dialog) {
        onClose();
      }
    };
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('click', handleClick);
      if (previousActiveRef.current) {
        previousActiveRef.current.focus();
      }
    };
  }, [onClose]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>): void => {
    e.preventDefault();
    onClose();
  };

  const titleId = `${id}-title`;

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      className={cx(
        'backdrop:bg-stone-900/40 p-0 rounded-lg shadow-xl bg-white border border-stone-border max-w-lg w-full m-auto',
        className,
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-border mb-4">
          <h2 id={titleId} className="text-lg font-semibold text-ink-text">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1 rounded-md text-stone-muted hover:text-ink-text hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-primary"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              &times;
            </span>
          </button>
        </div>
        <div className="text-ink-text text-sm">{children}</div>
      </div>
    </dialog>
  );
}
