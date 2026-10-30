import type { JSX } from 'react';
import { cx } from '../lib/cx';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'critical' | 'neutral';

export interface BadgeProps {
  readonly text: string;
  readonly variant?: BadgeVariant;
  readonly className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-stone-100 text-stone-800 border-stone-300',
  info: 'bg-sky-100 text-sky-900 border-sky-300',
  success: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  warning: 'bg-amber-100 text-amber-900 border-amber-300',
  critical: 'bg-rose-100 text-rose-900 border-rose-300',
};

const baseBadgeStyles =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

/** Renders an accessible status badge presenting visible descriptive text. */
export function Badge({ text, variant = 'neutral', className }: BadgeProps): JSX.Element {
  const combinedClass = cx(baseBadgeStyles, variantStyles[variant], className);

  return <span className={combinedClass}>{text}</span>;
}
