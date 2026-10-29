# 3. Integer Money and Exact Budget Allocation

Date: 2026-10-29

## Status

Accepted

## Context

Event budgets involve multi-category allocations, taxes, vendor fees, and deposits across various currencies (e.g., INR paise, USD cents). Floating-point arithmetic in JavaScript produces rounding anomalies (such as 0.1 + 0.2 !== 0.3) that erode user trust and cause reconciliation discrepancies.

## Decision

We represent all monetary amounts exclusively as integer minor units:

- Amounts are stored and manipulated as integers (e.g., 10000 minor units equals 100.00 major units).
- Floating-point representations for money are prohibited across domain, state, and UI layers.
- Currency metadata identifies the ISO currency code and minor unit decimal exponent.
- Percentage and ratio distributions among budget categories utilize the largest-remainder method (Hare-Niemeyer method) to ensure the sum of allocated parts equals the exact total.
- Formatting to human-readable strings occurs exclusively at presentation boundaries using Intl.NumberFormat.
- Sub-minor calculations round half-up at the single-cent or single-paise integer boundary.

## Consequences

- Positive: Zero floating-point drift or precision loss across budget calculations.
- Positive: Exact ledger reconciliation across budget items, splits, and deposits.
- Positive: Seamless multi-currency support without custom rounding workarounds.
- Negative: Inputs must be converted between major and minor units at UI boundaries.
- Negative: Division operations require explicit integer quotient and remainder handling.
