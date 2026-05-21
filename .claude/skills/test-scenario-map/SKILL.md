---
name: test-scenario-map
description: >
  Generate testing scenario map from MVP requirements + codebase, classified into e2e/integration.
  Outputs comment-only test files per module. Trigger: plan tests, map scenarios, test strategy.
---

## Rules

1. **Zero test code.** Comment-only scenario descriptions in `.test.tsx` / `.spec.tsx` files.
2. **Two layers only**: `e2e` and `integration`. No unit tests — pure logic coverage belongs in integration tests.
3. **Two sources**: requirements (user provides or you find) AND codebase (modules, pages, API routes, domain logic).
4. **Flag gaps**: requirement with no testable scenario → call it out.
5. **Module-scoped**: each test file lives inside its module. If a scenario doesn't belong to the module, don't add it.
6. **Planning only.** Describe scenarios in terms of user behavior and expected outcomes. Do NOT reference tools, libraries, test utilities, or implementation patterns — that belongs to the implementation skill.

## Classification

| Layer           | What it tests                        | Boundary              | Directory    |
| --------------- | ------------------------------------ | --------------------- | ------------ |
| **e2e**         | Full user journeys through real app  | Browser → Server → DB | `__e2e__/`   |
| **integration** | Feature behavior with mocked backend | Component → API mock  | `__tests__/` |

### e2e (`__e2e__/*.test.tsx`)

- Complete user journeys: login, navigate, interact, verify real outcomes
- **Fewer, fatter files** — one file per distinct journey entry point (e.g., CSV import vs Excel import)
- Multiple related scenarios chain inside one file when they share the same starting point
- Split only when the **entry point differs** (different page, different flow)

### integration (`__tests__/*.spec.tsx`)

- Feature behavior from the user's perspective with the backend mocked
- Verify what the user **sees and does** — not internal state
- **More, thinner files** — one file per domain concern (validation, suggestions, duplicates, etc.)
- Split when the **concern differs** (form validation vs category suggestion vs history display)

## Scenario Comment Format

Each scenario is a comment block describing WHAT happens, not HOW to implement it:

```
// SCENARIO: {what the user experiences}
// GIVEN: {initial state — what data exists, what page the user is on}
// WHEN: {user action — clicks, types, submits, navigates}
// THEN: {expected outcome — what appears, disappears, changes}
```

For setup shared across scenarios in a file:

```
// CONTEXT: {module name} — {what aspect this file covers}
// PRECONDITIONS:
// - {data that must exist}
// - {user state — logged in, on specific page, etc.}
```

## Flow

1. **Requirements** — Ask user or search README/specs/openspec/PRDs. Nothing found → ask, never invent.
2. **Codebase** — Read modules, understand each module's:
   - What the user can do (actions, forms, navigation)
   - What data it displays and where it comes from
   - What can go wrong (validation, empty states, errors)
   - Edge cases (boundaries, concurrent actions, permissions)
3. **File Planning** — Per module, decide:
   - `__e2e__/`: one file per distinct user journey entry point
   - `__tests__/`: one file per domain concern (split by what changes independently)
4. **Scenario Writing** — Create comment-only files with:
   - Context block (what this file covers, preconditions)
   - SCENARIO entries with GIVEN / WHEN / THEN
5. **Gaps** — `GAP: {requirement} → {why untestable or unclear}`
6. **Summary Table**

## Output

Comment-only test files created inside each module's `__e2e__/` and `__tests__/` directories, plus a summary in the conversation:

```
## File Structure

{module}/
  __e2e__/
    {journey}.test.tsx       — {what this journey covers}
  __tests__/
    {concern}.spec.tsx       — {what this concern covers}

## Summary

| Layer       | Files | Scenarios | Coverage Areas |
|-------------|-------|-----------|----------------|
| e2e         | N     | N         | ...            |
| integration | N     | N         | ...            |
| gaps        | —     | N         | ...            |
```

Feeds into `black-box-tester` or `interpreter-e2e` for implementation.
