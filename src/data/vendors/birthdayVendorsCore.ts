import type { VendorGuide } from '../../domain/vendors/types';

export const BIRTHDAY_VENDORS_CORE: readonly VendorGuide[] = [
  {
    categoryId: 'venue',
    categoryName: 'Venue',
    eventType: 'birthday',
    questions: [
      'What is the total rental duration including setup and clean-up time blocks?',
      'Are tables, chairs, and basic sound systems included in the rental cost?',
      'Can we bring outside food, birthday cakes, or specialized catering?',
      'What are the venue rules regarding hanging decorations, tape, or confetti?',
      'Is parking available on-site for all attending guests and family members?',
    ],
    redFlags: [
      'Excessive cleaning fees assessed without prior itemized inspection',
      'Strict outside food restrictions that ban bringing in custom birthday cakes',
      'High noise penalties without clear decibel meters or written curfews',
    ],
    contractChecks: [
      'Exact rental period start and finish times including buffer windows',
      'Security deposit refund criteria and inspection checklist outlined',
    ],
  },
  {
    categoryId: 'catering',
    categoryName: 'Catering & Food',
    eventType: 'birthday',
    questions: [
      'Do you offer casual buffet, food station, or family-style service formats?',
      'Can you provide kid-friendly menu selections alongside adult gourmet options?',
      'Are serving utensils, chafing dishes, and biodegradable plates provided?',
      'How is warm food kept at safe temperatures throughout the party window?',
      'What is the deadline to submit final guest counts and dietary requirements?',
    ],
    redFlags: [
      'No hot-holding or cold-holding equipment for extended party buffets',
      'High minimum order thresholds designed only for large corporate banquets',
      'Refusal to list ingredient allergens for children with severe sensitivities',
    ],
    contractChecks: [
      'Delivery, setup, and cleanup time commitments confirmed in writing',
      'Headcount lock-in date and cancellation refund schedule specified',
    ],
  },
  {
    categoryId: 'cake',
    categoryName: 'Cake & Desserts',
    eventType: 'birthday',
    questions: [
      'Can you replicate custom design themes, fondant sculptures, or piping styles?',
      'What cake flavors, fillings, and frosting combinations are available?',
      'Do you offer allergy-safe options such as gluten-free, dairy-free, or eggless?',
      'Does the price include refrigerated on-site delivery and pedestal setup?',
      'What is the lead time needed for design adjustments or theme changes?',
    ],
    redFlags: [
      'Baker requires client pickup for multi-tier fragile cakes with no transit insurance',
      'Unlicensed home kitchen with no food handling or hygiene certification',
      'Vague color-matching policy resulting in mismatched party theme colors',
    ],
    contractChecks: [
      'Detailed flavor, tier dimensions, and aesthetic sketch approval signed',
      'Guaranteed refrigerated delivery arrival window prior to party start',
    ],
  },
  {
    categoryId: 'entertainment',
    categoryName: 'Entertainment & Activities',
    eventType: 'birthday',
    questions: [
      'What age bracket is the performance or activity specifically designed for?',
      'What supplies, audio gear, or props does the performer bring along?',
      'Have performers completed comprehensive background safety verifications?',
      'How does the entertainer manage quiet or shy children to ensure inclusion?',
      'What is the backup policy if the scheduled performer falls ill on party day?',
    ],
    redFlags: [
      'Entertainer has no verified references or background screening records',
      'Refusal to adapt the performance routine to the host party theme',
      'Demanding cash-only payment on arrival without receipt or agreement',
    ],
    contractChecks: [
      'Specific performer arrival time, routine duration, and program outline listed',
      'Replacement performer guarantee or full refund clause for vendor absence',
    ],
  },
];
