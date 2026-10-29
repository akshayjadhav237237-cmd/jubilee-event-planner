import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-teal-primary text-white hover:bg-[#004748] active:bg-[#003838]',
  secondary:
    'bg-white text-ink-text border border-stone-border hover:bg-stone-50 active:bg-stone-100',
  ghost: 'bg-transparent text-ink-text hover:bg-stone-100 active:bg-stone-200',
};

const baseStyles =
  'inline-flex items-center justify-center font-medium text-sm px-4 py-2 rounded-md transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-teal-primary focus:ring-offset-2 ' +
  'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

/** Renders an accessible interactive button with variant styles and focus indicators. */
export function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps): JSX.Element {
  const combinedClass = cx(baseStyles, variantStyles[variant], className);

  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClass}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
