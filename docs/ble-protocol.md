# SteamVR Base Station 2.0 — BLE protocol

Source of truth in code: `src/core/ble/protocol/constants.ts` and `lighthouse-v2.ts`.

## Discovery

- Advertised local name: `LHB-XXXXXXXX` (8 hex characters, unique per unit).
- The app filters scan results by that name prefix (`isLighthouseName`).
- A base station accepts **one BLE connection at a time**: always disconnect after a session.

## GATT

Control service: `00001523-1212-efde-1523-785feabcd124`

| Characteristic | UUID                                   | Access       | Payload                                                       |
| -------------- | -------------------------------------- | ------------ | ------------------------------------------------------------- |
| Power          | `00001525-1212-efde-1523-785feabcd124` | read / write | 1 byte (below)                                                |
| Channel        | `00001524-1212-efde-1523-785feabcd124` | read         | 1 byte, RF channel 1–16 (0x01–0x10); other values are ignored |
| Identify       | `00008421-1212-efde-1523-785feabcd124` | write        | `0x00` → LED blinks                                           |

### Device Information Service

Standard Bluetooth service `0000180a-0000-1000-8000-00805f9b34fb`, read in the same session as the channel when the detail screen opens. Each value is an ASCII string; padding and control bytes are dropped. A station that doesn't expose a field simply doesn't show it.

| Field             | UUID                                   |
| ----------------- | -------------------------------------- |
| Model number      | `00002a24-0000-1000-8000-00805f9b34fb` |
| Serial number     | `00002a25-0000-1000-8000-00805f9b34fb` |
| Firmware revision | `00002a26-0000-1000-8000-00805f9b34fb` |
| Hardware revision | `00002a27-0000-1000-8000-00805f9b34fb` |
| Manufacturer name | `00002a29-0000-1000-8000-00805f9b34fb` |

Sources: [BenWoodford's GATT notes](https://gist.github.com/BenWoodford/3a1e500a4ea2673525f5adb4120fd47c) for the channel, and [lighthouse-ble](https://github.com/g4bri3lDev/lighthouse-ble) for the Device Information fields.

### Power: write

| Byte   | Command                                              |
| ------ | ---------------------------------------------------- |
| `0x00` | sleep (rotor and lasers off)                         |
| `0x01` | on                                                   |
| `0x02` | standby (lasers off, rotor spinning, faster wake-up) |

### Power: read

| Byte          | State   | Notes                                                                                         |
| ------------- | ------- | --------------------------------------------------------------------------------------------- |
| `0x00`        | sleep   |                                                                                               |
| `0x02`        | standby |                                                                                               |
| `0x08`        | booting | Spinning up after a wake command.                                                             |
| `0x09`        | **on**  | Awake, woken from sleep. This is the steady value after SteamVR powers a sleeping station on. |
| `0x0b`        | **on**  | Awake, woken from standby.                                                                    |
| `0x01`        | **on**  | Awake; sometimes reported instead of `0x09` / `0x0b`.                                         |
| anything else | unknown | Logged as a warning with the raw byte.                                                        |

Sources:

- [BenWoodford's reverse-engineered GATT notes](https://gist.github.com/BenWoodford/3a1e500a4ea2673525f5adb4120fd47c).
- [svrbsctl](https://github.com/chenxiaolong/svrbsctl), which maps `0x01`, `0x09` and `0x0b` to _awake_.
- [lighthouse_pm](https://github.com/jeroen1602/lighthouse_pm), whose mapping we started from. It classifies `0x01` and `0x09` as booting and documents the resulting "stuck on booting while already on" bug (issue #13). We don't repeat that.

The UI never locks controls on `booting`: a booting unit can still be put to sleep.

## Timings used by the client

|                                   |                                         |
| --------------------------------- | --------------------------------------- |
| Scan duration                     | 10 s                                    |
| Connect timeout                   | 10 s                                    |
| Read/write timeout                | 5 s                                     |
| Poll interval after a power write | 1 s                                     |
| Poll timeout                      | 15 s (sleep → on typically takes 3–8 s) |

## Adding a capability

Follow the `lighthouse-protocol` skill:

1. Add constants in `protocol/constants.ts`.
2. Add a pure encoder or decoder in `protocol/lighthouse-v2.ts`, with tests.
3. Add a client method using `withConnection`, with tests against `MockBleTransport`.
4. Add mock support.
5. Add a feature controller action, then a hook, then the UI.
