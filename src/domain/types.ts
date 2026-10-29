import type { IsoDate } from './dates';

export type EventType = 'wedding' | 'birthday' | 'community';

export type WeddingSubFormat = 'traditional' | 'destination' | 'intimate' | 'reception_only';

export type BirthdaySubFormat = 'kids_party' | 'milestone' | 'casual_dinner' | 'surprise';

export type CommunitySubFormat = 'cultural_festival' | 'fundraiser' | 'block_party' | 'sports_meet';

export type SubFormat = WeddingSubFormat | BirthdaySubFormat | CommunitySubFormat | string;

export type EventSetting = 'indoor' | 'outdoor' | 'hybrid';

export type EventFlags = {
  readonly kids: boolean;
  readonly elders: boolean;
  readonly dietary: boolean;
  readonly accessibility: boolean;
  readonly openBar: boolean;
  readonly amplifiedMusic: boolean;
  readonly surprise: boolean;
};

export type EventPriority = string;

export type TopPriorities = readonly [string, string, string];

export type EventBrief = {
  readonly title: string;
  readonly eventType: EventType;
  readonly subFormat: string;
  readonly guestCount: number;
  readonly totalBudget: number;
  readonly currency: string;
  readonly eventDate: IsoDate;
  readonly setting: EventSetting;
  readonly flags: EventFlags;
  readonly top3Priorities: TopPriorities;
};

export type CategoryAllocation = {
  readonly id: string;
  readonly name: string;
  readonly allocated: number;
  readonly spent: number;
  readonly weight: number;
};

export type BudgetState = {
  readonly categories: readonly CategoryAllocation[];
  readonly contingencyRate: number;
  readonly totalBudget: number;
};

export type Task = {
  readonly id: string;
  readonly title: string;
  readonly dueDate: IsoDate;
  readonly completed: boolean;
  readonly category: string;
  readonly dependencies: readonly string[];
};

export type QuoteStatus = 'draft' | 'shortlisted' | 'accepted' | 'declined';

export type VendorQuote = {
  readonly id: string;
  readonly vendorName: string;
  readonly category: string;
  readonly amount: number;
  readonly status: QuoteStatus;
  readonly notes: string;
};

export type ChecklistItem = {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly category: string;
  readonly redFlags: readonly string[];
  readonly questions: readonly string[];
};

export type IdeaCategory = 'theme' | 'menu' | 'activity';

export type IdeaItem = {
  readonly id: string;
  readonly title: string;
  readonly category: IdeaCategory;
  readonly description: string;
  readonly votes: number;
};

export type PlanId = string;

export type Plan = {
  readonly id: PlanId;
  readonly brief: EventBrief;
  readonly budget: BudgetState;
  readonly timeline: readonly Task[];
  readonly vendorChecklist: readonly ChecklistItem[];
  readonly quotes: readonly VendorQuote[];
  readonly ideas: readonly IdeaItem[];
  readonly createdAt: IsoDate;
  readonly updatedAt: IsoDate;
};
