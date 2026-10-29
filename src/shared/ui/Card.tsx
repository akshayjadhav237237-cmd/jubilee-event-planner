import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly as?: 'div' | 'article' | 'section';
}

const baseCardStyle = 'bg-white rounded-lg border border-stone-border p-6 shadow-sm';

/** Renders an accessible content container with standard card framing and border styles. */
export function Card({
  as: Component = 'div',
  className,
  children,
  ...rest
}: CardProps): JSX.Element {
  const combinedClass = cx(baseCardStyle, className);

  return (
    <Component className={combinedClass} {...rest}>
      {children}
    </Component>
  );
}
