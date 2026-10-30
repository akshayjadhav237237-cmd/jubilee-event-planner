export type ExportExtension = 'md' | 'csv' | 'ics' | 'json';

/** Converts a text string into a clean lowercase hyphen-separated slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Generates a standardized Jubilee export filename combining title, date, and extension. */
export function generateExportFilename(title: string, date: string, ext: ExportExtension): string {
  const titleSlug = slugify(title);
  const dateSlug = slugify(date);
  const baseSlug = titleSlug.length > 0 ? titleSlug : 'event';

  if (dateSlug.length > 0) {
    return `jubilee-${baseSlug}-${dateSlug}.${ext}`;
  }
  return `jubilee-${baseSlug}.${ext}`;
}
