import type { JSX } from 'react';
import { cx } from '../lib/cx';

export interface SkipLinkProps {
  readonly targetId?: string;
  readonly children?: string;
}

/** Renders an accessible skip navigation link targeting main content. */
export function SkipLink({
  targetId = 'main-content',
  children = 'Skip to content',
}: SkipLinkProps): JSX.Element {
  const href = `#${targetId}`;
  const className = cx(
    'sr-only',
    'focus:not-sr-only',
    'focus:fixed',
    'focus:top-4',
    'focus:left-4',
    'focus:z-50',
    'focus:px-4',
    'focus:py-2',
    'focus:bg-teal-primary',
    'focus:text-white',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  );

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
