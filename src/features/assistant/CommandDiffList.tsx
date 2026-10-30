import type { JSX } from 'react';
import type { PlanCommand } from '../../domain/commands';
import { Button } from '../../shared/ui';
import { describeCommand } from './describe';

export interface CommandDiffListProps {
  readonly commands: readonly PlanCommand[];
  readonly summary: string;
  readonly onApply: (commands: readonly PlanCommand[]) => void;
  readonly onDismiss: () => void;
}

/** Previews proposed atomic plan changes in plain language before batch application. */
export function CommandDiffList({
  commands,
  summary,
  onApply,
  onDismiss,
}: CommandDiffListProps): JSX.Element {
  return (
    <div className="bg-sand-accent/20 p-4 rounded-xl border border-stone-200 space-y-3">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
          Proposed Modifications ({commands.length})
        </span>
        <p className="text-sm text-ink-text font-medium mt-1">{summary}</p>
      </div>

      <ul className="space-y-1.5 text-xs text-stone-700">
        {commands.map((cmd, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 bg-white p-2 rounded border border-stone-200"
          >
            <span className="text-gold-accent font-bold">→</span>
            <span>{describeCommand(cmd)}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
        <Button variant="secondary" onClick={onDismiss}>
          Dismiss
        </Button>
        <Button variant="primary" onClick={() => onApply(commands)}>
          Apply All Changes
        </Button>
      </div>
    </div>
  );
}
