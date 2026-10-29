import type { VendorGuide } from '../../domain/vendors/types';

export const WEDDING_VENDORS_SUPPORT: readonly VendorGuide[] = [
  {
    categoryId: 'entertainment',
    categoryName: 'Entertainment & Music',
    eventType: 'wedding',
    questions: [
      'Will the specific DJ or band leader we meet with perform at our reception?',
      'Do you provide professional wireless microphones for toasts and ceremony audio?',
      'How do you handle guest song requests, do-not-play lists, and pacing transitions?',
      'Do you bring redundant sound equipment, power conditioners, and spare mixers?',
      'What are the electrical power, staging, and footprint requirements for your setup?',
    ],
    redFlags: [
      'Company reserves the right to send an unverified replacement entertainer',
      'Lack of backup sound gear or refusal to provide wireless ceremony mics',
      'No public liability insurance coverage for sound equipment or performers',
    ],
    contractChecks: [
      'Named DJ or band leader performance guarantee with backup artist protocol',
      'Sound system arrival time and soundcheck completion deadline documented',
    ],
  },
  {
    categoryId: 'invitations',
    categoryName: 'Invitations & Stationery',
    eventType: 'wedding',
    questions: [
      'Does your service include digital proofing, calligraphy addressing, and assembly?',
      'What is the turnaround timeline for design iterations, printing, and shipping?',
      'Do you supply matching day-of stationery like place cards, menus, and signage?',
      'What paper stock weight, printing method, and finish options are provided?',
      'What is the unit cost and turnaround time for ordering an additional print run?',
    ],
    redFlags: [
      'No proof approval sign-off step before initiating the final press run',
      'Hidden setup charges for custom fonts, foil stamping, or address formatting',
      'Extremely long production turnaround that jeopardizes the 8-week mailing window',
    ],
    contractChecks: [
      'Client sign-off requirement on digital proofs prior to printing commitment',
      'Quantity, paper stock grade, and delivery milestone dates explicitly listed',
    ],
  },
  {
    categoryId: 'hair_makeup',
    categoryName: 'Hair & Makeup',
    eventType: 'wedding',
    questions: [
      'Does your quote include a mandatory pre-wedding trial session for the couple?',
      'How many artists will be on-site to handle the wedding party within the morning window?',
      'How much time is allocated per person for hair styling and makeup application?',
      'Do you supply touch-up kits, false lashes, and professional airbrush formulas?',
      'What are the travel, parking, or early morning start fees for your beauty team?',
    ],
    redFlags: [
      'Refusal to conduct a trial session prior to signing the wedding day contract',
      'Unrealistic scheduling allowing under 30 minutes per attendant without extra staff',
      'Beauty team lacks sanitization protocols or uses unhygienic shared applicators',
    ],
    contractChecks: [
      'Trial session terms, date, and satisfaction review protocol documented',
      'Morning timeline schedule with designated artist headcount and finish time',
    ],
  },
  {
    categoryId: 'coordinator',
    categoryName: 'Wedding Coordinator',
    eventType: 'wedding',
    questions: [
      'Does your scope begin month-of or day-of, and when do vendor handoffs start?',
      'Will you create the master timeline, vendor contact sheet, and floor plan layouts?',
      'How many assistant coordinators will accompany you on-site for the event?',
      'Will you run the ceremony rehearsal the day prior to the wedding?',
      'How do you handle emergency vendor delays or sudden schedule deviations?',
    ],
    redFlags: [
      'Single coordinator attempting to handle 150+ guests without an assistant',
      'Limited availability for pre-event consultations or venue walkthroughs',
      'Unclear boundaries regarding physical decor setup versus vendor management',
    ],
    contractChecks: [
      'Total on-site coordination hours and overtime rate per hour clearly stated',
      'Rehearsal attendance and master timeline distribution responsibilities defined',
    ],
  },
  {
    categoryId: 'transport',
    categoryName: 'Transportation',
    eventType: 'wedding',
    questions: [
      'What is the age, model, and climate-control reliability of the vehicle fleet?',
      'Are all vehicle drivers commercially licensed, insured, and background checked?',
      'Does the route plan account for multiple guest shuttle loops and staging areas?',
      'What is the contingency plan if a chartered bus or limousine breaks down?',
      'Are driver gratuities, fuel surcharges, and tolls included in the flat rate?',
    ],
    redFlags: [
      'Unclear fleet age or substitution policy allowing substandard vans',
      'Fuel surcharges and driver tips added as surprise post-event billing line items',
      'No roadside assistance agreement or rapid vehicle replacement guarantee',
    ],
    contractChecks: [
      'Specific vehicle models, capacities, and pickup and drop-off schedule documented',
      'All-inclusive pricing clause confirming no hidden fuel or toll surcharges',
    ],
  },
];
