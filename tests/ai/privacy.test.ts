import { describe, expect, it } from 'vitest';
import { createMemoryApiKey } from '../../src/ai/apiKey';
import { buildAiContext } from '../../src/ai/context';
import {
  AI_DISCLOSURE_FIELDS,
  AI_WITHHELD_FIELDS,
  isAiDisclosureField,
  isAiWithheldField,
} from '../../src/ai/disclosure';
import { createAssistant } from '../../src/ai/factory';
import type { FetchPort, FetchResponse } from '../../src/ai/ports';
import type { IsoDate } from '../../src/domain/dates';
import type { Plan } from '../../src/domain/types';
import { DEFAULT_WEDDING_BRIEF } from '../helpers/briefs';

const CANARY_TITLE = 'CANARY_TITLE_SECRET_WEDDING_123';
const CANARY_FUTURE_DATE = '2029-11-25' as IsoDate;
const CANARY_PAST_DATE = '2024-01-01' as IsoDate;
const CANARY_VENDOR = 'SECRET_VENDOR_ACME_CATERING_456';
const CANARY_QUOTE_NOTE = 'CONFIDENTIAL_DISCOUNT_NOTE_789';
const CANARY_SPEND = 999888777;
const CANARY_IDEA_TITLE = 'TOP_SECRET_FIREWORK_DISPLAY_321';
const CANARY_API_KEY = 'AIzaSy_FAKE_SECRET_KEY_999';

function createCanaryPlan(eventDate: IsoDate): Plan {
  return {
    id: 'plan_canary_001',
    brief: {
      ...DEFAULT_WEDDING_BRIEF,
      title: CANARY_TITLE,
      eventDate,
    },
    budget: {
      totalBudget: 10000000,
      contingencyRate: 0.1,
      categories: [
        { id: 'cat_cater', name: 'Catering', allocated: 4000000, spent: CANARY_SPEND, weight: 0.4 },
        { id: 'cat_venue', name: 'Venue', allocated: 5000000, spent: 0, weight: 0.5 },
      ],
    },
    timeline: [
      {
        id: 'task_001',
        title: 'Book caterer',
        dueDate: eventDate,
        completed: false,
        category: 'cat_cater',
        dependencies: [],
      },
    ],
    vendorChecklist: [],
    quotes: [
      {
        id: 'q_001',
        vendorName: CANARY_VENDOR,
        category: 'cat_cater',
        amount: 3500000,
        status: 'accepted',
        notes: CANARY_QUOTE_NOTE,
      },
    ],
    ideas: [
      {
        id: 'idea_001',
        title: CANARY_IDEA_TITLE,
        category: 'theme',
        description: 'Secret theme',
        votes: 5,
      },
    ],
    createdAt: '2026-10-30' as IsoDate,
    updatedAt: '2026-10-30' as IsoDate,
  };
}

describe('AI Privacy & Disclosure Specifications', () => {
  it('enforces disclosure and withheld field specifications and exclusivity', () => {
    expect(AI_DISCLOSURE_FIELDS).toContain('eventType');
    expect(AI_DISCLOSURE_FIELDS).toContain('daysUntilEvent');
    expect(AI_WITHHELD_FIELDS).toContain('title');
    expect(AI_WITHHELD_FIELDS).toContain('exactEventDate');
    expect(AI_WITHHELD_FIELDS).toContain('vendorNames');
    expect(AI_WITHHELD_FIELDS).toContain('vendorQuotes');
    expect(AI_WITHHELD_FIELDS).toContain('actualSpend');
    expect(AI_WITHHELD_FIELDS).toContain('savedIdeas');
    expect(AI_WITHHELD_FIELDS).toContain('apiKey');

    for (const field of AI_WITHHELD_FIELDS) {
      expect(isAiWithheldField(field)).toBe(true);
      expect(isAiDisclosureField(field)).toBe(false);
    }
  });

  it('buildAiContext strips all confidential canary strings and data from serialized output', () => {
    const plan = createCanaryPlan(CANARY_FUTURE_DATE);
    const context = buildAiContext(plan, '2026-10-30' as IsoDate);
    const serialized = JSON.stringify(context);

    expect(serialized).not.toContain(CANARY_TITLE);
    expect(serialized).not.toContain('2029-11-25');
    expect(serialized).not.toContain(CANARY_VENDOR);
    expect(serialized).not.toContain(CANARY_QUOTE_NOTE);
    expect(serialized).not.toContain(String(CANARY_SPEND));
    expect(serialized).not.toContain(CANARY_IDEA_TITLE);
    expect(serialized).not.toContain(CANARY_API_KEY);

    expect(context.daysUntilEvent).toBeGreaterThan(0);
    expect(context.categories[0]?.allocatedMinor).toBe(4000000);
    expect(context.tasks[0]?.title).toBe('Book caterer');
  });

  it('handles past-date plans correctly without leaking raw past date string', () => {
    const plan = createCanaryPlan(CANARY_PAST_DATE);
    const context = buildAiContext(plan, '2026-10-30' as IsoDate);
    const serialized = JSON.stringify(context);

    expect(context.daysUntilEvent).toBeLessThan(0);
    expect(serialized).not.toContain('2024-01-01');
    expect(serialized).not.toContain(CANARY_TITLE);
  });

  it('assistant factory keeps API key only in headers and never in context, body, or URL', async () => {
    let capturedUrl = '';
    let capturedBody = '';
    let capturedHeaders: Record<string, string> = {};

    const payload = JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text: '{"kind":"commands","commands":[],"summary":"Executed"}' }] },
        },
      ],
    });
    const mockFetch: FetchPort = async (url, init) => {
      capturedUrl = url;
      capturedBody = init?.body ?? '';
      capturedHeaders = init?.headers ?? {};
      return {
        ok: true,
        status: 200,
        text: async () => payload,
        json: async () => JSON.parse(payload),
      } as FetchResponse;
    };

    const keyPort = createMemoryApiKey(CANARY_API_KEY);
    const assistant = createAssistant({ apiKeyPort: keyPort, fetchPort: mockFetch });
    const plan = createCanaryPlan(CANARY_FUTURE_DATE);

    const res = await assistant.interpret({ prompt: 'transfer 500 from venue to catering', plan });
    expect(res.ok).toBe(true);
    expect(capturedUrl).not.toContain(CANARY_API_KEY);
    expect(capturedBody).not.toContain(CANARY_API_KEY);
    expect(capturedHeaders['x-goog-api-key']).toBe(CANARY_API_KEY);
  });

  it('assistant factory falls back to local engine with fallbackNotice when live call fails or no key', async () => {
    const failingFetch: FetchPort = async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
      json: async () => ({ error: 'fail' }),
    });

    const keyPort = createMemoryApiKey(CANARY_API_KEY);
    const assistant = createAssistant({ apiKeyPort: keyPort, fetchPort: failingFetch });
    const plan = createCanaryPlan(CANARY_FUTURE_DATE);

    const failedRes = await assistant.interpret({ prompt: 'set contingency to 10%', plan });
    expect(failedRes.ok).toBe(true);
    if (failedRes.ok) {
      expect(failedRes.value.fallbackNotice).toBeDefined();
      expect(failedRes.value.fallbackNotice).toContain('Live assistant unavailable');
    }

    const emptyKeyPort = createMemoryApiKey(null);
    const offlineAssistant = createAssistant({ apiKeyPort: emptyKeyPort });
    const offlineRes = await offlineAssistant.interpret({ prompt: 'set contingency to 10%', plan });
    expect(offlineRes.ok).toBe(true);
    if (offlineRes.ok) {
      expect(offlineAssistant.mode).toBe('offline');
      expect(offlineRes.value.fallbackNotice).toContain('Live assistant unavailable');
    }
  });
});
