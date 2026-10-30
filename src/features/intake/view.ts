import { getCategoriesForEventType } from '../../data/categories';
import { isPast, type IsoDate } from '../../domain/dates';
import { parseMoney } from '../../domain/money';
import { EventBriefSchema } from '../../domain/schemas';
import { evaluateAdaptations } from '../../domain/adaptations';
import { ok, err, type Result } from '../../domain/result';
import type { EventBrief, EventFlags, EventSetting, EventType } from '../../domain/types';

export interface IntakeFormState {
  readonly title: string;
  readonly eventType: EventType;
  readonly subFormat: string;
  readonly guestCount: number;
  readonly budgetMajor: string;
  readonly currency: string;
  readonly eventDate: string;
  readonly setting: EventSetting;
  readonly flags: EventFlags;
  readonly top3Priorities: readonly string[];
}

export const SUB_FORMAT_OPTIONS: Record<EventType, readonly string[]> = {
  wedding: ['traditional', 'destination', 'intimate', 'reception_only'],
  birthday: ['kids_party', 'milestone', 'casual_dinner', 'surprise'],
  community: ['cultural_festival', 'fundraiser', 'block_party', 'sports_meet'],
};

/** Returns available sub-format options adapted to the selected event type. */
export function getSubFormatOptions(eventType: EventType): readonly string[] {
  return SUB_FORMAT_OPTIONS[eventType] ?? [];
}

/** Returns selectable priority names based on standard categories for the event type. */
export function getAvailablePriorities(eventType: EventType): readonly string[] {
  return getCategoriesForEventType(eventType).map((c) => c.name);
}

/** Converts an EventBrief domain entity into mutable intake form state. */
export function toFormState(brief: EventBrief): IntakeFormState {
  const major = (brief.totalBudget / 100).toString();
  return {
    title: brief.title,
    eventType: brief.eventType,
    subFormat: brief.subFormat,
    guestCount: brief.guestCount,
    budgetMajor: major,
    currency: brief.currency,
    eventDate: brief.eventDate,
    setting: brief.setting,
    flags: { ...brief.flags },
    top3Priorities: [...brief.top3Priorities],
  };
}

/** Validates intake form state and converts major budget into integer minor units. */
export function fromFormState(form: IntakeFormState): Result<EventBrief, readonly string[]> {
  const moneyRes = parseMoney(form.budgetMajor, form.currency);
  if (!moneyRes.ok) {
    return err([`Invalid budget: ${moneyRes.error}`]);
  }

  if (form.top3Priorities.length !== 3) {
    return err(['Exactly three priorities must be selected']);
  }

  const p0 = form.top3Priorities[0];
  const p1 = form.top3Priorities[1];
  const p2 = form.top3Priorities[2];
  if (!p0 || !p1 || !p2) {
    return err(['Priorities cannot be empty strings']);
  }

  const candidate = {
    title: form.title,
    eventType: form.eventType,
    subFormat: form.subFormat,
    guestCount: form.guestCount,
    totalBudget: moneyRes.value,
    currency: form.currency,
    eventDate: form.eventDate,
    setting: form.setting,
    flags: form.flags,
    top3Priorities: [p0, p1, p2] as const,
  };

  const parseRes = EventBriefSchema.safeParse(candidate);
  if (!parseRes.success) {
    const messages = parseRes.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    return err(messages);
  }

  return ok(parseRes.data as EventBrief);
}

/** Evaluates domain adaptations and extracts past-date alert reasons. */
export function getPastDateReasons(eventDate: string, today: IsoDate): readonly string[] {
  if (!isPast(eventDate as IsoDate, today)) {
    return [];
  }
  const dummyBrief: EventBrief = {
    title: 'Check',
    eventType: 'wedding',
    subFormat: 'traditional',
    guestCount: 10,
    totalBudget: 10000,
    currency: 'USD',
    eventDate: eventDate as IsoDate,
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
  const adaptations = evaluateAdaptations(dummyBrief, today);
  return adaptations
    .filter((a) => a.ruleName === 'rule_past_date' || a.id === 'rule_past_date')
    .map((a) => a.reason);
}
