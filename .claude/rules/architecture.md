# Architecture

Feature-based layout with a strict, one-way dependency direction:

```
app  →  features  →  shared  →  theme  →  core
```

A layer may import from any layer to its right, never to its left. Hooks and ESLint (`import/no-restricted-paths`) enforce this.

| Folder                                        | Purpose                                                                                                                                                                                                                                     | May import                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `src/app/`                                    | expo-router routes and layouts **only**. A route file re-exports a screen from a feature (`export { LighthouseListScreen as default } from '@/features/lighthouses'`) or composes layouts. No business logic, no styles beyond layout glue. | everything                                                     |
| `src/features/<name>/`                        | A vertical slice: `screens/`, `components/`, `hooks/`, `store/`, `services/`, `types.ts`, and an `index.ts` public API.                                                                                                                     | `shared`, `theme`, `core`, other features' **`index.ts` only** |
| `src/shared/ui/`                              | Design-system primitives (Text, Button, Card, Chip, Screen, ListRow, Icon…). No feature knowledge.                                                                                                                                          | `theme`, `core`                                                |
| `src/shared/navigation/`, `src/shared/utils/` | Shared navigation options and generic helpers (haptics…).                                                                                                                                                                                   | `theme`, `core`                                                |
| `src/theme/`                                  | Unistyles config: tokens, themes, breakpoints, theme preference.                                                                                                                                                                            | `core`                                                         |
| `src/core/`                                   | Platform services with no UI: `ble/` (transport, LH v2 protocol, client, queue), `storage/` (MMKV), `logger/`, `i18n/`, `utils/` (async helpers).                                                                                           | `core` only                                                    |

## Rules

- Inside a feature, use **relative imports**. Across features, use `@/features/<name>` (the barrel). Never deep-import (`@/features/x/store/...`). Keep cross-feature imports rare and acyclic: if two features need each other, move the shared part down to `core` or `shared`.
- `index.ts` barrels export the public surface only: screens, the hooks other code needs, and types. Never re-export `StyleSheet` from a barrel (it breaks the Unistyles Babel plugin).
- One component per file. The file name matches the export: `LighthouseCard.tsx` exports `LighthouseCard`. Hooks are `useXxx.ts`, stores `xxx.store.ts`, services `xxx.service.ts` or `xxx-client.ts`, tests `*.test.ts(x)` colocated in `__tests__/`.
- Named exports everywhere, except the `default` export that expo-router requires in `src/app/**`.
- Path alias: `@/*` maps to `src/*`. Assets use `@/assets/*`.
- Types: `strict` plus `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow it. Prefer `type` over `interface` unless you are declaration-merging. Use string-literal unions or `as const` objects over TS `enum`, except for wire protocol bytes, where a `const` object is used too.
- No dead code, commented-out code, or TODOs without an owner. Delete instead.

## Where does X go?

- A new BLE command or characteristic: `src/core/ble/protocol/`, then `lighthouse-client.ts`, then the feature store action. See the `lighthouse-protocol` skill.
- A new screen: the feature's `screens/`, plus a thin route in `src/app/`. See the `new-screen` skill.
- A reusable visual component: `src/shared/ui/`. See the `ui-component` skill.
- A new domain area (groups, schedules…): `src/features/<name>/`. See the `new-feature` skill.
- Native extensions (widgets, App Intents, Siri): the `targets/` or `modules/` directories at the repo root, managed through config plugins. Never put them in `ios/` or `android/`.
- Persisted user data: a zustand store with `persist` and MMKV storage from `@/core/storage`.
