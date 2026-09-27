---
name: new-feature
description: Scaffold a new feature slice in src/features/<name> (screens, components, hooks, store, services, public index, i18n namespace) following the project architecture. Use when adding a new domain area such as groups, schedules or widgets settings.
argument-hint: <feature-name> [short description]
---

# New feature slice

Create `src/features/$ARGUMENTS` following `.claude/rules/architecture.md`. Feature names are kebab-case folders; exports are PascalCase or camelCase.

## Steps

1. **Check first**: does an existing feature already own this domain? If so, extend it instead.
2. Create only the folders you need now (no empty placeholders):
   ```
   src/features/<name>/
     index.ts            public API: screens, and the hooks or actions other features need
     types.ts            domain types (string unions, readonly fields)
     screens/            <Name>Screen.tsx (one per route)
     components/         feature-specific UI built from @/shared/ui
     hooks/              useXxx.ts: minimal zustand selectors and derived values
     store/              <name>.store.ts: state plus small sync setters (persist via @/core/storage if needed)
     services/           async orchestration (BLE, timers): writes to the store
     utils/              pure helpers
   ```
3. **i18n**: add a `<name>` namespace to `src/core/i18n/locales/en.ts` **and** `fr.ts` (TypeScript fails until both match).
4. **Routes**: for each screen, use the `new-screen` skill. It adds a thin file in `src/app/` that re-exports the screen. If the feature needs a tab, add a `NativeTabs.Trigger` in `src/app/(tabs)/_layout.tsx` (`sf` + `md` icons, `testID='tab-<name>'`).
5. **Tests**: add `__tests__/` next to services, stores and utils. Services that touch BLE run against `MockBleTransport` (set `setTransportMode('mock')` in the test).
6. **Docs**: add the feature to the folder map in `docs/architecture.md`, and to its state table if it owns a store.
7. Run the `verify` skill.

## Store template

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

type GroupsState = { readonly groups: Readonly<Record<string, Group>> };

export const useGroupsStore = create<GroupsState>()(
  persist(() => ({ groups: {} as Record<string, Group> }), {
    name: 'groups',
    version: 1,
    storage: createJSONStorage(() => mmkvStateStorage),
  }),
);

export function addGroup(group: Group): void {
  useGroupsStore.setState((s) => ({ groups: { ...s.groups, [group.id]: group } }));
}
```

## Cross-feature rules

- Import other features only through `@/features/<other>` (their `index.ts`). Never create a cycle: if two features need each other, move the shared piece to `core` or `shared`.
- Example: the future `groups` feature can call `@/features/lighthouses` exports (e.g. a `setPower` re-export), never its internal store.
