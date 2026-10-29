import type { VendorGuide } from '../../domain/vendors/types';
import { COMMUNITY_VENDORS_CORE } from './communityVendorsCore';
import { COMMUNITY_VENDORS_SUPPORT } from './communityVendorsSupport';

/** All community vendor guides categorized by core and supporting services. */
export const COMMUNITY_VENDOR_GUIDES: readonly VendorGuide[] = [
  ...COMMUNITY_VENDORS_CORE,
  ...COMMUNITY_VENDORS_SUPPORT,
];
