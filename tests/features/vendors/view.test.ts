import { describe, expect, it } from 'vitest';
import type {
  BudgetState,
  ChecklistItem,
  EventBrief,
  VendorQuote,
} from '../../../src/domain/types';
import type { IsoDate } from '../../../src/domain/dates';
import { computeVendorSections, validateNewQuote } from '../../../src/features/vendors/view';

const SAMPLE_BRIEF: EventBrief = {
  title: 'Vendor Test',
  eventType: 'wedding',
  subFormat: 'traditional',
  guestCount: 150,
  totalBudget: 10000000,
  currency: 'INR',
  eventDate: '2027-10-10' as IsoDate,
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
  top3Priorities: ['Venue & Facilities', 'Catering & Beverages', 'Photography & Videography'],
};

const SAMPLE_BUDGET: BudgetState = {
  totalBudget: 10000000,
  contingencyRate: 10,
  categories: [
    { id: 'venue', name: 'Venue & Facilities', allocated: 4000000, spent: 0, weight: 40 },
    { id: 'catering', name: 'Catering & Beverages', allocated: 5000000, spent: 0, weight: 50 },
  ],
};

const SAMPLE_QUOTES: readonly VendorQuote[] = [
  {
    id: 'q-1',
    vendorName: 'Royal Palace Grounds',
    category: 'venue',
    amount: 3500000,
    status: 'accepted',
    notes: 'Includes lawn and banquet hall',
  },
  {
    id: 'q-2',
    vendorName: 'Gourmet Feast Catering',
    category: 'catering',
    amount: 5500000,
    status: 'shortlisted',
    notes: '150 plates with live chaat counter',
  },
];

const SAMPLE_CHECKLIST: readonly ChecklistItem[] = [
  {
    id: 'chk-1',
    title: 'Confirm booking deposit and refund schedule',
    completed: true,
    category: 'venue',
    redFlags: ['No written refund terms'],
    questions: ['What is the sound curfew?'],
  },
];

describe('Vendors view model', () => {
  it('computes category vendor sections with committed amounts and variance', () => {
    const sections = computeVendorSections(
      SAMPLE_BRIEF,
      SAMPLE_BUDGET,
      SAMPLE_QUOTES,
      SAMPLE_CHECKLIST,
    );
    expect(sections.length).toBe(2);

    const venue = sections.find((s) => s.categoryId === 'venue');
    expect(venue).toBeDefined();
    expect(venue?.guide).toBeDefined();
    expect(venue?.quotes.length).toBe(1);
    expect(venue?.checklist.length).toBe(1);
    expect(venue?.isOverAllocated).toBe(false);

    const catering = sections.find((s) => s.categoryId === 'catering');
    expect(catering?.isOverAllocated).toBe(true);
  });

  it('validates new quote input and enforces positive amounts', () => {
    const valid = validateNewQuote({
      vendorName: 'Star Caterers',
      category: 'catering',
      amountMajor: '45000',
      currency: 'INR',
      status: 'draft',
      notes: 'Standard buffet',
      id: 'test-id',
    });
    expect(valid.ok).toBe(true);

    const emptyName = validateNewQuote({
      vendorName: '',
      category: 'catering',
      amountMajor: '45000',
      currency: 'INR',
      status: 'draft',
      notes: '',
      id: 'test-id',
    });
    expect(emptyName.ok).toBe(false);

    const invalidAmount = validateNewQuote({
      vendorName: 'Name',
      category: 'catering',
      amountMajor: 'invalid',
      currency: 'INR',
      status: 'draft',
      notes: '',
      id: 'test-id',
    });
    expect(invalidAmount.ok).toBe(false);
  });
});
