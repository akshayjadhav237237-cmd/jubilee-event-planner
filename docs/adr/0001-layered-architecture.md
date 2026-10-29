# 1. Layered Architecture

Date: 2026-10-29

## Status

Accepted

## Context

Event planning systems manage diverse requirements: domain logic (budget calculation, guest counts), state management (undo/redo stacks), persistence, UI components, and generative AI integrations. Unconstrained imports cause circular dependencies, tight coupling, and untestable user interface components.

## Decision

We enforce a strict unidirectional layered architecture:

1. `src/domain`: Pure TypeScript containing entities and business rules. Zero external dependencies.
2. `src/data`: Static catalogs and templates importing only domain types.
3. `src/ai`: Generative and heuristic adapters importing domain, data, config, and shared libraries.
4. `src/state`: State containers and stores importing domain, config, and shared libraries.
5. `src/features/<name>`: Vertical feature modules importing domain, data, state, ai, shared, and config. Cross-feature imports are prohibited.
6. `src/shared`: Generic UI primitives and pure helpers. Imports config only.
7. `src/app`: Composition root assembling layers into the executable application.

Layer boundaries are enforced mechanically via ESLint import restriction rules.

## Consequences

- Positive: High testability, independent module refactoring, clear mental model, and zero circular dependencies.
- Positive: Domain logic remains pure and runnable in any environment without browser or React dependencies.
- Negative: Additional boilerplate when plumbing data between layers.
- Negative: Feature modules cannot directly share code; shared logic must be promoted to `src/shared` or `src/domain`.
