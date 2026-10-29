import { describe, expect, it } from 'vitest';
import type { AssistantInput, FetchPort, FetchResponse } from '../../src/ai/ports';
import {
  createGeminiAssistant,
  createLocalAssistant,
  createMemoryApiKey,
  createRandomNonce,
} from '../../src/ai';
import { makeBrief } from '../helpers/briefs';
import { buildPlan } from '../../src/state/buildPlan';

function createMockFetch(responseBody: string): FetchPort {
  const geminiPayload = JSON.stringify({
    candidates: [{ content: { parts: [{ text: responseBody }] } }],
  });
  return async (): Promise<FetchResponse> => ({
    ok: true,
    status: 200,
    text: async () => geminiPayload,
    json: async () => JSON.parse(geminiPayload),
  });
}

function createTestPlan() {
  const brief = makeBrief({ eventType: 'wedding', totalBudget: 1_000_000 });
  let count = 0;
  return buildPlan(brief, {
    clock: () => new Date('2026-06-01T00:00:00Z'),
    ids: () => `test_plan_${++count}`,
  });
}

describe('AssistantProvider Shared Contract', () => {
  const plan = createTestPlan();
  const apiKeyPort = createMemoryApiKey('test-key-123');
  const noncePort = createRandomNonce();

  const commandsPayload = JSON.stringify({
    kind: 'commands',
    commands: [
      {
        type: 'TRANSFER_BUDGET',
        fromCategoryId: 'venue',
        toCategoryId: 'catering',
        amount: 100000,
      },
    ],
    summary: 'Transferred 1,000 from venue to catering.',
  });

  const clarifyPayload = JSON.stringify({
    kind: 'clarify',
    question: 'Which category would you like to move funds to?',
  });

  const refusePayload = JSON.stringify({
    kind: 'refuse',
    reason: 'Cannot transfer budget to the same category.',
  });

  const liveCommandsProvider = createGeminiAssistant({
    fetchPort: createMockFetch(commandsPayload),
    apiKeyPort,
    noncePort,
    clock: () => 1000,
  });

  const liveClarifyProvider = createGeminiAssistant({
    fetchPort: createMockFetch(clarifyPayload),
    apiKeyPort,
    noncePort,
    clock: () => 2000,
  });

  const liveRefuseProvider = createGeminiAssistant({
    fetchPort: createMockFetch(refusePayload),
    apiKeyPort,
    noncePort,
    clock: () => 3000,
  });

  const offlineProvider = createLocalAssistant();

  it('exposes designated mode identifiers', () => {
    expect(offlineProvider.mode).toBe('offline');
    expect(liveCommandsProvider.mode).toBe('live');
  });

  it('both providers return commands variant for valid executable prompts', async () => {
    const input: AssistantInput = {
      prompt: 'transfer 1000 from venue to catering',
      plan,
    };

    const offlineRes = await offlineProvider.interpret(input);
    expect(offlineRes.ok).toBe(true);
    if (offlineRes.ok) {
      expect(offlineRes.value.kind).toBe('commands');
      if (offlineRes.value.kind === 'commands') {
        expect(offlineRes.value.commands.length).toBeGreaterThan(0);
        expect(offlineRes.value.summary.length).toBeGreaterThan(0);
      }
    }

    const liveRes = await liveCommandsProvider.interpret(input);
    expect(liveRes.ok).toBe(true);
    if (liveRes.ok) {
      expect(liveRes.value.kind).toBe('commands');
      if (liveRes.value.kind === 'commands') {
        expect(liveRes.value.commands.length).toBeGreaterThan(0);
        expect(liveRes.value.summary.length).toBeGreaterThan(0);
      }
    }
  });

  it('both providers return clarify variant for ambiguous inputs', async () => {
    const input: AssistantInput = {
      prompt: 'move some money somewhere',
      plan,
    };

    const offlineRes = await offlineProvider.interpret(input);
    expect(offlineRes.ok).toBe(true);
    if (offlineRes.ok) {
      expect(offlineRes.value.kind).toBe('clarify');
      if (offlineRes.value.kind === 'clarify') {
        expect(offlineRes.value.question.length).toBeGreaterThan(0);
      }
    }

    const liveRes = await liveClarifyProvider.interpret(input);
    expect(liveRes.ok).toBe(true);
    if (liveRes.ok) {
      expect(liveRes.value.kind).toBe('clarify');
      if (liveRes.value.kind === 'clarify') {
        expect(liveRes.value.question.length).toBeGreaterThan(0);
      }
    }
  });

  it('both providers return refuse variant for impossible instructions', async () => {
    const input: AssistantInput = {
      prompt: 'transfer 500 from venue to venue',
      plan,
    };

    const offlineRes = await offlineProvider.interpret(input);
    expect(offlineRes.ok).toBe(true);
    if (offlineRes.ok) {
      expect(offlineRes.value.kind).toBe('refuse');
      if (offlineRes.value.kind === 'refuse') {
        expect(offlineRes.value.reason.length).toBeGreaterThan(0);
      }
    }

    const liveRes = await liveRefuseProvider.interpret(input);
    expect(liveRes.ok).toBe(true);
    if (liveRes.ok) {
      expect(liveRes.value.kind).toBe('refuse');
      if (liveRes.value.kind === 'refuse') {
        expect(liveRes.value.reason.length).toBeGreaterThan(0);
      }
    }
  });
});
