# 2. Command Pattern and Undo/Redo

Date: 2026-10-29

## Status

Accepted

## Context

Celebration hosts frequently experiment with budget allocations, guest counts, and schedule adjustments. Accidental deletions or unsatisfying modifications require immediate recovery. Direct state mutation impairs auditability and complicates multi-step undo/redo histories.

## Decision

We encapsulate all state modifications as typed, serializable Command objects:

- Every command implements execute and rollback transitions.
- A central Command Stack manages executed commands, supporting undo and redo operations.
- All state transitions are deterministic and pure.
- Commands carry complete payload information so rollback never depends on remote state or non-deterministic fetches.
- Transient UI state (such as dialog visibility or text input focus) is isolated from the command history.
- Failed commands are rejected without mutating either the active state or the history stack.

## Consequences

- Positive: Robust multi-step undo and redo capabilities across all domain operations.
- Positive: Full audit trail of user actions for analytics and session replay.
- Positive: Deterministic testing of complex user workflows by replaying command sequences.
- Negative: Every mutating action requires a dedicated Command definition with both forward and inverse operations.
- Negative: Memory consumption of command stacks must be bounded by a maximum history depth.
