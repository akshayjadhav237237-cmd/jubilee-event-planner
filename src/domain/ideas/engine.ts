import type { EventBrief, IdeaItem } from '../types';
import type { IdeaTemplate, ScoredIdea, SelectIdeasOptions } from './types';
import { scoreIdea } from './scoring';
import { ALL_IDEAS } from '../../data/ideas';

function matchesSearch(template: IdeaTemplate, query: string): boolean {
  if (query.length === 0) {
    return true;
  }
  const q = query.toLowerCase();
  const inTitle = template.title.toLowerCase().includes(q);
  const inDesc = template.description.toLowerCase().includes(q);
  const inTags = template.tags.some((tag) => tag.toLowerCase().includes(q));
  return inTitle || inDesc || inTags;
}

function compareScoredIdeas(a: ScoredIdea, b: ScoredIdea): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  return a.template.title.localeCompare(b.template.title);
}

function balanceCategories(
  themes: readonly ScoredIdea[],
  menus: readonly ScoredIdea[],
  activities: readonly ScoredIdea[],
  limit: number,
): readonly IdeaTemplate[] {
  const result: IdeaTemplate[] = [];
  const seenTitles = new Set<string>();
  const buckets = [themes, menus, activities];
  const indices = [0, 0, 0];
  let advanced = true;

  while (result.length < limit && advanced) {
    advanced = false;
    for (let b = 0; b < 3; b += 1) {
      const bucket = buckets[b];
      let idx = indices[b] ?? 0;
      while (bucket && idx < bucket.length) {
        const item = bucket[idx];
        idx += 1;
        indices[b] = idx;
        if (item && !seenTitles.has(item.template.title)) {
          seenTitles.add(item.template.title);
          result.push(item.template);
          advanced = true;
          break;
        }
      }
      if (result.length >= limit) {
        break;
      }
    }
  }
  return result;
}

function toIdeaItem(template: IdeaTemplate): IdeaItem {
  return {
    id: template.id,
    title: template.title,
    category: template.category,
    description: template.description,
    votes: 0,
  };
}

/** Selects, scores, balances, and deduplicates ideas for an event brief. */
export function selectIdeas(brief: EventBrief, options?: SelectIdeasOptions): readonly IdeaItem[] {
  const limit = options?.limit ?? 9;
  const catalog = options?.catalog ?? ALL_IDEAS;
  const search = (options?.search ?? '').trim();

  const matching = catalog.filter((idea) => {
    return idea.eventType === brief.eventType && matchesSearch(idea, search);
  });

  const scored: ScoredIdea[] = matching.map((template) => ({
    template,
    score: scoreIdea(template, brief),
  }));

  const themes = scored.filter((i) => i.template.category === 'theme').sort(compareScoredIdeas);
  const menus = scored.filter((i) => i.template.category === 'menu').sort(compareScoredIdeas);
  const activities = scored
    .filter((i) => i.template.category === 'activity')
    .sort(compareScoredIdeas);

  const balanced = balanceCategories(themes, menus, activities, limit);
  return balanced.map(toIdeaItem);
}
