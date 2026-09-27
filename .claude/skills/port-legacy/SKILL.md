---
name: port-legacy
description: Port a screen, component or behaviour from the old app (../lighthouse-guard-old, SDK 54 + uniwind/heroui-native + react-native-ble-plx) into this codebase's architecture (features, Unistyles v3, ble-nitro, i18n). The old project is read-only reference.
disable-model-invocation: true
argument-hint: <what to port, e.g. "rename dialog" or "src/components/Settings/SelectTheme.tsx">
---

# Port from lighthouse-guard-old

The old project lives at `../lighthouse-guard-old` and is **read-only** (edits are denied in settings). Port **behaviour**, not code: the old code mixes concerns. Rewrite it to this project's rules.

## 1. Locate and understand

- Read the old file(s) for `$ARGUMENTS` and everything they depend on (stores, services, utils).
- Write down the behaviour: inputs, states, edge cases, and which store fields are involved. Ignore old implementation details.
- Check whether this repo already covers part of it (e.g. rename, debug mode and theme are already ported).

## 2. Map old → new

| Old                                                                    | New                                                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `className="…"` (uniwind/Tailwind), `cn()`, `tailwind-variants`        | `StyleSheet.create((theme) => …)` with variants (Unistyles v3)                                 |
| `heroui-native` `Card`, `Button`, `Chip`, `Accordion`, `useThemeColor` | `@/shared/ui` primitives; theme via `StyleSheet.create` or `withUnistyles`                     |
| `withUniwind(Icon)` + `lucide-react-native`                            | `Icon` from `@/shared/ui` (SF Symbols / Material Symbols via `expo-symbols`)                   |
| `@ontech7/react-native-dialog`, rename dialog store                    | Form-sheet route (`presentation: 'formSheet'`), see `RenameLighthouseScreen`                   |
| `useLighthouseStore` (456-line god store)                              | `features/lighthouses/store/*` (state + setters) + `services/lighthouse-controller.ts` (async) |
| `LighthouseService` / `MockLighthouseService` (ble-plx, base64)        | `@/core/ble` `LighthouseClient` over `BleTransport` (`number[]` bytes)                         |
| `LighthouseState` / `LighthousePowerCommand` enums                     | `PowerState` / `PowerCommand` string unions                                                    |
| `useSettingsStore.isDebugMode`                                         | `useTransportModeStore` (`'mock'` ↔ debug mode) in `@/core/ble`                                |
| `AppThemeProvider` / `Uniwind.setTheme`                                | `setThemePreference` from `@/theme`                                                            |
| `@react-navigation/*` (`useHeaderHeight`, `Tabs`)                      | `expo-router` only (`NativeTabs`, `Stack`, `contentInsetAdjustmentBehavior`)                   |
| `Haptics.*` inline with `Platform.OS` checks                           | `haptics.*` from `@/shared/utils/haptics`                                                      |
| Hard-coded English strings                                             | i18n keys in `en.ts` + `fr.ts`                                                                 |
| `Logger` class with ANSI prefix                                        | `createLogger('namespace')` from `@/core/logger`                                               |

## 3. Implement

- Place code per `.claude/rules/architecture.md`, using `new-screen`, `ui-component` or `lighthouse-protocol` as needed.
- Keep the old UX intent but use platform-native patterns (form sheets, large titles, `ListSection` rows).
- Add tests for any logic (stores, services, utils) and `testID`s on new UI.

## 4. Verify and summarise

- Run the `verify` skill.
- Tell the user what was ported, what was intentionally changed, and anything from the old code that was dropped, and why.
