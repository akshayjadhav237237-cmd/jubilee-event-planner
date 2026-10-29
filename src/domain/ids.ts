/** Creates a sequential counter port starting from the given initial value. */
export function createCounterPort(initialValue = 1): () => number {
  let counter = initialValue;
  return function nextCount(): number {
    const current = counter;
    counter += 1;
    return current;
  };
}

/** Generates a deterministic identifier combining a prefix and a counter port value. */
export function generateDeterministicId(prefix: string, counterPort: () => number): string {
  const num = counterPort();
  return `${prefix}-${String(num)}`;
}
