import type { ConditionalVendorCheck } from './types';

export const BUILTIN_VENDOR_CHECKS: readonly ConditionalVendorCheck[] = [
  {
    id: 'outdoor_weather',
    categoryId: 'venue',
    questions: [
      'What covered backup space or tenting plan exists for rain or high winds?',
      'Are heating or cooling amenities available for outdoor comfort?',
    ],
    redFlags: [
      'No rain contingency or outdoor shelter guarantee in contract',
      'Vendor lacks outdoor electrical safety equipment',
    ],
  },
  {
    id: 'allergen_handling',
    categoryId: 'catering',
    questions: [
      'How does the kitchen isolate common allergens including nuts, dairy, and gluten?',
      'Can you provide individually labeled meal boxes for severe dietary restrictions?',
    ],
    redFlags: [
      'Refusal to guarantee allergen separation or cross-contamination protocols',
      'No dedicated preparation area for special dietary orders',
    ],
  },
  {
    id: 'sound_ordinance',
    categoryId: 'entertainment',
    questions: [
      'Are you familiar with the local municipal noise curfew and decibel limits?',
      'Do you provide directional speakers to minimize neighborhood sound spillage?',
    ],
    redFlags: ['No volume limiter or decibel monitoring for outdoor residential zones'],
  },
  {
    id: 'liquor_license',
    categoryId: 'catering',
    questions: [
      'Do you hold an active liquor license and dram shop liability coverage?',
      'Are all serving staff certified under responsible beverage service regulations?',
    ],
    redFlags: ['Uninsured bartenders or transfer of alcohol liability onto the host'],
  },
  {
    id: 'kids_safety',
    categoryId: 'activities',
    questions: [
      'Are all activity materials non-toxic and compliant with child safety standards?',
      'Have all entertainers and supervisory staff undergone background verification?',
    ],
    redFlags: ['Activities with small-part choking hazards or unvetted adult facilitators'],
  },
  {
    id: 'kids_entertainment',
    categoryId: 'entertainment',
    questions: [
      'Do you offer structured interactive games tailored for young children?',
      'What backup activity exists if outdoor lawn games are rained out?',
    ],
    redFlags: ['Unsupervised performers or entertainment unsuitable for mixed age groups'],
  },
  {
    id: 'accessibility_compliance',
    categoryId: 'venue',
    questions: [
      'Are all guest zones, stages, and restrooms wheelchair accessible without steps?',
      'Are reserved seating spaces and step-free transit corridors clearly marked?',
    ],
    redFlags: ['Main entrance or primary restrooms only accessible by stairs without ramp or lift'],
  },
  {
    id: 'generator_power',
    categoryId: 'equipment',
    questions: [
      'What is the continuous wattage capacity of the backup generator system?',
      'Are power distribution panels weatherproofed and cable-ramped across walkways?',
    ],
    redFlags: ['Unprotected high-voltage cables crossing pedestrian routes or ungrounded gear'],
  },
  {
    id: 'permit_security',
    categoryId: 'permits_security',
    questions: [
      'Has the municipal special event permit been formally approved by the city?',
      'What is the mandatory licensed security guard-to-attendee ratio for the event?',
    ],
    redFlags: ['Operating without written municipal or park district permits'],
  },
  {
    id: 'waste_sorting',
    categoryId: 'waste_sanitation',
    questions: [
      'Do you provide clearly labeled three-stream sorting stations across the venue?',
      'How frequently are trash and compost receptacles cleared during peak hours?',
    ],
    redFlags: ['No recycling diversion plan or absence of overflow trash receptacles'],
  },
  {
    id: 'cake_temperature',
    categoryId: 'cake',
    questions: [
      'Can you transport the cake in a refrigerated vehicle within 2 hours of serving?',
      'Does the venue have climate-controlled storage prior to cutting and service?',
    ],
    redFlags: ['Unrefrigerated delivery transit for delicate buttercream or dairy fillings'],
  },
];

const checkRegistry = new Map<string, ConditionalVendorCheck>();

for (const check of BUILTIN_VENDOR_CHECKS) {
  checkRegistry.set(check.id, check);
}

/** Looks up a conditional vendor check by its unique identifier. */
export function findConditionalCheck(id: string): ConditionalVendorCheck | undefined {
  return checkRegistry.get(id);
}

/** Registers a custom conditional vendor check in the runtime registry. */
export function registerConditionalCheck(check: ConditionalVendorCheck): void {
  checkRegistry.set(check.id, check);
}
