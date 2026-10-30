import type { JSX } from 'react';
import type { EventFlags } from '../../domain/types';
import { ChipCheckbox } from '../../shared/ui/ChipCheckbox';

export interface IntakeFlagsAndPrioritiesProps {
  readonly flags: EventFlags;
  readonly onChangeFlags: (flags: EventFlags) => void;
  readonly availablePriorities: readonly string[];
  readonly top3Priorities: readonly string[];
  readonly onChangePriorities: (priorities: readonly string[]) => void;
}

const FLAG_LABELS: readonly { readonly key: keyof EventFlags; readonly label: string }[] = [
  { key: 'kids', label: 'Kids Attending' },
  { key: 'elders', label: 'Elders Attending' },
  { key: 'dietary', label: 'Dietary Constraints' },
  { key: 'accessibility', label: 'Accessibility Needs' },
  { key: 'openBar', label: 'Open Bar' },
  { key: 'amplifiedMusic', label: 'Amplified Music' },
  { key: 'surprise', label: 'Surprise Party' },
];

/** Renders guest constraints and 3-priority selection chips. */
export function IntakeFlagsAndPriorities({
  flags,
  onChangeFlags,
  availablePriorities,
  top3Priorities,
  onChangePriorities,
}: IntakeFlagsAndPrioritiesProps): JSX.Element {
  const toggleFlag = (key: keyof EventFlags): void => {
    onChangeFlags({ ...flags, [key]: !flags[key] });
  };

  const togglePriority = (p: string): void => {
    if (top3Priorities.includes(p)) {
      onChangePriorities(top3Priorities.filter((item) => item !== p));
    } else if (top3Priorities.length < 3) {
      onChangePriorities([...top3Priorities, p]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="block text-sm font-medium text-stone-700 mb-2">
          Celebration Considerations
        </span>
        <div className="flex flex-wrap gap-2">
          {FLAG_LABELS.map(({ key, label }) => (
            <ChipCheckbox
              key={key}
              id={`flag-${key}`}
              label={label}
              checked={flags[key]}
              onChange={() => toggleFlag(key)}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-stone-700 mb-1">
          Top 3 Priorities (Pick exactly 3, selected: {top3Priorities.length}/3)
        </span>
        <p className="text-xs text-stone-500 mb-2">
          Priorities receive weighted budget protection during automated reallocations.
        </p>
        <div className="flex flex-wrap gap-2">
          {availablePriorities.map((priority) => {
            const isChecked = top3Priorities.includes(priority);
            const isDisabled = !isChecked && top3Priorities.length >= 3;
            return (
              <ChipCheckbox
                key={priority}
                id={`priority-${priority.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                label={priority}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => togglePriority(priority)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
