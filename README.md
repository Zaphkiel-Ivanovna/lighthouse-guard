# Lighthouse Guard

Control your **SteamVR Base Station 2.0** lighthouses from your phone over Bluetooth LE: scan, power on / standby / sleep, identify, rename.

Expo SDK 58 · React Native 0.88 · expo-router (NativeTabs) · Unistyles 3 · zustand + MMKV · react-native-ble-nitro · i18n EN/FR.

## Prerequisites

- Node 24 (`.nvmrc`) with Corepack enabled (`corepack enable`). The project pins yarn 4 via `packageManager`.
- Xcode 27 (iOS 27 SDK) and/or Android Studio (SDK 36/37).
- A physical device for real lighthouses. Simulators have no BLE: use **Settings → Developer → Simulated lighthouses**.
- Optional: [Maestro](https://maestro.mobile.dev) for E2E (`curl -fsSL https://get.maestro.mobile.dev | bash`).

## Getting started

```bash
yarn install
yarn ios        # or: yarn android — builds the dev client (no Expo Go: Nitro modules)
yarn start      # Metro, later sessions
```

## Scripts

| Script          |                                                 |
| --------------- | ----------------------------------------------- |
| `yarn verify`   | lint + format check + typecheck + unit tests    |
| `yarn test`     | Jest (jest-expo + React Native Testing Library) |
| `yarn test:e2e` | Maestro flows (`.maestro/`, debug mode)         |
| `yarn prebuild` | Regenerate native projects from `app.config.ts` |
| `yarn doctor`   | expo-doctor                                     |

## Project layout

See [`docs/architecture.md`](docs/architecture.md) for the full map and data flow, and [`docs/ble-protocol.md`](docs/ble-protocol.md) for the Lighthouse V2 GATT protocol.

```
src/app        routes (thin)          src/shared   design system, navigation, utils
src/features   lighthouses, settings,  src/theme    Unistyles tokens & themes
               faq                     src/core     BLE, storage, i18n, logger
```

## Claude Code

This repo ships a full Claude Code setup:

- `CLAUDE.md`: the project brief.
- `.claude/rules/`: path-scoped conventions.
- `.claude/hooks/`: guard-rails, formatting and verification.
- `.claude/skills/`: scaffolding and workflows.
- `.claude/agents/`: BLE and React Native reviewers.
- `.mcp.json`: context7, mobile, GitHub.
- The Expo plugin, which provides the Expo MCP and the Expo skills.

For the GitHub MCP, export a token before launching Claude: `export GITHUB_PERSONAL_ACCESS_TOKEN=$(gh auth token)`.
