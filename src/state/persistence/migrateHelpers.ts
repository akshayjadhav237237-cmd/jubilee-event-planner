import type {
  CategoryAllocation,
  ChecklistItem,
  EventFlags,
  IdeaCategory,
  IdeaItem,
  QuoteStatus,
  Task,
  TopPriorities,
  VendorQuote,
} from '../../domain/types';
import type { IsoDate } from '../../domain/dates';

/** Checks if a value is a non-null object and not an array. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses string with a default fallback. */
export function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

/** Parses non-negative integer with a default fallback. */
export function asInt(value: unknown, fallback: number): number {
  return typeof value === 'number' && value >= 0 ? Math.floor(value) : fallback;
}

/** Extracts event flags from raw object with false defaults. */
export function asFlags(raw: unknown): EventFlags {
  const obj = isRecord(raw) ? raw : {};
  return {
    kids: Boolean(obj.kids),
    elders: Boolean(obj.elders),
    dietary: Boolean(obj.dietary),
    accessibility: Boolean(obj.accessibility),
    openBar: Boolean(obj.openBar),
    amplifiedMusic: Boolean(obj.amplifiedMusic),
    surprise: Boolean(obj.surprise),
  };
}

/** Extracts top 3 priorities tuple with defaults. */
export function asPriorities(raw: unknown): TopPriorities {
  const defaults: TopPriorities = ['Venue', 'Catering', 'Decor'];
  if (!Array.isArray(raw) || raw.length < 3) {
    return defaults;
  }
  const p0 = asString(raw[0], defaults[0]);
  const p1 = asString(raw[1], defaults[1]);
  const p2 = asString(raw[2], defaults[2]);
  return [p0, p1, p2];
}

/** Migrates a raw category into CategoryAllocation. */
export function toCategory(cat: unknown, idx: number): CategoryAllocation {
  const c = isRecord(cat) ? cat : {};
  const weightVal = typeof c.weight === 'number' && c.weight >= 0 ? c.weight : 1;
  return {
    id: asString(c.id, `cat-${String(idx + 1)}`),
    name: asString(c.name, `Category ${String(idx + 1)}`),
    allocated: asInt(c.allocated, 0),
    spent: asInt(c.spent, 0),
    weight: weightVal,
  };
}

/** Migrates a raw task into Task. */
export function toTask(item: unknown, idx: number): Task {
  const t = isRecord(item) ? item : {};
  const deps = Array.isArray(t.dependencies)
    ? t.dependencies.filter((d): d is string => typeof d === 'string')
    : [];
  return {
    id: asString(t.id, `task-${String(idx + 1)}`),
    title: asString(t.title, `Task ${String(idx + 1)}`),
    dueDate: asString(t.dueDate, '2027-01-01') as IsoDate,
    completed: Boolean(t.completed),
    category: asString(t.category, 'general'),
    dependencies: deps,
  };
}

/** Migrates a raw vendor quote into VendorQuote. */
export function toQuote(item: unknown, idx: number): VendorQuote {
  const q = isRecord(item) ? item : {};
  const status: QuoteStatus =
    q.status === 'shortlisted' || q.status === 'accepted' || q.status === 'declined'
      ? q.status
      : 'draft';
  return {
    id: asString(q.id, `quote-${String(idx + 1)}`),
    vendorName: asString(q.vendorName, 'Vendor'),
    category: asString(q.category, 'general'),
    amount: asInt(q.amount, 0),
    status,
    notes: typeof q.notes === 'string' ? q.notes : '',
  };
}

/** Migrates a raw idea item into IdeaItem. */
export function toIdea(item: unknown, idx: number): IdeaItem {
  const i = isRecord(item) ? item : {};
  const category: IdeaCategory =
    i.category === 'menu' || i.category === 'activity' ? i.category : 'theme';
  return {
    id: asString(i.id, `idea-${String(idx + 1)}`),
    title: asString(i.title, `Idea ${String(idx + 1)}`),
    category,
    description: typeof i.description === 'string' ? i.description : '',
    votes: asInt(i.votes, 0),
  };
}

/** Migrates a raw checklist item into ChecklistItem. */
export function toChecklistItem(item: unknown, idx: number): ChecklistItem {
  const c = isRecord(item) ? item : {};
  const redFlags = Array.isArray(c.redFlags)
    ? c.redFlags.filter((f): f is string => typeof f === 'string')
    : [];
  const questions = Array.isArray(c.questions)
    ? c.questions.filter((q): q is string => typeof q === 'string')
    : [];
  return {
    id: asString(c.id, `item-${String(idx + 1)}`),
    title: asString(c.title, `Checklist Item ${String(idx + 1)}`),
    completed: Boolean(c.completed),
    category: asString(c.category, 'general'),
    redFlags,
    questions,
  };
}
