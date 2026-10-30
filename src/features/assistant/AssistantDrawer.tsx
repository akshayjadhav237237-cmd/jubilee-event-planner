import { useState, type FormEvent, type JSX } from 'react';
import type { AssistantProvider, AssistantResult } from '../../ai/ports';
import { createAssistant } from '../../ai/factory';
import { createMemoryApiKey } from '../../ai/apiKey';
import { usePlan, useDispatch } from '../../state/hooks';
import { Dialog, Badge, Button } from '../../shared/ui';
import { getModeExplanation } from './view';
import { AssistantResponseDisplay } from './AssistantResponseDisplay';
import { AssistantPromptForm } from './AssistantPromptForm';
import { ApiKeySettingsModal } from './ApiKeySettingsModal';

export interface AssistantDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly assistant?: AssistantProvider;
}

const DEFAULT_API_KEY_PORT = createMemoryApiKey();

/** Slide-over assistant drawer enabling natural-language plan modification and command diff previews. */
export function AssistantDrawer({ open, onClose, assistant }: AssistantDrawerProps): JSX.Element {
  const plan = usePlan();
  const { dispatchMany } = useDispatch();
  const [activeAssistant] = useState<AssistantProvider>(
    () => assistant ?? createAssistant({ apiKeyPort: DEFAULT_API_KEY_PORT }),
  );
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!plan || prompt.trim().length === 0) return;
    setLoading(true);
    setErrorMessage(null);
    const res = await activeAssistant.interpret({ prompt: prompt.trim(), plan });
    setLoading(false);
    if (!res.ok) {
      setErrorMessage(res.error.message || res.error.code);
      return;
    }
    setResult(res.value);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Celebration AI Assistant">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge
            text={activeAssistant.mode === 'live' ? 'Live Mode' : 'Offline Mode'}
            variant={activeAssistant.mode === 'live' ? 'success' : 'neutral'}
          />
          <Button variant="ghost" onClick={() => setIsSettingsOpen(true)}>
            API Key Settings
          </Button>
        </div>

        <p className="text-xs text-stone-600">
          {getModeExplanation(activeAssistant.mode, hasApiKey)}
        </p>

        <AssistantPromptForm
          prompt={prompt}
          loading={loading}
          disabled={!plan}
          onPromptChange={setPrompt}
          onSubmit={handleSubmit}
        />

        <AssistantResponseDisplay
          errorMessage={errorMessage}
          result={result}
          onDismiss={() => setResult(null)}
          onApply={(cmds) => {
            dispatchMany(cmds);
            setResult(null);
            onClose();
          }}
        />
      </div>

      <ApiKeySettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={(k) => {
          DEFAULT_API_KEY_PORT.set(k);
          setHasApiKey(true);
        }}
        onClearKey={() => {
          DEFAULT_API_KEY_PORT.clear();
          setHasApiKey(false);
        }}
      />
    </Dialog>
  );
}
