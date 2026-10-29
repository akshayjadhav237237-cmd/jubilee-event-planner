import type { VendorGuide } from '../../domain/vendors/types';
import { BIRTHDAY_VENDORS_CORE } from './birthdayVendorsCore';
import { BIRTHDAY_VENDORS_SUPPORT } from './birthdayVendorsSupport';

/** All birthday vendor guides categorized by core and supporting services. */
export const BIRTHDAY_VENDOR_GUIDES: readonly VendorGuide[] = [
  ...BIRTHDAY_VENDORS_CORE,
  ...BIRTHDAY_VENDORS_SUPPORT,
];
