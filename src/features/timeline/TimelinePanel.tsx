import type { JSX } from 'react';
import type { IsoDate } from '../../domain/dates';
import { usePlan, useDispatch } from '../../state/hooks';
import { ProgressBar, Alert, EmptyState } from '../../shared/ui';
import { checkScheduleCompression, groupTasksByPhase } from './view';
import { TaskCard } from './TaskCard';

export interface TimelinePanelProps {
  readonly today?: IsoDate;
}

/** Interactive countdown timeline organizing tasks chronologically with dependency awareness. */
export function TimelinePanel({
  today = '2026-10-30' as IsoDate,
}: TimelinePanelProps): JSX.Element {
  const plan = usePlan();
  const { dispatch } = useDispatch();

  if (!plan) {
    return (
      <EmptyState title="No Active Plan" description="Create or load a plan to view timeline." />
    );
  }

  const phaseGroups = groupTasksByPhase(plan.timeline);
  const compression = checkScheduleCompression(plan.brief, today);
  const totalTasks = plan.timeline.length;
  const completedTasks = plan.timeline.filter((t) => t.completed).length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <section aria-labelledby="timeline-title" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="timeline-title" className="text-2xl font-serif font-bold text-ink-text">
            Celebration Countdown & Timeline
          </h2>
          <p className="text-sm text-stone-600">
            {completedTasks} of {totalTasks} tasks completed ({pct}%)
          </p>
        </div>
      </div>

      <ProgressBar value={pct} label="Overall timeline completion progress" />

      {compression.isCompressed && compression.reason && (
        <Alert severity="warn" title="Schedule Compression Active" message={compression.reason} />
      )}

      <div className="space-y-8">
        {phaseGroups.map((group) => (
          <div key={group.phase} className="space-y-3">
            <h3 className="text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
              {group.phase} ({group.tasks.filter((t) => t.completed).length}/{group.tasks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  allTasks={plan.timeline}
                  onToggle={(taskId) => dispatch({ type: 'TOGGLE_TASK', taskId })}
                  onReschedule={(taskId, dueDate) =>
                    dispatch({ type: 'RESCHEDULE_TASK', taskId, dueDate })
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
