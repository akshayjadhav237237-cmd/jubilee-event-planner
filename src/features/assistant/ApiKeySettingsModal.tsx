import { useState, type FormEvent, type JSX } from 'react';
import { Dialog, Input, Field, Button } from '../../shared/ui';
import { getPrivacyDisclosureInfo } from './view';

export interface ApiKeySettingsModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSaveKey: (key: string) => void;
  readonly onClearKey: () => void;
}

/** Dialog modal for Bring-Your-Own-Key configuration and privacy contract disclosure. */
export function ApiKeySettingsModal({
  open,
  onClose,
  onSaveKey,
  onClearKey,
}: ApiKeySettingsModalProps): JSX.Element {
  const [keyInput, setKeyInput] = useState('');
  const { sentFields, withheldFields } = getPrivacyDisclosureInfo();

  const handleSave = (e: FormEvent): void => {
    e.preventDefault();
    if (keyInput.trim().length > 0) {
      onSaveKey(keyInput.trim());
      setKeyInput('');
      onClose();
    }
  };

  const handleClear = (): void => {
    onClearKey();
    setKeyInput('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="AI Assistant Settings">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <p className="text-stone-600">
          Optionally provide a Google Gemini API Key to enable live cloud reasoning. Keys remain in
          memory only and are never persisted or shared. Get a key at{' '}
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-gold-accent underline font-semibold"
          >
            Google AI Studio
          </a>
          .
        </p>

        <Field id="field-gemini-key" label="Gemini API Key">
          {(props) => (
            <Input
              {...props}
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
          )}
        </Field>

        <div className="bg-sand-accent/20 p-3 rounded-lg space-y-2 border border-stone-200">
          <span className="font-semibold text-stone-800 block">Privacy Contract:</span>
          <div>
            <span className="text-stone-600 font-medium">Fields Disclosed to AI:</span>
            <p className="font-mono text-[10px] text-stone-500 mt-0.5">{sentFields.join(', ')}</p>
          </div>
          <div>
            <span className="text-emerald-800 font-medium">Confidential Fields Withheld:</span>
            <p className="font-mono text-[10px] text-emerald-700 mt-0.5">
              {withheldFields.join(', ')}
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-3 border-t border-stone-200">
          <Button variant="ghost" type="button" onClick={handleClear}>
            Clear Key (Offline)
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Key
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
