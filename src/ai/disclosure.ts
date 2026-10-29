/** Single source of truth for fields sent to AI providers. */
export const AI_DISCLOSURE_FIELDS = [
  'eventType',
  'subFormat',
  'guestCount',
  'currency',
  'totalBudget',
  'setting',
  'flags',
  'priorities',
  'daysUntilEvent',
  'categories',
  'tasks',
  'sanitizedUserText',
] as const;

/** Single source of truth for confidential fields withheld from AI providers. */
export const AI_WITHHELD_FIELDS = [
  'title',
  'exactEventDate',
  'vendorNames',
  'vendorQuotes',
  'actualSpend',
  'savedIdeas',
  'apiKey',
] as const;

export type AiDisclosureField = (typeof AI_DISCLOSURE_FIELDS)[number];
export type AiWithheldField = (typeof AI_WITHHELD_FIELDS)[number];

/** Checks whether a given field name is an authorized AI disclosure field. */
export function isAiDisclosureField(field: string): field is AiDisclosureField {
  return (AI_DISCLOSURE_FIELDS as readonly string[]).includes(field);
}

/** Checks whether a given field name is a strictly withheld privacy field. */
export function isAiWithheldField(field: string): field is AiWithheldField {
  return (AI_WITHHELD_FIELDS as readonly string[]).includes(field);
}
