import { describe, expect, it } from 'vitest';
import type { IdeaItem } from '../../../src/domain/types';
import { filterIdeas, groupIdeasByCategory, isIdeaSaved } from '../../../src/features/ideas/view';

const SAMPLE_IDEAS: readonly IdeaItem[] = [
  {
    id: 'idea-1',
    title: 'Heritage Courtyard Elegance',
    category: 'theme',
    description: 'Rustic wooden pillars with marigold and brass accents',
    votes: 12,
  },
  {
    id: 'idea-2',
    title: 'Live Chaat & Kulfi Bar',
    category: 'menu',
    description: 'Interactive live counters for customized appetizers',
    votes: 8,
  },
  {
    id: 'idea-3',
    title: 'Acoustic Sangeet Unplugged',
    category: 'activity',
    description: 'Live acoustic unplugged folk and sangeet performances',
    votes: 15,
  },
];

describe('Ideas view model', () => {
  it('filters ideas by category and search text', () => {
    expect(filterIdeas(SAMPLE_IDEAS, 'all').length).toBe(3);
    expect(filterIdeas(SAMPLE_IDEAS, 'menu').length).toBe(1);
    expect(filterIdeas(SAMPLE_IDEAS, 'theme').length).toBe(1);

    const searched = filterIdeas(SAMPLE_IDEAS, 'all', 'chaat');
    expect(searched.length).toBe(1);
    expect(searched[0]?.title).toContain('Chaat');
  });

  it('groups ideas by category with descriptive section headers', () => {
    const groups = groupIdeasByCategory(SAMPLE_IDEAS);
    expect(groups.length).toBe(3);
    expect(groups.find((g) => g.category === 'theme')?.items.length).toBe(1);
    expect(groups.find((g) => g.category === 'menu')?.items.length).toBe(1);
    expect(groups.find((g) => g.category === 'activity')?.items.length).toBe(1);
  });

  it('determines if an idea is already saved in the active plan', () => {
    const firstIdea = SAMPLE_IDEAS[0];
    if (!firstIdea) throw new Error('Test fixture missing idea');
    const saved = [firstIdea];
    expect(isIdeaSaved(saved, 'idea-1')).toBe(true);
    expect(isIdeaSaved(saved, 'idea-2')).toBe(false);
  });
});
