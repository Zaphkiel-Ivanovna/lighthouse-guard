---
paths:
  - '**/__tests__/**'
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - '.maestro/**'
  - 'jest.config.js'
  - 'jest.setup.ts'
---

# Testing

## Unit / integration (Jest + jest-expo + React Native Testing Library)

- Tests are colocated: `<folder>/__tests__/<unit>.test.ts(x)`.
- **Protocol, queue and client code must be tested** (`src/core/ble/**`). Test the client against `MockBleTransport`, never against a mocked `react-native-ble-nitro`.
- Use fake timers (`jest.useFakeTimers()` + `await jest.advanceTimersByTimeAsync(ms)`) for polling, timeouts and mock latency. Never add real sleeps.
- RNTL 14: `render`, `fireEvent` and `renderHook` are **async**, so `await` them. Query by role or label first (`getByRole('button', { name: … })`), then by `testID`. Assert with the built-in matchers (`toBeOnTheScreen`, `toBeDisabled`, `toHaveAccessibilityValue`).
- Reset zustand stores and the MMKV mock in `beforeEach`.
- Don't snapshot whole screens. Assert behaviour.
- Test names describe behaviour: `it('polls until the lighthouse reports ON')`.

## E2E (Maestro)

- Flows live in `.maestro/*.yaml` and run against a **dev client build** in debug mode (mock transport), so no hardware is needed.
- Select elements by `id:` (testID), not by visible text, so flows survive i18n changes.
- Each flow starts with `launchApp: { clearState: true }` and is independent.
- Run them with `yarn test:e2e` (requires the `maestro` CLI and a running simulator or emulator with the dev build installed).
