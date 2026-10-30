import { useState, type JSX } from 'react';
import type { IdeaItem } from '../../domain/types';
import { selectIdeas } from '../../domain/ideas';
import { createLocalIdeaProvider } from '../../ai/local';
import { usePlan, useDispatch } from '../../state/hooks';
import { Badge, Button, EmptyState } from '../../shared/ui';
import { filterIdeas, isIdeaSaved, type IdeaFilter } from './view';
import { IdeaCard } from './IdeaCard';

const FILTER_BUTTONS: readonly { readonly id: IdeaFilter; readonly label: string }[] = [
  { id: 'all', label: 'All Ideas' },
  { id: 'theme', label: 'Themes' },
  { id: 'menu', label: 'Culinary' },
  { id: 'activity', label: 'Activities' },
];

/** Ideas showcase offering curated themes, menus, and activities with AI suggestions. */
export function IdeasPanel(): JSX.Element {
  const plan = usePlan();
  const { dispatch } = useDispatch();
  const [filter, setFilter] = useState<IdeaFilter>('all');
  const [search, setSearch] = useState('');
  const [ideaList, setIdeaList] = useState<readonly IdeaItem[]>(() =>
    plan ? selectIdeas(plan.brief) : [],
  );

  if (!plan) {
    return <EmptyState title="No Active Plan" description="Create or load a plan to view ideas." />;
  }

  const handleRefresh = async (): Promise<void> => {
    const provider = createLocalIdeaProvider();
    const res = await provider.suggest({ plan });
    if (res.ok) setIdeaList(res.value);
  };

  const handleToggle = (idea: IdeaItem): void => {
    if (isIdeaSaved(plan.ideas, idea.id)) {
      dispatch({ type: 'REMOVE_IDEA', ideaId: idea.id });
    } else {
      dispatch({ type: 'SAVE_IDEA', idea });
    }
  };

  const filtered = filterIdeas(ideaList, filter, search);

  return (
    <section aria-labelledby="ideas-title" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="ideas-title" className="text-2xl font-serif font-bold text-ink-text">
              Inspiration & Ideas
            </h2>
            <Badge text="Offline Catalog" variant="neutral" />
          </div>
          <p className="text-sm text-stone-600">Saved to plan: {plan.ideas.length} ideas</p>
        </div>
        <Button variant="secondary" onClick={handleRefresh}>
          Refresh Suggestions
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_BUTTONS.map((btn) => (
          <Button
            key={btn.id}
            variant={filter === btn.id ? 'primary' : 'secondary'}
            onClick={() => setFilter(btn.id)}
            aria-label={`Filter by ${btn.label}`}
          >
            {btn.label}
          </Button>
        ))}
        <input
          type="search"
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-gold-accent"
          aria-label="Search ideas"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            isSaved={isIdeaSaved(plan.ideas, idea.id)}
            onToggleSave={handleToggle}
          />
        ))}
      </div>
    </section>
  );
}
