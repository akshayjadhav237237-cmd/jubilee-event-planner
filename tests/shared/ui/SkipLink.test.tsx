import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkipLink } from '../../../src/shared/ui/SkipLink';

describe('SkipLink component', () => {
  it('renders anchor with default target and text', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveClass('sr-only');
  });

  it('supports custom target id and label', () => {
    render(<SkipLink targetId="content-area">Skip navigation</SkipLink>);
    const link = screen.getByRole('link', { name: 'Skip navigation' });
    expect(link).toHaveAttribute('href', '#content-area');
  });

  it('includes focus styles for keyboard navigation', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link.className).toContain('focus:not-sr-only');
    expect(link.className).toContain('focus:fixed');
    expect(link.className).toContain('focus:bg-teal-primary');
  });
});
