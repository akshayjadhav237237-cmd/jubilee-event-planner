import type { ChangeEvent, JSX, TextareaHTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'value' | 'onChange'
> {
  readonly id: string;
  readonly value: string;
  readonly onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly error?: boolean;
}

const baseTextareaStyles =
  'w-full px-3 py-2 text-sm rounded-md border bg-white text-ink-text ' +
  'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ' +
  'disabled:opacity-50 disabled:bg-stone-50 disabled:cursor-not-allowed transition-colors resize-y';

/** Renders an accessible multiline textarea element with focus indicators. */
export function Textarea({
  id,
  value,
  onChange,
  rows = 3,
  error = false,
  required = false,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: TextareaProps): JSX.Element {
  const isInvalid = ariaInvalid ?? error;
  const stateStyles = isInvalid
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
    : 'border-stone-border focus:border-teal-primary focus:ring-teal-primary';

  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      aria-invalid={isInvalid}
      aria-describedby={ariaDescribedBy}
      className={cx(baseTextareaStyles, stateStyles, className)}
      {...rest}
    />
  );
}
