export const APP_NAME = 'Jubilee';

export const SCHEMA_VERSION = 1;

export const STORAGE_KEY = 'jubilee_plan_v1';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const GEMINI_ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const MAX_NOTES_LENGTH = 1000;

export const REQUEST_TIMEOUT_MS = 15000;

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const LIVE_SITE_URL = 'https://akshayjadhav237237-cmd.github.io/jubilee-event-planner/';
