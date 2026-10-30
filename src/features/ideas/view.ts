import type { IdeaCategory, IdeaItem } from '../../domain/types';

export type IdeaFilter = 'all' | IdeaCategory;

export interface IdeaGroupView {
  readonly category: IdeaCategory;
  readonly label: string;
  readonly items: readonly IdeaItem[];
}

const CATEGORY_LABELS: Record<IdeaCategory, string> = {
  theme: 'Themes & Aesthetics',
  menu: 'Culinary & Beverages',
  activity: 'Entertainment & Activities',
};

/** Filters a list of celebration ideas by category and optional search substring. */
export function filterIdeas(
  ideas: readonly IdeaItem[],
  filter: IdeaFilter,
  searchQuery = '',
): readonly IdeaItem[] {
  const query = searchQuery.trim().toLowerCase();
  return ideas.filter((item) => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesText =
      query.length === 0 ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesText;
  });
}

/** Groups ideas into standard sections: theme, menu, and activity. */
export function groupIdeasByCategory(ideas: readonly IdeaItem[]): readonly IdeaGroupView[] {
  const categories: readonly IdeaCategory[] = ['theme', 'menu', 'activity'];
  return categories.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: ideas.filter((item) => item.category === cat),
  }));
}

/** Checks whether an idea is already recorded in the active plan's saved ideas list. */
export function isIdeaSaved(savedIdeas: readonly IdeaItem[], ideaId: string): boolean {
  return savedIdeas.some((item) => item.id === ideaId);
}
