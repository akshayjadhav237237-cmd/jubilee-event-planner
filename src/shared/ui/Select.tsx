import type { ChangeEvent, JSX, SelectHTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'id' | 'value' | 'onChange'
> {
  readonly id: string;
  readonly value: string;
  readonly onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  readonly options: readonly SelectOption[];
  readonly error?: boolean;
}

const baseSelectStyles =
  'w-full px-3 py-2 text-sm rounded-md border bg-white text-ink-text ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-1 ' +
  'disabled:opacity-50 disabled:bg-stone-50 disabled:cursor-not-allowed transition-colors';

/** Renders an accessible native select dropdown with customizable option items. */
export function Select({
  id,
  value,
  onChange,
  options,
  error = false,
  required = false,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: SelectProps): JSX.Element {
  const isInvalid = ariaInvalid ?? error;
  const stateStyles = isInvalid
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
    : 'border-stone-border focus:border-teal-primary focus:ring-teal-primary';

  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      aria-invalid={isInvalid}
      aria-describedby={ariaDescribedBy}
      className={cx(baseSelectStyles, stateStyles, className)}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
