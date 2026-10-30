import { useState, type ChangeEvent, type JSX } from 'react';
import type { Task } from '../../domain/types';
import type { IsoDate } from '../../domain/dates';
import { Badge } from '../../shared/ui';
import { getDependencyHints, validateRescheduleDate } from './view';

export interface TaskCardProps {
  readonly task: Task;
  readonly allTasks: readonly Task[];
  readonly onToggle: (taskId: string) => void;
  readonly onReschedule: (taskId: string, newDate: IsoDate) => void;
}

/** Renders an individual planning task with dependency checklist and date rescheduling. */
export function TaskCard({ task, allTasks, onToggle, onReschedule }: TaskCardProps): JSX.Element {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(task.dueDate);
  const dependencies = getDependencyHints(task, allTasks);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setDateValue(val as IsoDate);
    const valid = validateRescheduleDate(val);
    if (valid.ok) {
      onReschedule(task.id, valid.value);
      setIsEditingDate(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border bg-white shadow-sm transition-colors ${
        task.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            id={`task-check-${task.id}`}
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
          />
          <div>
            <label
              htmlFor={`task-check-${task.id}`}
              className={`text-sm font-medium cursor-pointer block ${
                task.completed ? 'line-through text-stone-400' : 'text-ink-text'
              }`}
            >
              {task.title}
            </label>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge text={task.category} variant="neutral" />
              {isEditingDate ? (
                <input
                  type="date"
                  value={dateValue}
                  onChange={handleDateChange}
                  onBlur={() => setIsEditingDate(false)}
                  aria-label="Reschedule task due date"
                  className="text-xs border rounded px-1 py-0.5"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingDate(true)}
                  className="text-xs text-stone-500 hover:text-gold-accent underline font-mono"
                  aria-label={`Due ${task.dueDate}, click to reschedule`}
                >
                  Due: {task.dueDate}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {dependencies.length > 0 && (
        <div className="mt-3 pt-2 border-t border-stone-100 pl-7 text-xs text-stone-500 space-y-1">
          <span className="font-semibold text-stone-600">Dependencies:</span>
          <ul className="list-disc pl-4 space-y-0.5">
            {dependencies.map((dep) => (
              <li
                key={dep.id}
                className={dep.completed ? 'text-emerald-700 font-medium' : 'text-stone-500'}
              >
                {dep.title} {dep.completed ? '✓' : '(pending)'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
