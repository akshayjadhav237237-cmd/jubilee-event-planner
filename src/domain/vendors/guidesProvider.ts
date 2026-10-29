import type { EventType } from '../types';
import type { VendorGuide } from './types';

type GuidesProvider = (eventType: EventType) => readonly VendorGuide[];

let registeredProvider: GuidesProvider | null = null;

/** Registers a catalog provider for default vendor guides by event type. */
export function registerVendorGuidesProvider(provider: GuidesProvider): void {
  registeredProvider = provider;
}

/** Resolves vendor guides using an optional override, registered provider, or empty list. */
export function resolveVendorGuides(
  eventType: EventType,
  overrideGuides?: readonly VendorGuide[],
): readonly VendorGuide[] {
  if (overrideGuides !== undefined && overrideGuides.length > 0) {
    return overrideGuides;
  }
  if (registeredProvider !== null) {
    return registeredProvider(eventType);
  }
  return [];
}
