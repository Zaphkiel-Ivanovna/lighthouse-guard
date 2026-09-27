---
name: lighthouse-protocol
description: SteamVR Base Station 2.0 (Lighthouse V2) BLE protocol knowledge and the procedure to add or change a BLE capability end-to-end (protocol → client → mock → controller → hook → UI → tests). Use for any change touching src/core/ble or lighthouse commands, power states, scanning, polling, identify, channel.
---

# Lighthouse V2 BLE work

Protocol reference: `docs/ble-protocol.md`. Constraints: `.claude/rules/ble.md`.

## Mental model

```
UI component ──> feature controller (features/lighthouses/services) ──> LighthouseClient (core/ble)
                         │ writes                                           │ queue.run(session)
                         ▼                                                  ▼
                 zustand store  <── onUpdate ──────────────  BleTransport (Nitro | Mock)
```

- `BleTransport` is the only hardware boundary. `NitroBleTransport` wraps `react-native-ble-nitro` (`number[]` payloads, lazy native init). `MockBleTransport` simulates devices, with latency and boot timings based on `Date.now()`, so Jest fake timers drive it.
- `LighthouseClient.withConnection` = `queue.run` → connect (timeout) → session → **disconnect in finally**. Never hold a connection across sessions.
- The controller owns the UX state: `pending` / `error` per device, scan status, and re-entrancy guards.

## Adding a capability (example: read the RF channel)

1. **Protocol** (`protocol/constants.ts`, `protocol/lighthouse-v2.ts`): add constants and a pure, total decoder, e.g. `decodeChannel(bytes): number | null`.
2. **Protocol tests** (`protocol/__tests__/lighthouse-v2.test.ts`): nominal, empty and out-of-range payloads.
3. **Client** (`lighthouse-client.ts`): add a method to the `LighthouseClient` type and implement it with `withConnection` + `withTimeout(…, TIMING.operationTimeoutMs, 'read channel')`.
4. **Mock** (`transport/mock-transport.ts`): make the mock answer the new characteristic realistically.
5. **Client tests** (`__tests__/lighthouse-client.test.ts`): run against `MockBleTransport` with `jest.useFakeTimers()` and `await jest.advanceTimersByTimeAsync(ms)`. Assert the device is disconnected afterwards (`transport.isConnected(id) === false`).
6. **Public API**: export the new types from `core/ble/index.ts` if features need them.
7. **Feature**: add a controller function (via `runCommand` for commands), store fields plus setters if the value is displayed, and a hook with a minimal selector.
8. **UI**: component or row, i18n keys (EN + FR), `testID`, and error display through `BleErrorBanner`.
9. **E2E**: if it is user-facing, extend a Maestro flow (debug mode).
10. Run the `verify` skill, then ask the `ble-reviewer` agent to review the diff.

## Batched / group commands (future `groups` feature)

- Call `setPower` for each device sequentially **through the controller**. The queue serialises sessions anyway. Prefer "write all, then poll each" if latency matters.
- Report per-device results. One failing lighthouse must not abort the others.

## Debugging on hardware

- Only one central can be connected to a base station. SteamVR's own power management, or another phone, will make connects fail (`connectionFailed` / `timeout`).
- iOS: the Bluetooth permission prompt appears on the first scan (lazy init). Simulators have no BLE, so use debug mode.
- Android 12+: `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` (no location, thanks to `neverForLocation`). Below 12: `ACCESS_FINE_LOCATION`.
