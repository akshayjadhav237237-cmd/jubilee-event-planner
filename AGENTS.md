# Agent Instructions and Repository Standards

## Quality Contract

QUALITY CONTRACT:

1. Max 200 lines per file (ESLint max-lines, blank lines counted). Max 60 lines per function, 90 for .tsx components. Complexity max 10. Max 4 params.
2. Named exports only in src (ESLint no-restricted-syntax on ExportDefaultDeclaration). Config files exempt.
3. No any, no non-null assertions, no ts-ignore, no eslint-disable. TS options: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride, noFallthroughCasesInSwitch, verbatimModuleSyntax.
4. Layers and allowed imports (enforce with ESLint no-restricted-imports overrides):
   src/domain: pure TS. Imports only from src/domain and src/config. No react, no zustand, no DOM, no fetch.
   src/data: static catalogs. Imports only from src/domain types.
   src/ai: imports domain, data, config, shared/lib. No react.
   src/state: imports domain, config, shared/lib. No react components.
   src/features/<name>: imports domain, data, state, ai, shared, config. Never another feature.
   src/shared: imports config only. Never features, state, ai.
   src/app: composition root.
5. Errors cross boundaries as Result<T, E>, not exceptions. No console.* (ESLint no-console).
6. Money is integer minor units (paise or cents). Never floats. Rounding uses largest-remainder allocation.
7. Dates are ISO date strings (YYYY-MM-DD) handled with UTC-safe helpers. No Date arithmetic in components.
8. Every public function has a one-line JSDoc stating intent. No commented-out code, no TODO or FIXME.
9. Every user-facing claim in UI copy and README must be backed by code or a test.
10. Accessibility: landmarks, skip link, visible focus, native <dialog>, aria-live for async results, prefers-reduced-motion respected, contrast tokens tested.
11. Security: CSP via build-time meta tag as the FIRST child of <head>, referrer policy no-referrer, no dangerouslySetInnerHTML, no eval, no inline scripts.

## Repository Layout

- `docs/adr/`: Architecture Decision Records documenting key design decisions.
- `src/domain/`: Pure domain types, business rules, commands, and budget math.
- `src/data/`: Static catalog datasets and fallback templates.
- `src/ai/`: AI adapters with BYOK client support and deterministic local heuristics.
- `src/state/`: State stores, undo/redo history, and persistence mechanisms.
- `src/features/`: UI feature modules (isolated from each other).
- `src/shared/`: Shared UI primitives and pure utility libraries.
- `src/app/`: Application shell, routing, and composition root.
- `tests/`: Automated unit, integration, accessibility, and design token tests.

## Development Commands

- `npm run dev`: Start local development server with Vite.
- `npm run build`: Compile TypeScript and bundle production assets.
- `npm run preview`: Serve production build locally.
- `npm run typecheck`: Run TypeScript compiler without emitting output.
- `npm run lint`: Execute ESLint across all source files.
- `npm run format`: Check code formatting with Prettier.
- `npm run check`: Run typecheck, lint, test, and build in sequence.

## Definition of Done

A task or feature is complete only when:

1. All quality contract rules are satisfied without exception.
2. Unit and integration tests cover all new behaviors and edge cases.
3. Every file stays strictly under 200 lines.
4. All static analysis, typechecking, and tests pass via `npm run check`.
5. No feature claims exist in UI copy or documentation without matching automated tests.
