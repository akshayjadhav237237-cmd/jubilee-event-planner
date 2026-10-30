import type { JSX } from 'react';
import { cx } from '../lib/cx';

export type ProgressBarVariant = 'default' | 'warn' | 'critical';

export interface ProgressBarProps {
  readonly value: number;
  readonly label?: string;
  readonly valueText?: string;
  readonly variant?: ProgressBarVariant;
  readonly className?: string;
}

const variantFillStyles: Record<ProgressBarVariant, string> = {
  default: 'fill-teal-primary',
  warn: 'fill-amber-600',
  critical: 'fill-rose-600',
};

/** Clamps a progress percentage between 0 and 100. */
function clampProgress(value: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

/** Renders an accessible progress bar conveying completion ratio via ARIA attributes. */
export function ProgressBar({
  value,
  label,
  valueText,
  variant = 'default',
  className,
}: ProgressBarProps): JSX.Element {
  const clamped = clampProgress(value);
  const textRepresentation = valueText ?? `${clamped}%`;

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={textRepresentation}
      aria-label={label ?? 'Progress'}
      className={cx('w-full flex flex-col gap-1', className)}
    >
      {(label || valueText) && (
        <div className="flex justify-between items-center text-xs font-medium text-stone-muted">
          {label && <span>{label}</span>}
          <span>{textRepresentation}</span>
        </div>
      )}
      <svg
        aria-hidden="true"
        className="w-full h-2 rounded-full overflow-hidden bg-stone-200"
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width={clamped} height="8" className={variantFillStyles[variant]} />
      </svg>
    </div>
  );
}
