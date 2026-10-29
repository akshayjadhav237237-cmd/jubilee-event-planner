import { MAX_NOTES_LENGTH } from '../../config/constants';

const ANGLE_BRACKETS = /[<>]/g;
const CONSECUTIVE_WHITESPACE = /\s+/g;

function stripNonPrintableControls(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if ((code >= 32 && code !== 127) || code === 10 || code === 9) {
      result += text[i];
    }
  }
  return result;
}

/** Sanitizes user text by removing controls, stripping angle brackets, collapsing whitespace, and truncating. */
export function sanitizeUserInput(text: string): string {
  const strippedControls = stripNonPrintableControls(text);
  const strippedAngles = strippedControls.replace(ANGLE_BRACKETS, '');
  const collapsedWhitespace = strippedAngles.replace(CONSECUTIVE_WHITESPACE, ' ').trim();
  return collapsedWhitespace.slice(0, MAX_NOTES_LENGTH);
}
