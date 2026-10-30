import type { JSX } from 'react';
import { cx } from '../lib/cx';

export type AlertSeverity = 'info' | 'warn' | 'critical';

export interface AlertProps {
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly title?: string;
  readonly className?: string;
}

const severityStyles: Record<AlertSeverity, string> = {
  info: 'bg-sky-50 text-sky-950 border-sky-300',
  warn: 'bg-amber-50 text-amber-950 border-amber-300',
  critical: 'bg-rose-50 text-rose-950 border-rose-300',
};

const baseAlertStyles = 'rounded-md border p-4 text-sm leading-relaxed';

/** Renders an accessible alert banner using aria roles appropriate for its severity. */
export function Alert({ severity, message, title, className }: AlertProps): JSX.Element {
  const role = severity === 'info' ? 'status' : 'alert';
  const combinedClass = cx(baseAlertStyles, severityStyles[severity], className);

  return (
    <div role={role} className={combinedClass}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{message}</div>
    </div>
  );
}
