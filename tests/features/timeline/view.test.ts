import { describe, expect, it } from 'vitest';
import type { EventBrief, Task } from '../../../src/domain/types';
import type { IsoDate } from '../../../src/domain/dates';
import {
  checkScheduleCompression,
  getDependencyHints,
  groupTasksByPhase,
  validateRescheduleDate,
} from '../../../src/features/timeline/view';

const SAMPLE_TASKS: readonly Task[] = [
  {
    id: 'wed-01',
    title: 'Establish vision',
    category: 'venue',
    dueDate: '2027-01-01' as IsoDate,
    completed: true,
    dependencies: [],
  },
  {
    id: 'wed-02',
    title: 'Draft guest list',
    category: 'venue',
    dueDate: '2027-01-15' as IsoDate,
    completed: false,
    dependencies: ['wed-01'],
  },
  {
    id: 'custom-task',
    title: 'Special family photo',
    category: 'photography',
    dueDate: '2027-02-01' as IsoDate,
    completed: false,
    dependencies: ['wed-02', 'non-existent-dep'],
  },
];

const SAMPLE_BRIEF: EventBrief = {
  title: 'Wedding Brief',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 150,
  totalBudget: 10000000,
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
};

describe('Timeline view model', () => {
  it('groups tasks by planning phase', () => {
    const groups = groupTasksByPhase(SAMPLE_TASKS);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0]?.phase).toContain('Phase 1');
    expect(groups.some((g) => g.phase === 'General Planning')).toBe(true);
  });

  it('resolves dependency hints with completion status', () => {
    const t1 = SAMPLE_TASKS[1];
    const t2 = SAMPLE_TASKS[2];
    if (!t1 || !t2) throw new Error('Missing sample tasks');

    const hints = getDependencyHints(t1, SAMPLE_TASKS);
    expect(hints.length).toBe(1);
    expect(hints[0]?.id).toBe('wed-01');
    expect(hints[0]?.completed).toBe(true);

    const hintsCustom = getDependencyHints(t2, SAMPLE_TASKS);
    expect(hintsCustom.length).toBe(1);
    expect(hintsCustom[0]?.id).toBe('wed-02');
  });

  it('detects schedule compression for short notice events', () => {
    const today = '2026-10-30' as IsoDate;
    const farBrief = { ...SAMPLE_BRIEF, eventDate: '2027-05-01' as IsoDate };
    expect(checkScheduleCompression(farBrief, today).isCompressed).toBe(false);

    const nearBrief = { ...SAMPLE_BRIEF, eventDate: '2026-11-10' as IsoDate };
    const compressed = checkScheduleCompression(nearBrief, today);
    expect(compressed.isCompressed).toBe(true);
    expect(compressed.reason).toBeDefined();
  });

  it('validates reschedule dates', () => {
    expect(validateRescheduleDate('2027-06-15').ok).toBe(true);
    expect(validateRescheduleDate('invalid-date').ok).toBe(false);
  });
});
