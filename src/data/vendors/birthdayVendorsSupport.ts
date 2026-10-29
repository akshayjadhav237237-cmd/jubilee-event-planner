import type { VendorGuide } from '../../domain/vendors/types';

export const BIRTHDAY_VENDORS_SUPPORT: readonly VendorGuide[] = [
  {
    categoryId: 'decor',
    categoryName: 'Decor & Balloons',
    eventType: 'birthday',
    questions: [
      'Do you specialize in organic balloon garlands, photo backdrops, or themed props?',
      'Do you use professional high-grade, biodegradable latex balloons?',
      'What indoor or outdoor rigging equipment is used to prevent wall damage?',
      'Is post-event teardown and balloon disposal included in your service fee?',
      'What contingency exists for outdoor installations subject to sun or wind?',
    ],
    redFlags: [
      'Low-grade thin balloons that pop quickly in direct sunlight or heat',
      'Using adhesives that strip drywall paint or damage venue rental finishes',
      'Leaving cleanup and disposal entirely to the client without notice',
    ],
    contractChecks: [
      'Itemized inventory of balloon arches, props, and signage dimensions',
      'Teardown time and damage-free removal guarantee stated in writing',
    ],
  },
  {
    categoryId: 'favors',
    categoryName: 'Favors & Goodie Bags',
    eventType: 'birthday',
    questions: [
      'Are goodie bag items age-appropriate, durable, and non-hazardous?',
      'Can you customize party favor bags with individual guest names or themes?',
      'What is the turnaround time for packaging, branding, and shipping?',
      'Are edible favor treats certified peanut-free and clearly ingredient-labeled?',
      'What is the minimum quantity order and unit price for last-minute add-ons?',
    ],
    redFlags: [
      'Cheap plastic trinkets that pose choking hazards for younger party guests',
      'Unlabeled food items without allergen disclosures or expiration dates',
      'Late delivery risk with no trackable freight or shipping guarantee',
    ],
    contractChecks: [
      'Confirmed delivery arrival date at least 5 business days before event',
      'Exact quantity, unit price, and replacement terms for defective favors',
    ],
  },
  {
    categoryId: 'photography',
    categoryName: 'Photography',
    eventType: 'birthday',
    questions: [
      'Do you capture candid action moments alongside formal family portraits?',
      'How many edited high-resolution images are included in the birthday package?',
      'What is your experience in photographing energetic children and fast movement?',
      'What is the delivery turnaround timeline for the digital download gallery?',
      'Are digital print rights and social sharing permissions fully included?',
    ],
    redFlags: [
      'Photographer lacks experience working with children or family milestones',
      'Excessive turnaround time exceeding 4 weeks for a casual birthday session',
      'High hidden fees for downloading unwatermarked high-resolution images',
    ],
    contractChecks: [
      'Coverage hours, arrival time, and minimum guaranteed photo count listed',
      'Digital release terms and online gallery download access period specified',
    ],
  },
  {
    categoryId: 'invitations',
    categoryName: 'Invitations',
    eventType: 'birthday',
    questions: [
      'Do you offer digital invitations with RSVP tracking alongside printed cards?',
      'How fast can custom themed invitation proofs be turned around for review?',
      'Can you print matching thank-you cards and favor tags in the same theme?',
      'What paper finishes, envelopes, and envelope liners are included?',
      'Is envelope address printing included or billed as an optional add-on?',
    ],
    redFlags: [
      'No proof review or revision rounds included in base design pricing',
      'Slow communication resulting in missed RSVP deadline milestones',
      'Poor print resolution or low-quality paper stocks not matching proofs',
    ],
    contractChecks: [
      'Revision rounds and final proof approval sign-off requirement defined',
      'Quantity, paper stock specifications, and ship-by deadline detailed',
    ],
  },
];
