import type { VendorQuote } from '../types';
import type { VendorState } from './types';

/** Appends a new vendor quote to the vendor state. */
export function addQuote(state: VendorState, quote: VendorQuote): VendorState {
  return {
    ...state,
    quotes: [...state.quotes, quote],
  };
}

/** Removes a vendor quote matching the specified id from the vendor state. */
export function removeQuote(state: VendorState, id: string): VendorState {
  return {
    ...state,
    quotes: state.quotes.filter((q) => q.id !== id),
  };
}

/** Toggles the completion status of a vendor checklist item. */
export function toggleChecklistItem(state: VendorState, id: string): VendorState {
  return {
    ...state,
    checklist: state.checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    ),
  };
}
