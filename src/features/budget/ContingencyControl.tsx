import type { ChangeEvent, JSX } from 'react';

export interface ContingencyControlProps {
  readonly rate: number;
  readonly onChange: (rate: number) => void;
}

/** Controls contingency allocation rate with domain-enforced 15% maximum ceiling. */
export function ContingencyControl({ rate, onChange }: ContingencyControlProps): JSX.Element {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value);
    onChange(Math.min(15, Math.max(0, val)));
  };

  return (
    <div className="bg-sand-accent/30 p-4 rounded-xl border border-stone-200">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="contingency-slider" className="text-sm font-medium text-ink-text">
          Contingency Reserve: {rate}%
        </label>
        <span className="text-xs text-stone-500 font-mono">Max 15%</span>
      </div>
      <input
        id="contingency-slider"
        type="range"
        min={0}
        max={15}
        step={1}
        value={rate}
        onChange={handleChange}
        className="w-full accent-gold-accent cursor-pointer"
        aria-valuemin={0}
        aria-valuemax={15}
        aria-valuenow={rate}
      />
      <p className="text-xs text-stone-500 mt-2">
        Contingency protects against unexpected cost inflation and weather adaptations.
      </p>
    </div>
  );
}
