---
paths:
  - 'src/**/store/**'
  - 'src/core/storage/**'
  - 'src/theme/theme-preference.ts'
---

# State (zustand 5) and persistence (MMKV 4)

- One store per concern, named `use<Name>Store`, in `features/<name>/store/<name>.store.ts`.
- The store holds **serialisable state plus small synchronous setters**. Async orchestration (BLE, timers, polling) lives in `features/<name>/services/*` and writes to the store via `useXxxStore.setState` or its setters. Never put class instances (BLE managers, services) in store state.
- Components select minimal slices: `useStore((s) => s.x)`. For multiple fields, use `useShallow` from `zustand/react/shallow`. Derive values in selectors or hooks, not in stored state.
- Collections keyed by id: `Record<string, T>`, with immutable updates (`{ ...s.devices, [id]: next }`). Never `Object.assign` into existing state objects.
- Persistence goes through `persist` plus `createJSONStorage(() => mmkvStateStorage)` from `@/core/storage`. Always set a `partialize` (persist only user data, never transient flags) and a `version`, with a `migrate` once the shape changes.
- Non-React access (services, tests) uses `useXxxStore.getState()` and `.setState()`.
- Tests reset stores in `beforeEach` with `useXxxStore.setState(initialState, true)`.
- `AsyncStorage` is banned. MMKV is synchronous, so read it during startup instead of showing loading states.
