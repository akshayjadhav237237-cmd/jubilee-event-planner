# 4. Bring Your Own Key AI with Local Fallback

Date: 2026-10-29

## Status

Accepted

## Context

AI-assisted event planning requires generative capabilities for task breakdown, budget recommendations, and theme generation. Relying solely on hosted backend keys incurs cost, privacy concerns, and operational failure when offline or unconfigured.

## Decision

We implement a hybrid AI architecture with Bring Your Own Key (BYOK) and offline fallback:

- Users may optionally provide their own API key (e.g., Google Gemini), stored locally in browser storage.
- An AI client interface abstracts the underlying provider.
- When an API key is absent, invalid, or offline, the system seamlessly falls back to deterministic rule-based heuristics.
- Local fallback heuristics use expert rules and curated data catalogs to generate realistic plans.
- All AI suggestions require explicit user confirmation before applying state mutations via domain commands.
- Network timeouts and service interruptions immediately trigger transparent heuristic degradation.

## Consequences

- Positive: Zero server operating costs for AI inference; users control their own credentials.
- Positive: Fully functional offline and demo experiences via deterministic local fallback engines.
- Positive: Clear separation of AI suggestion generation from domain state mutation.
- Negative: Fallback heuristics require maintaining structured rule catalogs alongside AI prompts.
- Negative: Client-side API key handling requires secure local storage and clear user guidance.
