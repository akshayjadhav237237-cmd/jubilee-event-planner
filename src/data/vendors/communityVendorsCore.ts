import type { VendorGuide } from '../../domain/vendors/types';

export const COMMUNITY_VENDORS_CORE: readonly VendorGuide[] = [
  {
    categoryId: 'venue',
    categoryName: 'Venue & Grounds',
    eventType: 'community',
    questions: [
      'What is the maximum permitted public park or facility crowd capacity?',
      'What municipal permits, park district approvals, or street closures are required?',
      'Are public restrooms, water stations, and electrical hookups accessible on site?',
      'What are the rules regarding stakes, ground penetration, and grass protection?',
      'How is emergency vehicle ingress and egress maintained throughout the event?',
    ],
    redFlags: [
      'Unclear jurisdiction boundaries between city, county, and park authorities',
      'Venue lacks adequate utilities for expected mass crowd attendance',
      'Rigid cancellation rules that penalize rainouts for public charity events',
    ],
    contractChecks: [
      'Permitted site boundaries, access dates, and load-in cutoffs documented',
      'Grounds restoration bond and cleanup inspection criteria established',
    ],
  },
  {
    categoryId: 'equipment',
    categoryName: 'Equipment & Staging',
    eventType: 'community',
    questions: [
      'Does your staging quote include safety railings, access ramps, and stairs?',
      'What is the total electrical wattage demand, and do you supply quiet generators?',
      'Are canopies, tents, and popups anchored with concrete ballasts rather than stakes?',
      'Do you provide cable ramps to protect ADA walkways from heavy power cords?',
      'Is an on-site AV technician present throughout the entire program schedule?',
    ],
    redFlags: [
      'Unweighted tents or insufficient ballasts vulnerable to wind gusts',
      'Unprotected power cables crossing pedestrian or wheelchair paths',
      'Equipment rental lacks structural engineering safety certifications',
    ],
    contractChecks: [
      'Itemized equipment schedule with delivery, assembly, and strike deadlines',
      'Wind rating and safety ballast certifications attached to contract',
    ],
  },
  {
    categoryId: 'permits_security',
    categoryName: 'Permits & Security',
    eventType: 'community',
    questions: [
      'Are your security personnel state-licensed, insured, and de-escalation trained?',
      'What is the recommended guard-to-attendee ratio for our crowd profile?',
      'Have you coordinated traffic management with local police and fire departments?',
      'Will an on-site security supervisor carry emergency radios during operations?',
      'Can you assist with the filing of city assembly and sound permits?',
    ],
    redFlags: [
      'Security guards lack valid state guard cards or liability coverage',
      'Absence of an incident log or emergency evacuation plan',
      'Failure to coordinate with local emergency first-responder agencies',
    ],
    contractChecks: [
      'Certified guard headcount, post assignments, and shift hours outlined',
      'Insurance endorsement naming the organizing entity as additional insured',
    ],
  },
  {
    categoryId: 'marketing',
    categoryName: 'Marketing & Signage',
    eventType: 'community',
    questions: [
      'What large-format print signage, banners, and wayfinding boards can you produce?',
      'Are exterior materials weatherproof, UV-resistant, and wind-slotted for safety?',
      'What is the production lead time from artwork approval to physical delivery?',
      'Can you provide digital assets formatted for social media and community flyers?',
      'Do you handle delivery and on-site mounting hardware installation?',
    ],
    redFlags: [
      'Indoor paper stocks used for outdoor festival banners prone to rain damage',
      'Turnaround delays that jeopardize advance community outreach campaigns',
      'Blurry print resolutions caused by lack of pre-flight artwork checks',
    ],
    contractChecks: [
      'Artwork approval proofs and material durability specs signed off',
      'Delivery deadline at least 14 days before festival launch guaranteed',
    ],
  },
  {
    categoryId: 'catering',
    categoryName: 'Food & Refreshments',
    eventType: 'community',
    questions: [
      'Do your food trucks or concession vendors hold active county health permits?',
      'What is the hourly throughput capacity per food station to prevent lines?',
      'Can you accommodate high-volume community dietary preferences and allergies?',
      'How are grey water, grease disposal, and organic food waste managed on-site?',
      'Do vendors carry self-contained power or require facility electrical hookups?',
    ],
    redFlags: [
      'Food vendors operating without current temporary health department permits',
      'Unregulated open-flame cooking without approved fire extinguishers on hand',
      'Improper greywater or cooking grease disposal on municipal storm drains',
    ],
    contractChecks: [
      'Health department permit compliance and food safety certificates verified',
      'Waste disposal and station teardown responsibilities documented',
    ],
  },
];
