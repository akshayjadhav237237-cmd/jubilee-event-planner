import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';

describe('App Shell Accessibility', () => {
  it('renders all required accessible landmark regions', () => {
    render(<App />);

    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabIndex', '-1');

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('contains an accessible skip to content link targeting main', () => {
    render(<App />);
    const skipLink = screen.getByRole('link', { name: 'Skip to content' });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has a single primary h1 heading', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    const firstHeading = headings[0];
    expect(firstHeading).toBeDefined();
    if (firstHeading) {
      expect(firstHeading).toHaveTextContent('Jubilee Event Planner');
    }
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
    expect(results.violations.length).toBe(0);
  });
});
