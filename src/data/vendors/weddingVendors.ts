import type { VendorGuide } from '../../domain/vendors/types';
import { WEDDING_VENDORS_CORE } from './weddingVendorsCore';
import { WEDDING_VENDORS_SUPPORT } from './weddingVendorsSupport';

/** All wedding vendor guides categorized by core and supporting services. */
export const WEDDING_VENDOR_GUIDES: readonly VendorGuide[] = [
  ...WEDDING_VENDORS_CORE,
  ...WEDDING_VENDORS_SUPPORT,
];
