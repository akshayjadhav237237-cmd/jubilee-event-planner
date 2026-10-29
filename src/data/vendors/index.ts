import type { EventType } from '../../domain/types';
import type { VendorGuide } from '../../domain/vendors/types';
import { BIRTHDAY_VENDOR_GUIDES } from './birthdayVendors';
import { COMMUNITY_VENDOR_GUIDES } from './communityVendors';
import { WEDDING_VENDOR_GUIDES } from './weddingVendors';

export { BIRTHDAY_VENDOR_GUIDES } from './birthdayVendors';
export { COMMUNITY_VENDOR_GUIDES } from './communityVendors';
export { WEDDING_VENDOR_GUIDES } from './weddingVendors';

/** Complete list of all 27 vendor guides across wedding, birthday, and community events. */
export const ALL_VENDOR_GUIDES: readonly VendorGuide[] = [
  ...WEDDING_VENDOR_GUIDES,
  ...BIRTHDAY_VENDOR_GUIDES,
  ...COMMUNITY_VENDOR_GUIDES,
];

/** Resolves vendor guides corresponding to a given event type. */
export function getVendorGuidesForEventType(eventType: EventType): readonly VendorGuide[] {
  switch (eventType) {
    case 'wedding':
      return WEDDING_VENDOR_GUIDES;
    case 'birthday':
      return BIRTHDAY_VENDOR_GUIDES;
    case 'community':
      return COMMUNITY_VENDOR_GUIDES;
  }
}

/** Looks up a single vendor guide by event type and category identifier. */
export function getVendorGuide(eventType: EventType, categoryId: string): VendorGuide | undefined {
  const guides = getVendorGuidesForEventType(eventType);
  return guides.find((g) => g.categoryId === categoryId);
}
