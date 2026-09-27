---
paths:
  - 'src/**/*.tsx'
  - 'src/**/*.ts'
  - 'app.config.ts'
---

# React Native / Expo SDK 58 conventions

## Components

- Function components only, with named exports and props typed as `type Props = { readonly ... }`.
- The React Compiler is on (`experiments.reactCompiler`). **Don't add `useMemo`, `useCallback` or `React.memo` by default**; the compiler memoizes. Add them only with a measured reason. Keep components pure: no mutation during render, no reading refs in render.
- Use `Pressable` for touch targets (not `TouchableOpacity`), with a minimum 44×44 pt hit area (`hitSlop` if needed).
- Accessibility: every interactive element gets an `accessibilityRole` and an `accessibilityLabel` (i18n). Every state (disabled, busy, selected) is reflected in `accessibilityState`.
- Every interactive or asserted element gets a stable `testID` (kebab-case, e.g. `lighthouse-card-${id}`). Maestro and RNTL rely on it.
- Haptics go through `@/shared/utils/haptics`. Never call `expo-haptics` directly from components.
- Images use `expo-image`, not `Image` from react-native.
- Long lists (dozens of rows or more) use `@shopify/flash-list`. Short lists such as lighthouses (usually under 16) map inside a `ScrollView`, so Reanimated layout animations (enter, reorder) work reliably.
- Touch feedback comes from `PressableScale` (`@/shared/ui`). Motion follows `.claude/rules/motion.md`.
- Don't use `Platform.OS` ternaries sprinkled through JSX; use `Platform.select` or `.ios.tsx`/`.android.tsx` files for real divergence.

## Navigation (expo-router)

- Routes live in `src/app/` and stay thin: they re-export screens from features.
- Import navigation APIs **only** from `expo-router` (`Stack`, `Link`, `router`, `useLocalSearchParams`, `ThemeProvider`…). `@react-navigation/*` imports are banned since SDK 56 forked React Navigation.
- Tab roots render `TabScreen` (title and action on one line) with the native header hidden. Pushed screens keep the native header.
- Tabs use `NativeTabs` (see `src/app/(tabs)/_layout.tsx`), with SF Symbols (`sf`) on iOS and Material Symbols (`md`) on Android.
- Typed routes are on: use `href` objects or typed strings, and never build URLs by string concatenation from user input.
- Screen titles and header options come from i18n keys.

## State and effects

- Never subscribe to a whole zustand store. Select the minimal slice: `useLighthousesStore((s) => s.devices[id])`.
- Keep side effects (BLE, timers) in services and store actions, not in components. Components call actions; `useEffect` is for syncing with external systems only, and always cleans up.
- Wrap async actions called from handlers in `void` plus error handling. Never leave a floating promise.

## Expo config

- `app.config.ts` is the single source for native configuration. `ios/` and `android/` are generated (CNG) and gitignored: never edit them.
- Add native libraries with `yarn expo install <pkg>` so versions match the SDK. Then run `yarn expo prebuild --clean` and rebuild the dev client (`yarn ios` / `yarn android`).
- No Expo Go: Unistyles, MMKV and ble-nitro are Nitro modules, so the app requires the dev client.
