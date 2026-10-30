import { useState, type ChangeEvent, type JSX } from 'react';
import type { Plan } from '../../domain/types';
import { Dialog } from '../../shared/ui/Dialog';
import { Button } from '../../shared/ui/Button';
import { Alert } from '../../shared/ui/Alert';
import { Textarea } from '../../shared/ui/Textarea';
import { importPlanFromJson } from '../../state/persistence';

export interface RestoreModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onRestore: (plan: Plan) => void;
}

interface RestoreFileInputProps {
  readonly onFileLoaded: (content: string) => void;
}

function RestoreFileInput({ onFileLoaded }: RestoreFileInputProps): JSX.Element {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (): void => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      onFileLoaded(text);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <label
        htmlFor="restore-file-input"
        className="block text-xs font-semibold text-ink-text mb-1.5"
      >
        Upload Backup File (.json)
      </label>
      <input
        id="restore-file-input"
        type="file"
        accept=".json,application/json"
        onChange={handleChange}
        className="block w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-800 hover:file:bg-stone-200 cursor-pointer"
      />
    </div>
  );
}

/** Modal dialog for uploading or pasting a JSON backup payload to restore a celebration plan. */
export function RestoreModal({ isOpen, onClose, onRestore }: RestoreModalProps): JSX.Element {
  const [rawJson, setRawJson] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleClose = (): void => {
    setError(null);
    setRawJson('');
    onClose();
  };

  const executeRestore = (text: string): void => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please choose a valid JSON backup file or paste backup data.');
      return;
    }

    const result = importPlanFromJson(trimmed);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setError(null);
    setRawJson('');
    onRestore(result.value);
    onClose();
  };

  const handleFileLoaded = (text: string): void => {
    setRawJson(text);
    executeRestore(text);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} title="Restore Plan from Backup" id="restore-modal">
      <div className="space-y-4">
        {error && <Alert severity="critical" message={error} />}

        <RestoreFileInput onFileLoaded={handleFileLoaded} />

        <div>
          <label
            htmlFor="restore-textarea"
            className="block text-xs font-semibold text-ink-text mb-1.5"
          >
            Or Paste Raw Backup JSON
          </label>
          <Textarea
            id="restore-textarea"
            rows={6}
            value={rawJson}
            placeholder="Paste your JSON backup payload here..."
            onChange={(e) => setRawJson(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => executeRestore(rawJson)}>
            Restore Plan
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
