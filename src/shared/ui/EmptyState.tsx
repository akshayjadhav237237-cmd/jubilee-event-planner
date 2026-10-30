import type { JSX } from 'react';
import { cx } from '../lib/cx';
import { Button } from './Button';

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly className?: string;
}

/** Renders an accessible placeholder state with guidance copy and call-to-action button. */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center p-8 text-center bg-stone-50 rounded-lg border border-dashed border-stone-border',
        className,
      )}
    >
      <h3 className="text-base font-semibold text-ink-text">{title}</h3>
      <p className="mt-1 text-sm text-stone-muted max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
