import type { JSX } from 'react';
import { cx } from '../lib/cx';

export interface StatProps {
  readonly label: string;
  readonly value: string | number;
  readonly caption?: string;
  readonly trend?: string;
  readonly className?: string;
}

/** Renders an accessible metric summary card with visual hierarchy for values and trends. */
export function Stat({ label, value, caption, trend, className }: StatProps): JSX.Element {
  return (
    <div
      className={cx(
        'p-4 bg-white rounded-lg border border-stone-border shadow-sm flex flex-col',
        className,
      )}
    >
      <div className="text-xs font-medium text-stone-muted uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl font-bold text-ink-text">{value}</div>
      {caption && <div className="mt-1 text-xs text-stone-muted">{caption}</div>}
      {trend && <div className="mt-1 text-xs font-semibold text-teal-primary">{trend}</div>}
    </div>
  );
}
