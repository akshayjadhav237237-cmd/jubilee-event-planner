import type { VendorGuide } from '../../domain/vendors/types';

export const COMMUNITY_VENDORS_SUPPORT: readonly VendorGuide[] = [
  {
    categoryId: 'waste_sanitation',
    categoryName: 'Waste & Sanitation',
    eventType: 'community',
    questions: [
      'How many portable restrooms and ADA-accessible units are recommended?',
      'Does your service include periodic restocking and pumping during peak hours?',
      'Do you supply three-stream sorting stations for landfill, recycling, and compost?',
      'What handwashing stations and sanitizer dispensers are deployed across the site?',
      'Is full post-event litter sweep of the park grounds included in the contract?',
    ],
    redFlags: [
      'Insufficient restroom-to-crowd ratio leading to health code violations',
      'No mid-event servicing schedule for heavily attended community festivals',
      'Failure to provide wheelchair-accessible portable restrooms',
    ],
    contractChecks: [
      'Restroom and waste bin delivery, servicing intervals, and pickup times fixed',
      'Post-event grounds litter-free sign-off protocol with venue authority',
    ],
  },
  {
    categoryId: 'activities',
    categoryName: 'Activities & Games',
    eventType: 'community',
    questions: [
      'Are all bounce houses, carnival games, and obstacle courses safety-inspected?',
      'Do inflatables comply with mandatory anchoring ballasts and wind speed cutoffs?',
      'Are trained ride attendants supplied to supervise each attraction continuously?',
      'What are the age, height, and physical capacity restrictions per attraction?',
      'What general liability insurance coverage is held for participant injuries?',
    ],
    redFlags: [
      'Inflatables left unmonitored without designated adult attendants',
      'Operating bouncy houses in high wind conditions exceeding 15 mph',
      'Vendor cannot provide state ride inspection tags or active liability policy',
    ],
    contractChecks: [
      'Attendant staffing commitments and mandatory weather shutdown protocol defined',
      'Commercial liability policy with minimum statutory event coverage limits',
    ],
  },
  {
    categoryId: 'insurance',
    categoryName: 'Insurance & Permits',
    eventType: 'community',
    questions: [
      'Does the policy provide comprehensive commercial general liability coverage?',
      'Can the city, venue owner, and sponsoring non-profit be named additional insured?',
      'Does coverage include spectator slip-and-fall, property damage, and weather delay?',
      'Is host liquor liability included if alcohol concessions or beer gardens operate?',
      'How quickly can updated certificates of insurance (COI) be generated?',
    ],
    redFlags: [
      'Policy excludes outdoor events or restricts participant liability claims',
      'Gaps in participant sports coverage or spectator crowd incident clauses',
      'Delayed COI generation that blocks municipal permit approvals',
    ],
    contractChecks: [
      'Certificate of insurance with required liability limits and endorsements attached',
      'Effective policy dates spanning entire setup, event duration, and teardown',
    ],
  },
  {
    categoryId: 'volunteer_supplies',
    categoryName: 'Volunteer Supplies',
    eventType: 'community',
    questions: [
      'Can you supply branded high-visibility vests, t-shirts, and lanyards for crew?',
      'Do you provide crowd control supplies like megaphones, clipboards, and radios?',
      'What is the turnaround lead time for bulk printing volunteer apparel?',
      'Are hydration stations, water jugs, and sun protection kits available for workers?',
      'What is the bulk discount schedule for non-profit community organizations?',
    ],
    redFlags: [
      'Inadequate crew visibility gear making volunteer marshals unidentifiable',
      'High minimum order quantities that strain community organization budgets',
      'Late arrival of volunteer badges preventing organized morning briefings',
    ],
    contractChecks: [
      'Delivery arrival date at least one week prior to event orientation',
      'Itemized inventory, size distribution, and pricing terms confirmed',
    ],
  },
];
