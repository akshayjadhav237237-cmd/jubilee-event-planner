import type { AdaptationEffects } from '../adaptationTypes';
import type { IsoDate } from '../dates';
import type { EventBrief } from '../types';

export type AdaptationPredicate = (brief: EventBrief, today: IsoDate) => boolean;

export type AdaptationEffectBuilder = (brief: EventBrief, today: IsoDate) => AdaptationEffects;

export type AdaptationRule = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly predicate: AdaptationPredicate;
  readonly getEffects: AdaptationEffectBuilder;
};

/** Creates an empty baseline adaptation effects object with zeroed values. */
export function createEmptyEffects(): AdaptationEffects {
  return {
    contingencyDelta: 0,
    weightFactors: {},
    injectTaskIds: [],
    vendorCheckIds: [],
    alerts: [],
    skipOptionalTasks: false,
    compressTimeline: false,
  };
}
