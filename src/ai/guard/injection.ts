const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(?:all\s+)?(?:previous|prior|earlier|the\s+above)\s+instructions/i,
  /system\s+prompt/i,
  /disregard\s+(?:all\s+)?(?:previous|safety|the\s+system|system|prior)/i,
  /you\s+are\s+now/i,
  /pretend\s+(?:you\s+are|to\s+be)/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
  /reveal\s+(?:your\s+)?(?:instructions|system)/i,
  /output\s+your\s+(?:prompt|instructions)/i,
  /print\s+(?:the\s+)?(?:initial\s+)?(?:developer|system)?\s*(?:prompt|instructions)/i,
  /developer\s+instructions/i,
  /bypass\s+(?:rules|policies|security)/i,
  /new\s+instructions/i,
];

/** Evaluates whether user input matches known prompt injection or jailbreak patterns. */
export function isPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}
