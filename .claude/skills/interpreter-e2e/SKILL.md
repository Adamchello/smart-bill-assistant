---
name: interpreter-e2e
description: >
  Use when creating or extending e2e tests that use a step interpreter pattern
  with shared command registries across multiple scenarios.
---

# Interpreter E2E

## Overview

The interpreter pattern separates WHAT a test does (step names) from HOW it does it (command implementations). A shared `commands` object maps readable step names to engine-specific actions, and an interpreter function executes steps in sequence. Eliminates copy-paste flows across scenarios and makes tests read like behavior specs.

## Goal

Turn behavior spec into step map + interpreter execution.

## Preflight (Mandatory)

Before any test:

1. Resolve test engine:
   - Infer from user prompt/repo context if clear
   - If not clear, ask user before writing tests
2. Ask user for interpreter path (or propose found candidate).
3. Resolve verification command:
   - Infer from prompt/context if clear (`test`, `e2e`, `nx`, `pnpm`, etc.)
   - If not clear, ask user which command to run
4. Confirm contract with user: interpreter import path, command signature (`(page) => ...`), and invocation shape (`interpreter(commands)(...steps)`).
5. If engine, verification command, or contract unclear: stop, ask, no test writing.

## When NOT to Use

- Single-action smoke tests (`goto` + one assertion) — inline is fine.
- Tests with no reusable steps across scenarios.
- Only one test in the spec and no plan to add more.

## File Location

E2E specs live inside each module:

```
src/modules/{module-name}/__e2e__/main-flow.spec.ts
```

Confirm engine config picks up `**/__e2e__/**/*.spec.ts`, or adjust glob to match.

## Test Shape

1. Import interpreter entry + test API from resolved engine.
2. Static mocks/fixtures as `as const` at top.
3. `commands` object: key = readable step text, value = `(page) => ...` or `async (page) => ...`
4. Each `test(...)` runs steps through interpreter in single variadic call.
5. Inline actions only for tiny one-off checks.

## Command Rules

- One command = one visible user/system behavior. No internals.
- Await engine actions; no sleeps/timeouts.
- Reuse command keys across tests; new keys only for new behavior.
- Test titles describe behavior, not implementation.
- Mock API as first step, before navigation.
- Page passed per step as argument, not closed over.

### Assertion Scope

E2e tests own REACHABILITY, not rendering details. Assert on structural landmarks: section headings, state indicators, warning banners, empty state messages. NEVER assert on formatted values, specific amounts, trend labels, or conditional content details — those belong in integration tests (`__tests__/*.test.tsx`). If a command name starts with "see exact..." or checks a specific formatted string, it probably belongs in integration, not here.

### Selectors by Engine

- **Playwright**: `getByRole`, `getByText`, `getByPlaceholder`. No CSS selectors.
- **Cypress**: `cy.contains`, `cy.findByRole`. No `cy.get('.class')`.
- **Other**: prefer accessible/semantic selectors over structural ones.

## Build Flow

1. Read spec/requirements.
2. Convert requirements into scenarios.
3. Split into reusable commands.
4. Add missing commands.
5. Compose scenario by ordered step tuples.
6. Assert visible outcomes.
7. Add edge cases (bounds, back nav, invalid state).

## Common Mistakes

| Mistake                                                   | Fix                                                         |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| Writing tests before confirming interpreter path/contract | Preflight mandatory — resolve engine and contract FIRST     |
| Closing over `page` in command functions                  | Pass `page` as argument: `(page) => ...`                    |
| Using CSS selectors (`#id`, `.class`)                     | Use accessible selectors (`getByRole`, `getByText`)         |
| Duplicating step sequences across tests                   | Extract to shared commands; compose via interpreter         |
| Adding `sleep`/`waitForTimeout`                           | Await engine actions directly; sleeps mask real issues      |
| Mocking API after navigation                              | Mock API as first step, before any `goto`                   |
| Skipping interpreter for "just one quick test"            | If spec has 2+ scenarios with shared steps, use interpreter |

## Done Criteria

- Tests deterministic on repeat runs.
- Engine explicitly resolved (inferred or user-confirmed).
- Interpreter path + contract documented before execution.
- Shared setup via interpreter, no copy-paste flow blocks.
- Assertions cover user-visible text/state.
- File stays compact: commands block + script-like `test(...)` calls.

## Reference

- **Interpreter**: shared `interpreter.ts` (e.g. `src/__e2e__/interpreter.ts`) — confirm path during preflight
- **Example spec**: first spec created becomes reference for the pattern
