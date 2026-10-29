import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from '../../../src/shared/ui/Card';

describe('Card component', () => {
  it('renders children inside default div container', () => {
    render(
      <Card data-testid="test-card">
        <p>Card content</p>
      </Card>,
    );

    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card.tagName.toLowerCase()).toBe('div');
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'border');
  });

  it('supports semantic HTML container tags', () => {
    render(
      <Card as="article" data-testid="article-card">
        <h2>Article title</h2>
      </Card>,
    );

    const card = screen.getByTestId('article-card');
    expect(card.tagName.toLowerCase()).toBe('article');
  });

  it('combines custom className with default styles', () => {
    render(
      <Card className="custom-shadow" data-testid="styled-card">
        <p>Content</p>
      </Card>,
    );

    const card = screen.getByTestId('styled-card');
    expect(card).toHaveClass('custom-shadow');
    expect(card).toHaveClass('bg-white');
  });
});
