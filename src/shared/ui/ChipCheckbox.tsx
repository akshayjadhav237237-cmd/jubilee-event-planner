import type { JSX } from 'react';
import { cx } from '../lib/cx';

export interface ChipCheckboxProps {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly badge?: string | number;
  readonly className?: string;
}

/** Renders an accessible toggleable chip checkbox with keyboard focus styling. */
export function ChipCheckbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  badge,
  className,
}: ChipCheckboxProps): JSX.Element {
  const containerClasses = cx(
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border select-none transition-colors cursor-pointer',
    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-primary has-[:focus-visible]:ring-offset-1',
    checked
      ? 'bg-teal-primary text-white border-teal-primary'
      : 'bg-white text-ink-text border-stone-border hover:bg-stone-50',
    disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : undefined,
    className,
  );

  const badgeClasses = cx(
    'ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
    checked ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600',
  );

  return (
    <label htmlFor={id} className={containerClasses}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span>{label}</span>
      {badge !== undefined && <span className={badgeClasses}>{badge}</span>}
    </label>
  );
}
