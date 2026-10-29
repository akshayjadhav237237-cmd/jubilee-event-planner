export interface LruCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  clear(): void;
  size(): number;
}

/** Creates an in-memory least-recently-used cache bounded by a maximum item capacity. */
export function createLruCache<T>(capacity = 20): LruCache<T> {
  const maxCapacity = Math.max(1, capacity);
  const store = new Map<string, T>();

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (entry === undefined) {
        return undefined;
      }
      store.delete(key);
      store.set(key, entry);
      return entry;
    },
    set(key: string, value: T): void {
      if (store.has(key)) {
        store.delete(key);
      } else if (store.size >= maxCapacity) {
        const oldestEntry = store.keys().next();
        if (!oldestEntry.done && oldestEntry.value !== undefined) {
          store.delete(oldestEntry.value);
        }
      }
      store.set(key, value);
    },
    clear(): void {
      store.clear();
    },
    size(): number {
      return store.size;
    },
  };
}
