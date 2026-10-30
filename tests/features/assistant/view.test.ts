import { describe, expect, it } from 'vitest';
import type { PlanCommand } from '../../../src/domain/commands';
import type { IsoDate } from '../../../src/domain/dates';
import {
  describeCommand,
  getModeExplanation,
  getPrivacyDisclosureInfo,
  QUICK_CHIPS,
} from '../../../src/features/assistant/view';

describe('Assistant view model & command descriptor', () => {
  it('describes each command type in plain language', () => {
    const commands: readonly PlanCommand[] = [
      {
        type: 'SET_BRIEF',
        brief: {
          title: 'New Gala',
          eventType: 'wedding',
          subFormat: 'traditional',
          guestCount: 150,
          totalBudget: 5000000,
          currency: 'INR',
          eventDate: '2027-10-10' as IsoDate,
          setting: 'indoor',
          flags: {
            kids: false,
            elders: false,
            dietary: false,
            accessibility: false,
            openBar: false,
            amplifiedMusic: false,
            surprise: false,
          },
          top3Priorities: ['Venue', 'Catering', 'Photo'],
        },
      },
      { type: 'SET_CATEGORY_WEIGHT', categoryId: 'venue', weight: 35 },
      { type: 'TRANSFER_BUDGET', fromCategoryId: 'venue', toCategoryId: 'catering', amount: 50000 },
      { type: 'SET_CONTINGENCY', rate: 12 },
      { type: 'LOG_SPEND', categoryId: 'catering', amount: 20000 },
      { type: 'TOGGLE_TASK', taskId: 'wed-01' },
      { type: 'RESCHEDULE_TASK', taskId: 'wed-01', dueDate: '2027-02-01' as IsoDate },
      {
        type: 'ADD_QUOTE',
        quote: {
          id: 'q-1',
          vendorName: 'Royal Tent',
          category: 'venue',
          amount: 25000,
          status: 'shortlisted',
          notes: 'Lawn setup',
        },
      },
      { type: 'REMOVE_QUOTE', quoteId: 'q-1' },
      { type: 'TOGGLE_CHECKLIST_ITEM', itemId: 'chk-1' },
      {
        type: 'SAVE_IDEA',
        idea: {
          id: 'idea-1',
          title: 'Mandap',
          category: 'theme',
          description: 'Decor',
          votes: 1,
        },
      },
      { type: 'REMOVE_IDEA', ideaId: 'idea-1' },
    ];

    for (const cmd of commands) {
      const desc = describeCommand(cmd);
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(5);
    }
  });

  it('provides quick chips and privacy disclosure metadata', () => {
    expect(QUICK_CHIPS.length).toBe(4);
    const privacy = getPrivacyDisclosureInfo();
    expect(privacy.sentFields).toContain('eventType');
    expect(privacy.withheldFields).toContain('exactEventDate');
  });

  it('generates appropriate mode explanations', () => {
    expect(getModeExplanation('live', true)).toContain('Live Gemini');
    expect(getModeExplanation('offline', true)).toContain('offline mode');
    expect(getModeExplanation('offline', false)).toContain('Offline Local Assistant');
  });
});
