import type { EventBrief } from '../domain/types';
import type { IsoDate } from '../domain/dates';

export type DemoScenario = {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly brief: EventBrief;
};

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  {
    id: 'demo-wedding',
    name: "Ananya & Rohan's Wedding",
    tagline: 'Traditional 250-guest celebration with banquet catering and mandap decor',
    brief: {
      title: "Ananya & Rohan's Wedding",
      eventType: 'wedding',
      subFormat: 'traditional',
      guestCount: 250,
      totalBudget: 250000000,
      currency: 'INR',
      eventDate: '2027-11-20' as IsoDate,
      setting: 'hybrid',
      flags: {
        kids: true,
        elders: true,
        dietary: true,
        accessibility: true,
        openBar: true,
        amplifiedMusic: true,
        surprise: false,
      },
      top3Priorities: ['Catering & Beverages', 'Venue & Facilities', 'Photography & Videography'],
    },
  },
  {
    id: 'demo-birthday',
    name: "Aarav's 10th Birthday",
    tagline: 'Action-packed 35-guest kids birthday party with cake, magic show, and games',
    brief: {
      title: "Aarav's 10th Birthday",
      eventType: 'birthday',
      subFormat: 'kids_party',
      guestCount: 35,
      totalBudget: 7500000,
      currency: 'INR',
      eventDate: '2027-03-15' as IsoDate,
      setting: 'indoor',
      flags: {
        kids: true,
        elders: false,
        dietary: true,
        accessibility: false,
        openBar: false,
        amplifiedMusic: true,
        surprise: true,
      },
      top3Priorities: ['Entertainment & Music', 'Cake & Desserts', 'Decor & Floral'],
    },
  },
  {
    id: 'demo-community',
    name: 'Indiranagar Cultural Festival',
    tagline: '500-attendee monsoon community gathering with stage, stalls, and eco waste plan',
    brief: {
      title: 'Indiranagar Cultural Festival',
      eventType: 'community',
      subFormat: 'cultural_festival',
      guestCount: 500,
      totalBudget: 50000000,
      currency: 'INR',
      eventDate: '2027-08-10' as IsoDate,
      setting: 'outdoor',
      flags: {
        kids: true,
        elders: true,
        dietary: true,
        accessibility: true,
        openBar: false,
        amplifiedMusic: true,
        surprise: false,
      },
      top3Priorities: ['AV & Equipment', 'Permits & Security', 'Waste Management & Sanitation'],
    },
  },
];
