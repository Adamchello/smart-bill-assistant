---
name: module-structure
description: >
  Scaffold a feature module following the canonical folder structure with domain, core, integration, configuration, presentation, and test layers.
  Trigger: When creating a new module, scaffolding a feature, or structuring a React module with event-driven architecture.
---

## When to Use

- Creating new feature module under `src/modules/`
- Restructuring existing module to follow canonical architecture
- User asks for "module structure", "scaffold module", or "new feature module"

## Folder Structure

```
src/modules/{module-name}/
├── __e2e__/
│   └── main-flow.spec.ts
├── __tests__/
│   └── main.test.tsx
├── configuration/
│   ├── constraints.ts          # constants, static config
│   └── validation.ts           # framework adapters (RHF, zod), error messages
├── core/
│   ├── store.ts                # module state
│   └── utils.ts                # module-specific helpers
├── domain/
│   ├── events.ts               # discriminated union of all module events
│   └── models.ts               # branded types, discriminated unions, pure data
├── integration/
│   ├── mappers.ts              # API shape → domain shape, exhaustive switches
│   └── repository.ts           # async API calls, accepts AbortSignal, returns domain types
└── presentation/
    ├── main.tsx                # module root, exportable outside module
    └── {component}.tsx
```

Reference: `src/modules/user-profile-setup/`

## Layer Rules

### `domain/` — Vocabulary

- Imports NOTHING from other layers
- Pure types only: branded IDs, discriminated unions, type aliases
- Zero logic, zero side effects

### `configuration/` — Constants & Framework Adapters

- `FEATURE_NAME` in PascalCase (used by `createHookContext`)
- Framework-specific adapters live here (domain types in, framework types out)
- Error message constants here, not in components

### `core/` — State & Logic

- Module state and helpers that don't belong in other layers
- Presentation imports directly — no abstraction layer needed
- State in `store.ts`, helpers in `utils.ts`

### `integration/` — External Data

- Repository returns domain types, not API shapes
- Mappers use exhaustive switches with `never` in default branch
- Called from core, never from presentation

### `presentation/` — React Layer

- Components import state from `core/store`
- Pure UI only — no logic in components, all logic in `core/`

### Testing

- Integration: real mediator, mock API with MSW, test behavior via userEvent
- E2E: interpreter pattern with typed command registry

## Invariants

1. **Integration called from core, never presentation** — components don't fetch
2. **Domain imports nothing** from other layers
3. **Exhaustive switches** everywhere discriminated unions appear
