# Lighthouse Guard

iOS/Android app that controls **SteamVR Base Station 2.0 ("Lighthouse V2")** over Bluetooth Low Energy: scan, power on/standby/sleep, identify (blink), rename. v2 is a clean rewrite of `../lighthouse-guard-old` (reference only, never edit it).

## Stack

Expo **SDK 58 (preview)** · React Native 0.88 · React 19.3 (React Compiler on) · TypeScript 6 (strict) · expo-router 58 with `NativeTabs` · **Unistyles 3** · zustand 5 + MMKV 4 · react-native-ble-nitro · i18next (EN/FR) · Jest + RNTL 14 · Maestro · **yarn 4** (node-modules linker).

Nitro modules (Unistyles, MMKV, ble-nitro) mean **no Expo Go**: use the dev client (`yarn ios` / `yarn android`). `react-native-nitro-modules` is pinned through `resolutions`: bump it deliberately and in one place.

## Commands

|                                 |                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `yarn start`                    | Metro for the dev client                                                      |
| `yarn ios` / `yarn android`     | Build and run the dev client (runs prebuild when needed)                      |
| `yarn prebuild`                 | Regenerate `ios/` and `android/` from `app.config.ts` (CNG)                   |
| `yarn verify`                   | lint + format check + typecheck + unit tests: **must pass before you finish** |
| `yarn test` / `yarn test:watch` | Jest                                                                          |
| `yarn test:e2e`                 | Maestro flows in `.maestro/` (dev build on a simulator, debug mode)           |
| `yarn doctor`                   | expo-doctor                                                                   |

## Architecture (details: `.claude/rules/architecture.md`, `docs/architecture.md`)

```
src/app       routes only (thin re-exports of feature screens)
src/features  vertical slices: lighthouses, settings, faq (screens, components, hooks, store, services, index.ts)
src/shared    ui/ design system (Unistyles), navigation/, utils/
src/theme     tokens, light/dark themes, breakpoints, Unistyles configure, theme preference
src/core      ble/ (transport → protocol → queue → client), storage/ (MMKV), i18n/, logger/, utils/
```

Dependencies flow `app → features → shared → theme → core`. The `pre-edit-guard` hook and ESLint both enforce this.

## Working rules

- **yarn only.** Native or SDK-pinned packages: `yarn expo install <pkg>`. JS-only: `yarn add <pkg>`. Then `yarn prebuild` when native code changed. npm/pnpm/bun are blocked by a hook.
- **Never edit `ios/`, `android/`, `yarn.lock` or `.env*`** (blocked by a hook). Native config belongs in `app.config.ts` or a config plugin.
- Styling is Unistyles v3 only (`.claude/rules/unistyles.md`). UI strings go through i18n in **both** `en.ts` and `fr.ts` (`.claude/rules/i18n.md`).
- BLE access goes through `@/core/ble` only. Every GATT session goes through the serial queue and always disconnects (`.claude/rules/ble.md`).
- New behaviour ships with tests (`.claude/rules/testing.md`). BLE logic is tested against `MockBleTransport`.
- Code, comments, identifiers and commits are in English. Talk to the user in French.
- When unsure about an Expo, Unistyles or library API, check the docs (Expo MCP / plugin skills, context7, or the `react-native-unistyles-v3` skill) rather than relying on memory. SDK 58 is recent.

## Automations

- **Hooks** (`.claude/hooks/`, wired in `.claude/settings.json`):
  - PreToolUse: `pre-edit-guard` (protected files, architecture rules) and `pre-bash-guard` (yarn only).
  - PostToolUse: `post-edit-quality` (Prettier + `eslint --fix`, reports remaining errors).
  - Stop: `stop-verify` (tsc + Jest related tests for the files you touched; blocks the stop until they pass, max 3 tries).
- **Skills** (`.claude/skills/`): `new-feature`, `new-screen`, `ui-component`, `lighthouse-protocol`, `port-legacy`, `verify`, `commit`, `react-native-unistyles-v3` (official, vendored).
- **Agents** (`.claude/agents/`): `ble-reviewer`, `rn-reviewer`. Run them on non-trivial BLE or UI changes before finishing.
- **MCP**: the `expo` server comes from the enabled `expo@claude-plugins-official` plugin, which also provides the Expo skills. `.mcp.json` adds `context7`, `mobile` (simulator/emulator control) and `github` (needs `GITHUB_PERSONAL_ACCESS_TOKEN`).

## Gotchas

- `NativeTabs` import: `expo-router/native-tabs` (stable in SDK 58). `md` icons need `expo-symbols`.
- Never import from `@react-navigation/*`: expo-router forked it. `ThemeProvider` and `DarkTheme` come from `expo-router`.
- Unistyles reserves the variant key `default`; use another name (e.g. `primary`).
- TypeScript 6 no longer auto-includes `@types/*`: global types are listed in `tsconfig.json` → `types`.
- RNTL 14: `render`, `fireEvent` and `renderHook` are async, so `await` them.
- Type style props as `ViewProps['style']` / `TextProps['style']`, not `StyleProp<ViewStyle>`: `expo-env.d.ts` pulls in react-native-web augmentations (`position: 'fixed'`) that clash with RN 0.88's strict View types.
- `index.ts` is the entry (not `expo-router/entry`): it configures Unistyles, then i18n, then loads the router.
- The iOS Bluetooth prompt is deferred to the first scan (`iOSLazyInit`). Android 12+ scans without location (`neverForLocation`).
