import type { JSX } from 'react';
import type { IdeaItem } from '../../domain/types';
import { Badge, Button } from '../../shared/ui';

export interface IdeaCardProps {
  readonly idea: IdeaItem;
  readonly isSaved: boolean;
  readonly onToggleSave: (idea: IdeaItem) => void;
}

/** Card presenting a creative inspiration item with description and save action. */
export function IdeaCard({ idea, isSaved, onToggleSave }: IdeaCardProps): JSX.Element {
  return (
    <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-sm flex flex-col justify-between hover:border-gold-accent transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge text={idea.category} variant="neutral" />
          <span className="text-xs text-stone-500 font-mono">Score: {idea.votes}</span>
        </div>
        <h3 className="font-semibold text-ink-text text-base">{idea.title}</h3>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{idea.description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
        <Button
          variant={isSaved ? 'secondary' : 'primary'}
          onClick={() => onToggleSave(idea)}
          aria-label={isSaved ? `Remove ${idea.title} from plan` : `Save ${idea.title} to plan`}
        >
          {isSaved ? 'Saved ✓' : 'Save to Plan'}
        </Button>
      </div>
    </div>
  );
}
