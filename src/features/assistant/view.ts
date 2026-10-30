import { AI_DISCLOSURE_FIELDS, AI_WITHHELD_FIELDS } from '../../ai/disclosure';

export { describeCommand } from './describe';

export const QUICK_CHIPS: readonly string[] = [
  'Transfer 5000 from venue to catering',
  'Set contingency to 12%',
  'Mark photography task completed',
  'Log spend 25000 on venue',
];

export interface PrivacyDisclosureInfo {
  readonly sentFields: readonly string[];
  readonly withheldFields: readonly string[];
}

/** Provides single-source-of-truth field lists for assistant privacy disclosure. */
export function getPrivacyDisclosureInfo(): PrivacyDisclosureInfo {
  return {
    sentFields: AI_DISCLOSURE_FIELDS,
    withheldFields: AI_WITHHELD_FIELDS,
  };
}

/** Explains active assistant operation mode and BYOK client requirements. */
export function getModeExplanation(mode: 'offline' | 'live', hasApiKey: boolean): string {
  if (mode === 'live' && hasApiKey) {
    return 'Live Gemini AI Assistant active. Context sanitized per privacy contract.';
  }
  if (hasApiKey) {
    return 'Operating in offline mode. Live network requests will activate on valid input.';
  }
  return 'Offline Local Assistant active. Heuristic command parser running locally in your browser. Add a Google Gemini API key to activate live GenAI reasoning.';
}
