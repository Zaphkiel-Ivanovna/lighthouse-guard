# SteamVR Base Station 2.0 — BLE protocol

Source of truth in code: `src/core/ble/protocol/constants.ts` and `lighthouse-v2.ts`.

## Discovery

- Advertised local name: `LHB-XXXXXXXX` (8 hex characters, unique per unit).
- The app filters scan results by that name prefix (`isLighthouseName`).
- A base station accepts **one BLE connection at a time**: always disconnect after a session.

## GATT

Control service: `00001523-1212-efde-1523-785feabcd124`

| Characteristic | UUID                                   | Access       | Payload             |
| -------------- | -------------------------------------- | ------------ | ------------------- |
| Power          | `00001525-1212-efde-1523-785feabcd124` | read / write | 1 byte (below)      |
| Channel        | `00001524-1212-efde-1523-785feabcd124` | read         | 1 byte (RF channel) |
| Identify       | `00008421-1212-efde-1523-785feabcd124` | write        | `0x00` → LED blinks |

### Power: write

| Byte   | Command                                              |
| ------ | ---------------------------------------------------- |
| `0x00` | sleep (rotor and lasers off)                         |
| `0x01` | on                                                   |
| `0x02` | standby (lasers off, rotor spinning, faster wake-up) |

### Power: read

| Byte                   | State                            |
| ---------------------- | -------------------------------- |
| `0x00`                 | sleep                            |
| `0x02`                 | standby                          |
| `0x01`, `0x08`, `0x09` | booting (spin-up, laser warm-up) |
| `0x0b`                 | on                               |
| anything else          | unknown                          |

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
