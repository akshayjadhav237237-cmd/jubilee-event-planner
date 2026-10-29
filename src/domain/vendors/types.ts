import type { ChecklistItem, EventType, VendorQuote } from '../types';

export type VendorGuide = {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly eventType: EventType;
  readonly questions: readonly string[];
  readonly redFlags: readonly string[];
  readonly contractChecks: readonly string[];
};

export type VendorState = {
  readonly guides: readonly VendorGuide[];
  readonly checklist: readonly ChecklistItem[];
  readonly quotes: readonly VendorQuote[];
};

export type CategoryQuoteSummary = {
  readonly categoryId: string;
  readonly allocated: number;
  readonly committed: number;
  readonly variance: number;
};

export type VendorSummary = {
  readonly committedTotal: number;
  readonly variance: number;
  readonly byCategory: Readonly<Record<string, CategoryQuoteSummary>>;
};

export type ConditionalVendorCheck = {
  readonly id: string;
  readonly categoryId: string;
  readonly questions: readonly string[];
  readonly redFlags: readonly string[];
};
