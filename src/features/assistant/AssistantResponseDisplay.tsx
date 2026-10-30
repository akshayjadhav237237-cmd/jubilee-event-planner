import type { JSX } from 'react';
import type { PlanCommand } from '../../domain/commands';
import type { AssistantResult } from '../../ai/ports';
import { Alert } from '../../shared/ui';
import { CommandDiffList } from './CommandDiffList';

export interface AssistantResponseDisplayProps {
  readonly errorMessage: string | null;
  readonly result: AssistantResult | null;
  readonly onDismiss: () => void;
  readonly onApply: (commands: readonly PlanCommand[]) => void;
}

/** Renders assistant output banners, clarifications, refusals, or command preview diffs. */
export function AssistantResponseDisplay({
  errorMessage,
  result,
  onDismiss,
  onApply,
}: AssistantResponseDisplayProps): JSX.Element {
  return (
    <div aria-live="polite" className="space-y-3">
      {errorMessage && <Alert severity="critical" message={errorMessage} />}
      {result?.fallbackNotice && <Alert severity="info" message={result.fallbackNotice} />}
      {result?.kind === 'clarify' && <Alert severity="warn" message={result.question} />}
      {result?.kind === 'refuse' && <Alert severity="critical" message={result.reason} />}
      {result?.kind === 'commands' && (
        <CommandDiffList
          commands={result.commands}
          summary={result.summary}
          onDismiss={onDismiss}
          onApply={onApply}
        />
      )}
    </div>
  );
}
