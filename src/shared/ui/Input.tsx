import type { ChangeEvent, InputHTMLAttributes, JSX } from 'react';
import { cx } from '../lib/cx';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'value' | 'onChange'
> {
  readonly id: string;
  readonly value: string | number;
  readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly error?: boolean;
}

const baseInputStyles =
  'w-full px-3 py-2 text-sm rounded-md border bg-white text-ink-text ' +
  'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ' +
  'disabled:opacity-50 disabled:bg-stone-50 disabled:cursor-not-allowed transition-colors';

/** Renders an accessible form input with visual focus rings and validation states. */
export function Input({
  id,
  value,
  onChange,
  type = 'text',
  error = false,
  required = false,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: InputProps): JSX.Element {
  const isInvalid = ariaInvalid ?? error;
  const stateStyles = isInvalid
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
    : 'border-stone-border focus:border-teal-primary focus:ring-teal-primary';

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      aria-invalid={isInvalid}
      aria-describedby={ariaDescribedBy}
      className={cx(baseInputStyles, stateStyles, className)}
      {...rest}
    />
  );
}
