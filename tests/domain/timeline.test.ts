import { describe, expect, it } from 'vitest';
import { BIRTHDAY_TASKS } from '../../src/data/tasks/birthdayTasks';
import { COMMUNITY_TASKS } from '../../src/data/tasks/communityTasks';
import { CONDITIONAL_TASKS } from '../../src/data/tasks/conditionalTasks';
import { WEDDING_TASKS } from '../../src/data/tasks/weddingTasks';
import { addDays, type IsoDate } from '../../src/domain/dates';
import { buildTasks, rescheduleTask, toggleTask } from '../../src/domain/timeline/engine';
import {
  hasDependencyCycle,
  sortTasksWithFallback,
  topologicalSort,
} from '../../src/domain/timeline/sort';
import type { EventBrief, Task } from '../../src/domain/types';

const BASE_BRIEF: EventBrief = {
  title: 'Celebration',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 100,
  totalBudget: 5000000,
  currency: 'INR',
  eventDate: '2027-06-01' as IsoDate,
  setting: 'indoor',
  flags: {
    kids: true,
    elders: false,
    dietary: true,
    accessibility: false,
    openBar: true,
    amplifiedMusic: false,
    surprise: false,
  },
  top3Priorities: ['venue', 'catering', 'decor'],
};

describe('Timeline Data and Tasks Catalog', () => {
  it('satisfies minimum task counts across all categories', () => {
    expect(WEDDING_TASKS.length).toBeGreaterThanOrEqual(16);
    expect(BIRTHDAY_TASKS.length).toBeGreaterThanOrEqual(12);
    expect(COMMUNITY_TASKS.length).toBeGreaterThanOrEqual(14);
    expect(CONDITIONAL_TASKS.length).toBeGreaterThanOrEqual(12);
    expect(
      CONDITIONAL_TASKS.every(
        (t) => typeof t.adaptationId === 'string' && t.adaptationId.length > 0,
      ),
    ).toBe(true);
  });

  it('covers all five lifecycle phases', () => {
    const phases = new Set(WEDDING_TASKS.map((t) => t.phase));
    expect(phases.has('Phase 1: Concept & Venue')).toBe(true);
    expect(phases.has('Phase 2: Vendors & Bookings')).toBe(true);
    expect(phases.has('Phase 3: Details & Design')).toBe(true);
    expect(phases.has('Phase 4: Final Preparations')).toBe(true);
    expect(phases.has('Phase 5: Event Day Execution')).toBe(true);
  });
});

describe('Topological Sorting and Cycle Detection', () => {
  it('verifies dependency ordering so prerequisites precede dependents', () => {
    const tasks = buildTasks(BASE_BRIEF, undefined, '2026-01-01' as IsoDate);
    const indexMap = new Map<string, number>();
    tasks.forEach((t, i) => indexMap.set(t.id, i));

    for (const task of tasks) {
      const taskIdx = indexMap.get(task.id) ?? 0;
      for (const depId of task.dependencies) {
        const depIdx = indexMap.get(depId);
        if (depIdx !== undefined) {
          expect(depIdx).toBeLessThan(taskIdx);
        }
      }
    }
  });

  it('detects cycles and falls back to stable due date order', () => {
    const cyclicTasks: readonly Task[] = [
      {
        id: 't1',
        title: 'Task 1',
        dueDate: '2026-05-10' as IsoDate,
        completed: false,
        category: 'v',
        dependencies: ['t2'],
      },
      {
        id: 't2',
        title: 'Task 2',
        dueDate: '2026-05-05' as IsoDate,
        completed: false,
        category: 'v',
        dependencies: ['t1'],
      },
    ];
    expect(hasDependencyCycle(cyclicTasks)).toBe(true);
    expect(topologicalSort(cyclicTasks).ok).toBe(false);

    const fallback = sortTasksWithFallback(cyclicTasks);
    expect(fallback[0]?.id).toBe('t2');
    expect(fallback[1]?.id).toBe('t1');
  });
});

describe('Timeline Engine Adaptation and Edge Cases', () => {
  it('compresses timeline on short notice so all tasks fit between today and event date', () => {
    const today = '2026-06-01' as IsoDate;
    const shortEventDate = addDays(today, 30);
    const shortBrief: EventBrief = { ...BASE_BRIEF, eventDate: shortEventDate };

    const tasks = buildTasks(shortBrief, undefined, today);
    expect(tasks.length).toBeGreaterThan(0);
    for (const task of tasks) {
      expect(task.dueDate >= today).toBe(true);
      expect(task.dueDate <= shortEventDate).toBe(true);
    }
  });

  it('skips optional tasks when adaptation requests it', () => {
    const all = buildTasks(BASE_BRIEF, undefined, '2026-01-01' as IsoDate);
    const compressed = buildTasks(
      BASE_BRIEF,
      {
        contingencyDelta: 0,
        weightFactors: {},
        injectTaskIds: [],
        vendorCheckIds: [],
        alerts: [],
        skipOptionalTasks: true,
        compressTimeline: true,
      },
      '2026-01-01' as IsoDate,
    );
    expect(compressed.length).toBeLessThan(all.length);
  });

  it('handles past due dates by clamping to reference date', () => {
    const today = '2026-10-01' as IsoDate;
    const brief: EventBrief = { ...BASE_BRIEF, eventDate: '2026-11-01' as IsoDate };
    const tasks = buildTasks(brief, undefined, today);
    for (const task of tasks) {
      expect(task.dueDate >= today).toBe(true);
      expect(task.completed).toBe(false);
    }
  });
});

describe('Task Toggle and Reschedule', () => {
  it('toggles task completion status', () => {
    const tasks = buildTasks(BASE_BRIEF, undefined, '2026-01-01' as IsoDate);
    const firstTask = tasks[0];
    if (firstTask !== undefined) {
      const toggled = toggleTask(tasks, firstTask.id);
      expect(toggled[0]?.completed).toBe(true);
      const untoggled = toggleTask(toggled, firstTask.id);
      expect(untoggled[0]?.completed).toBe(false);
    }
  });

  it('prevents rescheduling after dependent tasks or with invalid date', () => {
    const tasks: readonly Task[] = [
      {
        id: 'parent',
        title: 'Parent',
        dueDate: '2026-05-01' as IsoDate,
        completed: false,
        category: 'v',
        dependencies: [],
      },
      {
        id: 'child',
        title: 'Child',
        dueDate: '2026-05-10' as IsoDate,
        completed: false,
        category: 'v',
        dependencies: ['parent'],
      },
    ];
    expect(rescheduleTask(tasks, 'parent', 'invalid-date' as IsoDate).ok).toBe(false);
    expect(rescheduleTask(tasks, 'parent', '2026-05-15' as IsoDate).ok).toBe(false);
    expect(rescheduleTask(tasks, 'child', '2026-04-20' as IsoDate).ok).toBe(false);

    const valid = rescheduleTask(tasks, 'parent', '2026-05-05' as IsoDate);
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.value.find((t) => t.id === 'parent')?.dueDate).toBe('2026-05-05');
    }
  });
});
