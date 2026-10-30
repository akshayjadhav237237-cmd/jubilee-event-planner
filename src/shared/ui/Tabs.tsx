import { type JSX, useRef } from 'react';
import { cx } from '../lib/cx';

export interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
  readonly badge?: string;
}

export interface TabsProps {
  readonly tabs: readonly TabItem[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly ariaLabel?: string;
  readonly className?: string;
}

function computeTargetIndex(key: string, currentIndex: number, total: number): number | null {
  if (key === 'ArrowRight') return (currentIndex + 1) % total;
  if (key === 'ArrowLeft') return (currentIndex - 1 + total) % total;
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return null;
}

/** Renders an accessible tabs navigation list with roving tabindex keyboard control. */
export function Tabs({
  tabs,
  selectedId,
  onSelect,
  ariaLabel = 'Navigation tabs',
  className,
}: TabsProps): JSX.Element {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ): void => {
    const targetIndex = computeTargetIndex(event.key, currentIndex, tabs.length);
    if (targetIndex === null) return;

    event.preventDefault();
    const targetTab = tabs[targetIndex];
    if (targetTab) {
      onSelect(targetTab.id);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx('flex border-b border-stone-border space-x-2 overflow-x-auto', className)}
    >
      {tabs.map((tab, index) => {
        const isSelected = tab.id === selectedId;
        const tabClass = cx(
          'inline-flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-teal-primary focus:ring-offset-2',
          isSelected
            ? 'border-teal-primary text-teal-primary font-semibold'
            : 'border-transparent text-stone-muted hover:text-ink-text hover:border-stone-300',
        );

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={tabClass}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                {tab.count}
              </span>
            )}
            {tab.badge !== undefined && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-primary">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
