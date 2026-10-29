export type ClassValue = string | false | null | undefined;

/** Combines conditional class names into a single trimmed space-delimited string. */
export function cx(...classes: readonly ClassValue[]): string {
  const result: string[] = [];
  for (let i = 0; i < classes.length; i += 1) {
    const item = classes[i];
    if (typeof item === 'string' && item.trim().length > 0) {
      result.push(item.trim());
    }
  }
  return result.join(' ');
}
