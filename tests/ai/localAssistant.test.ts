import { describe, expect, it } from 'vitest';
import type { IsoDate } from '../../src/domain/dates';
import { createLocalAssistant } from '../../src/ai/local/localAssistant';
import { createLocalIdeaProvider } from '../../src/ai/local/localIdeaProvider';
import { LOCAL_TEST_PLAN as TEST_PLAN } from '../helpers/aiFixtures';

type ExpectedKind = 'commands' | 'clarify' | 'refuse';
type Row = readonly [prompt: string, kind: ExpectedKind, cmdType?: string];

const CASES: readonly Row[] = [
  ['transfer 500 from venue to catering', 'commands', 'TRANSFER_BUDGET'],
  ['move 10% from decor to music', 'commands', 'TRANSFER_BUDGET'],
  ['reallocate 2k from catering to photography', 'commands', 'TRANSFER_BUDGET'],
  ['shift 1.5 lakh from venue to catering', 'commands', 'TRANSFER_BUDGET'],
  ['transfer 10,000 from venue to catering', 'commands', 'TRANSFER_BUDGET'],
  ['move $500 from hall to food', 'commands', 'TRANSFER_BUDGET'],
  ['transfer 150k from site to drinks', 'commands', 'TRANSFER_BUDGET'],
  ['move 5% from floral to dj', 'commands', 'TRANSFER_BUDGET'],
  ['transfer 1000 from veneu to catring', 'commands', 'TRANSFER_BUDGET'],
  ['move 2k from fotography to decor', 'commands', 'TRANSFER_BUDGET'],
  ['transfer 2.5 lakh from hall to food', 'commands', 'TRANSFER_BUDGET'],
  ['shift 1.5L from venue to catering', 'commands', 'TRANSFER_BUDGET'],
  ['move 20% from place to beverages', 'commands', 'TRANSFER_BUDGET'],
  ['transfer 5k from pictures to sound', 'commands', 'TRANSFER_BUDGET'],
  ['increase venue budget by 10%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['cut catering by 15%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['reduce decor by 20%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['raise music by 5%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['boost photography by 10%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['cut hall by 10%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['increase food by 25%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['boost floral by 15%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['reduce sound by 10%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['lower drinks by 5%', 'commands', 'SET_CATEGORY_WEIGHT'],
  ['set contingency to 10%', 'commands', 'SET_CONTINGENCY'],
  ['make buffer 12%', 'commands', 'SET_CONTINGENCY'],
  ['change contingency rate to 8%', 'commands', 'SET_CONTINGENCY'],
  ['set contingency buffer 15%', 'commands', 'SET_CONTINGENCY'],
  ['set buffer to 5%', 'commands', 'SET_CONTINGENCY'],
  ['mark venue booking as done', 'commands', 'TOGGLE_TASK'],
  ['complete photographer search', 'commands', 'TOGGLE_TASK'],
  ['finish decorator consultation', 'commands', 'TOGGLE_TASK'],
  ['mark task complete: Book venue', 'commands', 'TOGGLE_TASK'],
  ['done with catering menu', 'commands', 'TOGGLE_TASK'],
  ['undo send invitations', 'commands', 'TOGGLE_TASK'],
  ['mark cake tasting as incomplete', 'commands', 'TOGGLE_TASK'],
  ['uncheck send invitations', 'commands', 'TOGGLE_TASK'],
  ['reopen cake tasting', 'commands', 'TOGGLE_TASK'],
  ['move cake tasting 5 days earlier', 'commands', 'RESCHEDULE_TASK'],
  ['postpone coordinator call by 3 days', 'commands', 'RESCHEDULE_TASK'],
  ['delay coordinator call by 2 days', 'commands', 'RESCHEDULE_TASK'],
  ['advance cake tasting by 4 days earlier', 'commands', 'RESCHEDULE_TASK'],
  ['shift coordinator call 5 days later', 'commands', 'RESCHEDULE_TASK'],
  ['save idea Rustic Barn Setting', 'commands', 'SAVE_IDEA'],
  ['save idea Acoustic Folk Trio', 'commands', 'SAVE_IDEA'],
  ['save idea Photo Booth Fun', 'commands', 'SAVE_IDEA'],
  ['save idea Midnight Taco Truck', 'commands', 'SAVE_IDEA'],
  ['save idea Custom Neon Sign', 'commands', 'SAVE_IDEA'],
  ['transfer -500 from venue to catering', 'refuse'],
  ['transfer 500 from venue to venue', 'refuse'],
  ['transfer 0 from venue to catering', 'refuse'],
  ['set contingency to -5%', 'refuse'],
  ['set contingency to 150%', 'refuse'],
  ['move cake tasting 200 days earlier', 'refuse'],
  ['asdkjasdh lakjsdh', 'clarify'],
  ['transfer 500', 'clarify'],
  ['mark task done', 'clarify'],
  ['increase 10%', 'clarify'],
  ['move 100 from unknown1 to unknown2', 'clarify'],
];

describe('localAssistant table tests (59 phrasings)', () => {
  const assistant = createLocalAssistant();
  const today = '2026-10-30' as IsoDate;

  it.each(CASES)('interprets %s -> %s', async (...args) => {
    const prompt = args[0] ?? '';
    const kind = args[1] as ExpectedKind;
    const cmdType = args[2];
    const res = await assistant.interpret({ prompt, plan: TEST_PLAN, today });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.kind).toBe(kind);
    if (kind === 'commands' && cmdType && res.value.kind === 'commands') {
      expect(res.value.commands[0]?.type).toBe(cmdType);
    }
  });

  it('correctly parses lakh, k, and comma amounts into minor units', async () => {
    const r1 = await assistant.interpret({
      prompt: 'shift 1.5 lakh from venue to catering',
      plan: TEST_PLAN,
      today,
    });
    if (r1.ok && r1.value.kind === 'commands') {
      const c1 = r1.value.commands[0];
      if (c1?.type === 'TRANSFER_BUDGET') expect(c1.amount).toBe(15_000_000);
    }
    const r2 = await assistant.interpret({
      prompt: 'transfer 10,000 from venue to catering',
      plan: TEST_PLAN,
      today,
    });
    if (r2.ok && r2.value.kind === 'commands') {
      const c2 = r2.value.commands[0];
      if (c2?.type === 'TRANSFER_BUDGET') expect(c2.amount).toBe(1_000_000);
    }
  });

  it('suggests ideas using local provider', async () => {
    const provider = createLocalIdeaProvider();
    const res = await provider.suggest({ plan: TEST_PLAN, limit: 3 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.length).toBeLessThanOrEqual(3);
  });
});
