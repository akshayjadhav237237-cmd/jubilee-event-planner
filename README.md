# Jubilee

Jubilee is a GenAI-powered Celebration and Event Planner. This repository contains the foundational architecture, domain contracts, strict quality tooling, and accessible app shell.

## Quick Start

```bash
npm ci
npm run dev
npm run check
```

## 1. Chosen Vertical and Persona

Jubilee is designed for celebrations and milestone events, specifically serving everyday hosts organizing weddings, birthdays, and community gatherings.

## 2. Approach and Logic

The system models event planning as deterministic state transitions driven by typed commands and integer arithmetic.

## 3. How the Solution Works

The architecture pairs offline rule-based heuristics with optional generative AI assistance behind a common domain port.

## 4. Assumptions Made

Budgets operate strictly in integer minor units to eliminate floating-point rounding errors across international currencies.

## 5. Evaluation Focus

Evaluation prioritizes contract correctness, accessibility benchmarks, strict type boundaries, and test coverage over unverified features.

## Live Demo

https://akshayjadhav237237-cmd.github.io/jubilee-event-planner/

## License

MIT
