export type StorageNotice = {
  readonly code: string;
  readonly message: string;
};

let activeNotice: StorageNotice | null = null;

/** Sets the active storage notice. */
export function setStorageNotice(notice: StorageNotice): void {
  activeNotice = notice;
}

/** Returns the active storage notice or null if none. */
export function getStorageNotice(): StorageNotice | null {
  return activeNotice;
}

/** Clears the active storage notice. */
export function clearStorageNotice(): void {
  activeNotice = null;
}
