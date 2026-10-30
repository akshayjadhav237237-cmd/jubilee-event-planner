import type { FormEvent, JSX } from 'react';
import { Input, Button } from '../../shared/ui';
import { QUICK_CHIPS } from './view';

export interface AssistantPromptFormProps {
  readonly prompt: string;
  readonly loading: boolean;
  readonly disabled: boolean;
  readonly onPromptChange: (val: string) => void;
  readonly onSubmit: (e: FormEvent) => void;
}

/** Input form including quick example suggestion chips and submission button. */
export function AssistantPromptForm({
  prompt,
  loading,
  disabled,
  onPromptChange,
  onSubmit,
}: AssistantPromptFormProps): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onPromptChange(chip)}
            className="text-[11px] px-2 py-1 rounded-full bg-sand-accent/50 text-stone-700 hover:bg-sand-accent transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          id="assistant-prompt-input"
          value={prompt}
          placeholder="e.g. Shift 10% from decor to catering"
          onChange={(e) => onPromptChange(e.target.value)}
        />
        <Button variant="primary" type="submit" disabled={loading || disabled}>
          {loading ? 'Thinking...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
}
