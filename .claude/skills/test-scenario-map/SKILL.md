---
name: test-scenario-map
description: >
  Generate testing scenario map from MVP requirements + codebase, classified into e2e/integration.
  Outputs comment-only test files per module. Trigger: plan tests, map scenarios, test strategy.
---

## Rules

1. **Zero test code.** Comment-only scenarios in `.spec.ts` / `.test.tsx` files.
2. **Two layers only**: `e2e` and `integration`. No unit tests.
3. **Two sources**: requirements + codebase.
4. **Flag gaps**: untestable requirement → call it out.
5. **Module-scoped**: test file lives inside its module.
6. **Planning only.** No tools, libraries, or implementation patterns — behavior and outcomes only.

## Classification

| Layer           | Question                         | Boundary              | Directory    |
| --------------- | -------------------------------- | --------------------- | ------------ |
| **e2e**         | Can the user REACH each state?   | Browser → Server → DB | `__e2e__/`   |
| **integration** | Does the component BEHAVE there? | Component → API mock  | `__tests__/` |

### Separation Principle

E2e and integration MUST NOT overlap. Same assertion in both = wasted execution, zero extra confidence.

- **E2e = journey**: navigation works, states reachable. THEN references structural landmarks only — NEVER specific values or formatting.
- **Integration = behavior**: exact rendered content, formatting, edge cases, conditional UI. THEN names specific values and visual details.

Decision test: "GETTING THERE or WHAT'S RENDERED?" Getting there → e2e. What's rendered → integration.

### e2e (`__e2e__/*.spec.ts`)

- Every meaningful state (happy, empty, error, degraded) reachable via navigation
- THEN = structural landmarks only
- Fewer, fatter files — one per journey entry point

### integration (`__tests__/*.test.tsx`)

- Every visual branch (loading, error, empty, degraded, full)
- THEN = specific content, values, labels, conditional elements
- More, thinner files — one per domain concern

### Anti-patterns

| Symptom                              | Fix                                             |
| ------------------------------------ | ----------------------------------------------- |
| E2e THEN names formatted values      | Move to integration; e2e asserts section exists |
| Integration THEN involves navigation | Move to e2e; integration renders directly       |
| Same assertion in both layers        | Pick ONE owner                                  |
| E2e covers only happy path           | Add journey per reachable state                 |
| Scenario file has no implementation  | Flag as gap                                     |

## Scenario Format

```
// SCENARIO: {what user experiences}
// GIVEN: {initial state}
// WHEN: {user action}
// THEN: {expected outcome}
```

Shared setup:

```
// CONTEXT: {module} — {aspect}
// PRECONDITIONS:
// - {data / user state}
```

### THEN by layer

- **E2e**: landmarks — "data section visible", "error state shown", "warning banner appears". No values, formats, counts.
- **Integration**: specifics — "amount formatted as currency", "status label reflects state", "each entry shows value with range".
- Mixed THEN → split into two scenarios, one per layer.

## Flow

1. **Requirements** — Find or ask. Never invent.
2. **Codebase** — Per module: actions, data sources, failure modes, edge cases.
3. **State Inventory** — List every reachable state. Each needs min 1 e2e (reachable?) + 1 integration (renders?).
4. **Layer Assignment** — Getting there → e2e. What's rendered → integration. Mixed → split.
5. **File Planning** — `__e2e__/`: per journey entry. `__tests__/`: per concern.
6. **Overlap Check** — Same assertion in both → remove from one. E2e keeps journey, integration keeps detail.
7. **Write** — Comment-only files with CONTEXT + SCENARIO blocks.
8. **Gaps** — `GAP: {requirement} → {reason}`
9. **Summary Table**

## Output

Comment-only files in `__e2e__/` and `__tests__/`, plus conversation summary:

```
{module}/
  __e2e__/{journey}.spec.ts    — {covers}
  __tests__/{concern}.test.tsx  — {covers}

| Layer       | Files | Scenarios | Coverage |
|-------------|-------|-----------|----------|
| e2e         | N     | N         | ...      |
| integration | N     | N         | ...      |
| gaps        | —     | N         | ...      |
```

Feeds into `black-box-tester` or `interpreter-e2e` for implementation.
