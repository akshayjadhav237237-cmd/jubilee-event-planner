import type { AdaptationEffects } from '../adaptationTypes';

function formatWeights(weightFactors: Partial<Record<string, number>>): string | null {
  const entries = Object.entries(weightFactors).filter(([, v]) => v !== undefined && v !== 1);
  if (entries.length === 0) {
    return null;
  }
  const formatted = entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k} x${String(v)}`)
    .join(', ');
  return `weights: ${formatted}`;
}

function formatContingency(delta: number): string | null {
  if (delta === 0) {
    return null;
  }
  const prefix = delta > 0 ? '+' : '';
  return `contingency ${prefix}${String(delta)}%`;
}

function formatArrays(label: string, items: readonly string[]): string | null {
  if (items.length === 0) {
    return null;
  }
  return `${label}: ${items.join(', ')}`;
}

function formatAlerts(effects: AdaptationEffects): string | null {
  if (effects.alerts.length === 0) {
    return null;
  }
  const alertStr = effects.alerts.map((a) => `${a.severity}:${a.code}`).join(', ');
  return `alerts: ${alertStr}`;
}

/** Generates a deterministic reason string derived entirely from adaptation effects. */
export function generateAdaptationReason(ruleName: string, effects: AdaptationEffects): string {
  const parts: string[] = [];

  const contStr = formatContingency(effects.contingencyDelta);
  if (contStr !== null) parts.push(contStr);

  const wtStr = formatWeights(effects.weightFactors);
  if (wtStr !== null) parts.push(wtStr);

  const taskStr = formatArrays('injected tasks', effects.injectTaskIds);
  if (taskStr !== null) parts.push(taskStr);

  const checkStr = formatArrays('vendor checks', effects.vendorCheckIds);
  if (checkStr !== null) parts.push(checkStr);

  const alertStr = formatAlerts(effects);
  if (alertStr !== null) parts.push(alertStr);

  if (effects.compressTimeline) parts.push('compress timeline');
  if (effects.skipOptionalTasks) parts.push('skip optional tasks');

  if (parts.length === 0) {
    return `[${ruleName}] no effect adjustments`;
  }
  return `[${ruleName}] ${parts.join('; ')}`;
}
