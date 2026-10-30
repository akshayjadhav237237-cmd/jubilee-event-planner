import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface FieldRenderProps {
  readonly id: string;
  readonly 'aria-describedby'?: string | undefined;
  readonly 'aria-invalid'?: boolean | undefined;
}

export interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly helperText?: string | undefined;
  readonly error?: string | undefined;
  readonly required?: boolean | undefined;
  readonly className?: string | undefined;
  readonly children: ReactNode | ((props: FieldRenderProps) => ReactNode);
}

/** Resolves space-separated descriptor ids for field helper text and errors. */
function buildDescribedBy(id: string, hasHelper: boolean, hasError: boolean): string | undefined {
  const parts: string[] = [];
  if (hasError) {
    parts.push(`${id}-error`);
  }
  if (hasHelper) {
    parts.push(`${id}-helper`);
  }
  return parts.length > 0 ? parts.join(' ') : undefined;
}

/** Renders an accessible form field container with label, error alerts, and helper text. */
export function Field({
  id,
  label,
  helperText,
  error,
  required = false,
  className,
  children,
}: FieldProps): JSX.Element {
  const hasError = Boolean(error);
  const hasHelper = Boolean(helperText);
  const describedBy = buildDescribedBy(id, hasHelper, hasError);

  const renderedContent =
    typeof children === 'function'
      ? children({
          id,
          'aria-describedby': describedBy,
          'aria-invalid': hasError,
        })
      : children;

  return (
    <div className={cx('flex flex-col gap-1 w-full', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-text">
        {label}
        {required && (
          <span aria-hidden="true" className="text-rose-600 ml-1">
            *
          </span>
        )}
      </label>
      {renderedContent}
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      {hasHelper && !hasError && (
        <p id={`${id}-helper`} className="text-xs text-stone-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
