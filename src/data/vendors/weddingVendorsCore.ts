import type { VendorGuide } from '../../domain/vendors/types';

export const WEDDING_VENDORS_CORE: readonly VendorGuide[] = [
  {
    categoryId: 'venue',
    categoryName: 'Venue',
    eventType: 'wedding',
    questions: [
      'What is the maximum seated guest capacity with a dance floor installed?',
      'What are the strict access time windows for vendor load-in and post-event strike?',
      'Are outside vendors and independent catering permitted without penalty fees?',
      'What is the comprehensive rain and bad weather contingency plan for outdoor areas?',
      'Are there municipal noise ordinances, curfews, or decibel monitoring thresholds?',
    ],
    redFlags: [
      'No written policy on vendor load-in timing or overtime fee rates',
      'Mandatory exclusive vendor lists that include hidden surcharge fees',
      'Missing certificate of commercial general liability insurance',
    ],
    contractChecks: [
      'Overtime charges clearly specified in hourly minor unit rates',
      'Cancellation and force majeure refund milestones explicitly defined',
    ],
  },
  {
    categoryId: 'catering',
    categoryName: 'Catering',
    eventType: 'wedding',
    questions: [
      'Does the per-person quote include tableware, linens, glassware, and staffing labor?',
      'How do you accommodate severe dietary restrictions, allergies, and vegan diets?',
      'What is the guaranteed staffing ratio of servers and bartenders to guests?',
      'Is an advance menu tasting included in the package prior to signing?',
      'What is the protocol for managing leftover food and vendor meal provisions?',
    ],
    redFlags: [
      'Quoted price excludes service charges, gratuity, or kitchen prep fees',
      'Refusal to provide a guaranteed minimum staffing ratio in the agreement',
      'Inability to provide food safety licenses or proof of liability coverage',
    ],
    contractChecks: [
      'Final guest headcount deadline and billing recalculation formula detailed',
      'Itemized schedule of setup, service, and breakdown labor costs included',
    ],
  },
  {
    categoryId: 'photography',
    categoryName: 'Photography & Videography',
    eventType: 'wedding',
    questions: [
      'Will the primary photographer who shot your portfolio personally shoot our wedding?',
      'How many edited, high-resolution digital files are guaranteed in the final gallery?',
      'What is the contracted turnaround delivery timeline for preview and full galleries?',
      'Do you carry backup cameras, lenses, memory cards, and portable lighting gear?',
      'What are the full printing rights and digital reproduction permissions granted to us?',
    ],
    redFlags: [
      'Vague substitution clause allowing an unvetted junior associate to shoot alone',
      'No emergency backup hardware plan for damaged cards or camera failure',
      'Delivery window exceeding 16 weeks without progressive sneak peeks',
    ],
    contractChecks: [
      'Primary shooter named explicitly with guaranteed minimum coverage hours',
      'High-resolution digital release without restrictive watermarks confirmed',
    ],
  },
  {
    categoryId: 'attire',
    categoryName: 'Attire & Beauty',
    eventType: 'wedding',
    questions: [
      'What is the required lead time for design, ordering, production, and shipping?',
      'Are in-house alteration fittings included, or is tailoring billed separately?',
      'How many fitting appointments are typically scheduled before the final handover?',
      'What is the rush fee schedule if sizing adjustments or rush delivery are needed?',
      'Do you offer steaming, emergency repair kits, and post-event preservation services?',
    ],
    redFlags: [
      'No written delivery date commitment prior to the scheduled wedding date',
      'Non-transparent alteration fee structure with open-ended tailoring estimates',
      'Final sale policy without damage inspection or manufacturer defect recourse',
    ],
    contractChecks: [
      'Guaranteed dress or suit arrival date at least 30 days before the wedding',
      'Exact itemization of alterations cap or per-fitting consultation costs',
    ],
  },
  {
    categoryId: 'decor',
    categoryName: 'Decor & Floral',
    eventType: 'wedding',
    questions: [
      'Does your package include full delivery, on-site installation, and same-night strike?',
      'Can you provide realistic mockups or digital sample renders before production?',
      'What seasonal floral or fabric substitutes are used if primary materials fail?',
      'Who is responsible for disposal, vessel returns, or security deposits on hardware?',
      'Are candles with open flames allowed, and do you supply hurricane glass shields?',
    ],
    redFlags: [
      'Teardown and strike labor not included in the primary decor quote',
      'Broad substitute clause allowing inferior flowers without client consultation',
      'Unclear damage deposit return criteria for rented arches or containers',
    ],
    contractChecks: [
      'Complete floral recipe and hardware inventory itemized by ceremony and reception',
      'Clear breakdown schedule with venue exit deadline compliance confirmed',
    ],
  },
];
