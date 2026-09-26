---
paths:
  - 'src/core/ble/**'
  - 'src/features/lighthouses/**'
---

# BLE / Lighthouse V2

Layering inside `src/core/ble/`:

```
transport/   BleTransport interface + NitroBleTransport (react-native-ble-nitro) + MockBleTransport
protocol/    Pure LH v2 encoding and decoding: UUIDs, power bytes ↔ states, command bytes (100% unit-tested)
queue.ts     Serial operation queue: one GATT operation at a time, per app
lighthouse-client.ts   High-level API: scan, readPowerState, setPower, identify, waitForPowerState
permissions.ts         Android runtime permissions
errors.ts              BleError normalisation (codes and user-facing i18n keys)
```

## Must

- Only `src/core/ble/transport/**` may import `react-native-ble-nitro`. Everything else talks to `BleTransport` through `lighthouse-client`.
- Every connect → read/write → disconnect sequence runs inside `queue.run(...)`, and the disconnect happens in a `finally` block. Lighthouses have a single BLE slot, and a leaked connection makes the base station invisible to SteamVR and other phones.
- Every async BLE operation has a timeout (`withTimeout`) and an `AbortSignal` for long-running work (scans, polling).
- Protocol bytes and UUIDs live only in `protocol/constants.ts`. Never inline `0x…` magic numbers elsewhere.
- Decoders are total: unknown bytes map to `'unknown'` and never throw.
- Errors crossing the core boundary are `BleError` instances with a `code`. The UI maps codes to i18n messages, never raw native strings.
- `MockBleTransport` must behave like real hardware: latency, state transitions (booting → on), and disconnects. Any new protocol capability gets mock support in the same change, so debug mode and tests keep working.
- New protocol behaviour gets unit tests in `protocol/__tests__` and client tests against `MockBleTransport`.

## Lighthouse V2 facts (reference)

- Advertised name prefix `LHB-`. Control service `00001523-1212-efde-1523-785feabcd124`.
- Power characteristic `00001525-…`:
  - Write: `0x00` sleep, `0x01` on, `0x02` standby.
  - Read: `0x00` sleep, `0x02` standby, `0x01`/`0x08`/`0x09` booting, `0x0b` on, others unknown.
- Identify characteristic `00008421-…`: write `0x00` to blink the LED.
- Channel characteristic `00001524-…` (read-only for now).
- After a power write, poll the state about every 1 s until it reaches the target, or give up after 15 s.

See `docs/ble-protocol.md` and the `lighthouse-protocol` skill for adding commands.
