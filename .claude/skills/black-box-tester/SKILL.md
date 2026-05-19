---
name: black-box-tester
description: >
  Build tests from user test plan using strict black-box behavior.
  Trigger when user asks to generate tests from requirements/spec and avoid implementation leaks.
  Report untestable requirements with reason, then map each requirement to test status table.
---

Write tests from user plan. Black-box only. Never bind to internals.

## Goal

Test externally visible behavior only.

## Hard Rules

1. Never inspect private fields, internal funcs, hidden state, call counts, or mock internals.
2. Assert inputs/outputs, UI-visible states, API contracts, side effects visible at boundary.
3. If requirement needs implementation leak to verify: do not fake. Mark cannot test.
4. If no safe black-box path exists: return clear limitation note.

## Preflight (Mandatory)

Before any test:

1. Resolve test framework:
   - Infer from repo context if clear (Vitest, Jest, Testing Library, etc.)
   - If not clear, ask user before writing tests
2. Resolve test boundary — what gets rendered and where mocks go:
   - **Module boundary** (default): render module's public entry point, mock at API layer
   - **Component boundary**: render single component, mock props/context
   - **Page boundary**: render full page, mock at network layer
   - If unclear, ask user before writing tests
3. If framework or boundary unclear: stop, ask, no test writing.

## Flow

1. Read user plan. Split into requirement list (`REQ1`, `REQ2`, ...).
2. Resolve test location:
   - User specifies → use that location.
   - User does not specify → ask before writing tests.
3. Resolve test command:
   - User specifies → use that command.
   - User does not specify → ask before verification.
   - After test changes, run agreed command and keep fixing/rerunning until pass.
4. For each requirement:
   - Decide black-box testability.
   - Testable → add test in resolved location.
   - Not testable → skip, capture why leak needed.
5. Return:
   - Added tests summary.
   - Limitations list (only untestable reqs).
   - Requirement mapping table.

## Output Table

| Requirement | Status                  | Note                                 |
| ----------- | ----------------------- | ------------------------------------ |
| REQ1        | TEST ADDED ✅           | Covers visible behavior              |
| REQ2        | TEST CANNOT BE ADDED ❌ | Requires implementation details leak |

## Style

- Prefer stable user-facing selectors/contracts.
- Tests deterministic and isolated.
- Name tests by behavior, not method names.
