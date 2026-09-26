# Architecture

## Layers

```
┌──────────────────────────────────────────────────────────────┐
│ src/app         expo-router routes & layouts (thin)          │
├──────────────────────────────────────────────────────────────┤
│ src/features    lighthouses · settings · faq · (groups…)     │
├──────────────────────────────────────────────────────────────┤
│ src/shared      ui/ (design system) · navigation/ · utils/   │
├──────────────────────────────────────────────────────────────┤
│ src/theme       tokens · themes · breakpoints · unistyles    │
├──────────────────────────────────────────────────────────────┤
│ src/core        ble/ · storage/ · i18n/ · logger/ · utils/   │
└──────────────────────────────────────────────────────────────┘
          imports only flow downwards (enforced by ESLint + hooks)
```

## Folder map

```
index.ts                       entry: Unistyles configure → i18n → expo-router
app.config.ts                  single source of native config (CNG: ios/ and android/ are generated)
src/
  app/
    _layout.tsx                ThemeProvider (navigation colours from Unistyles) + root Stack
    (tabs)/_layout.tsx         NativeTabs: lighthouses · settings · faq
    (tabs)/(lighthouses)/      Stack: list → lighthouse/[id] → lighthouse/[id]/rename (form sheet)
    (tabs)/settings/, faq/     Stacks with large titles
  core/
    ble/
      transport/               BleTransport contract · NitroBleTransport · MockBleTransport
      protocol/                LH v2 constants + pure encode/decode
      queue.ts                 serial GATT queue
      lighthouse-client.ts     scan · readPowerState · setPower (+poll) · identify
      transport-mode.ts        native | mock (debug mode), persisted, picks the client
      permissions.ts           Android runtime permissions
      errors.ts                BleError + codes
    storage/                   MMKV instance + zustand adapter
    i18n/                      i18next instance, typed EN/FR resources
    logger/, utils/
  theme/                       tokens → light/dark themes → StyleSheet.configure, theme preference
  shared/
    ui/                        Text, Button, Icon, Card, Chip, Screen, ListSection, ListRow, Switch, TextField, Banner, EmptyState
    navigation/                shared Stack screen options
    utils/                     haptics
  features/
    lighthouses/               screens, components, hooks, store (session + persisted names), services (controller)
    settings/                  theme, debug mode, data, about
    faq/
.maestro/                      E2E flows (debug mode, no hardware)
docs/                          architecture, BLE protocol
.claude/                       rules, hooks, skills, agents, settings
```

## Data flow: turning a lighthouse on

```
PowerToggle (tap)
  → features/lighthouses/services/lighthouse-controller.setPower(id, 'on')
      store.commands[id] = pending
      → core/ble getLighthouseClient().setPower(id, 'on', { onUpdate })
          → queue.run(session)                       one GATT session at a time
              transport.connect → write 0x01 → read… (poll 1 s) → disconnect (finally)
          ← onUpdate(state) → store.devices[id].state = booting … on
      store.commands[id] = idle | error(code)
  ← components re-render from minimal zustand selectors
```

`MockBleTransport` replaces `NitroBleTransport` when debug mode is on (Settings → Developer), so the whole chain runs without hardware, in Jest and in Maestro.

## State

| Store                     | Where                      | Persisted | Content                                                    |
| ------------------------- | -------------------------- | --------- | ---------------------------------------------------------- |
| `useLighthousesStore`     | features/lighthouses/store | no        | discovered devices, scan status, per-device command status |
| `useDeviceNamesStore`     | features/lighthouses/store | MMKV      | custom names                                               |
| `useTransportModeStore`   | core/ble                   | MMKV      | `native` or `mock`                                         |
| `useThemePreferenceStore` | theme                      | MMKV      | `system` · `light` · `dark`                                |

## Roadmap hooks

- **Groups and global actions** ("Living room", "Turn everything on"): new `features/groups/` (persisted groups plus a controller that loops over `setPower`). The serial queue already makes batched commands safe.
- **Widgets / Live Activities**: `expo-widgets` (SDK 58), declared in `app.config.ts`. Share state with the app by moving the MMKV instance to an App Group container (`core/storage`).
- **Siri / Shortcuts / App Intents**: `expo-app-intents` (alpha, SDK 58), with Swift intent files in `app-intents/` at the repo root. Intents call into the same BLE client via a small native↔JS bridge or a headless task.
- **Background automations**: enable `isBackgroundEnabled` and `modes: ['central']` in the ble-nitro plugin, plus iOS state restoration (`restoreIdentifier`).
