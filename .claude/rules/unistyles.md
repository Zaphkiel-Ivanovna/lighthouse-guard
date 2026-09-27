---
paths:
  - 'src/**/*.tsx'
  - 'src/theme/**'
  - 'src/shared/ui/**'
---

# Styling: Unistyles v3 only

Unistyles 3 is a C++ (Nitro) styling engine plus a Babel plugin. Styles update on theme and runtime changes **without re-rendering React**. Break its rules and the styles silently stop updating. For deep questions, load the `react-native-unistyles-v3` skill.

## Must

- `import { StyleSheet } from 'react-native-unistyles'`. Never import `StyleSheet` from `react-native`.
- Define styles at module level, below the component: `const styles = StyleSheet.create((theme, rt) => ({ ... }))`.
- Use theme tokens only: `theme.colors.*`, `theme.space(n)`, `theme.radius.*`, `theme.typography.*`. No raw hex colors, magic font sizes or spacing numbers in components.
- Combine styles with **arrays**: `style={[styles.card, isActive && styles.cardActive]}`.
- Use variants for visual states: declare a `variants` key (with `compoundVariants` where needed) and call `styles.useVariants({ ... })` at the top of the component, before reading the styles.
- For dynamic values, use a style function: `row: (selected: boolean) => ({ opacity: selected ? 1 : 0.6 })`, then `style={styles.row(selected)}`.
- For safe areas and screen size, use `rt.insets` and `rt.screen` inside `StyleSheet.create` instead of `useSafeAreaInsets` for styling.
- To pass theme values to non-style props (icon `color`, `Switch` `trackColor`, NativeTabs `tintColor`…), use `withUnistyles(Component, (theme) => ({ color: theme.colors.text }))`. Fall back to `useUnistyles()` only in leaf components or navigation options, because it re-renders.
- Change themes only through `@/theme` helpers (`setThemePreference`), which drive `UnistylesRuntime`.

## Never

- Spread a style (`{...styles.x}`): it breaks the C++ binding.
- Re-export `StyleSheet` or style objects through a barrel `index.ts`.
- Create styles inside a component body, `useMemo`, or a hook.
- Use inline style objects for anything themeable (a small layout tweak like `{ flex: 1 }` is fine).
- Use `uniwind`, `nativewind`, `heroui-native`, `tailwind-*` or `clsx`. They are banned.
- Mutate `theme` or `rt` inside a style function, or move style functions out of `StyleSheet.create`.
- Spread Unistyles styles inside `useAnimatedStyle`. Pass the static style and the animated style as an array.
- Put `backgroundImage` (gradients) in a theme-dependent style. Unistyles 3.3 drops it on theme switches. Use `GradientLayer` with the gradient string read from `useUnistyles()` during render.
- Never leave coloured fills flat (accent, badges, toggles, tiles). Wrap them in `<GradientLayer image={subtleGradient(color)} />` (or `washGradient` for translucent tiles) inside an `overflow: 'hidden'` parent, so every coloured surface gets the same subtle depth. `SUBTLE_SHIFT` is AA-tested; do not raise it without re-running `src/theme/__tests__/accents.test.ts`.

## Theme shape

`src/theme/themes.ts` defines `light` and `dark` with the same shape:

- `colors` (including `inverse` / `onInverse` for the dark round header button);
- `lighthouseState` (graphics: LED, dots, fills) and `lighthouseStateText` (AA text on `surface`);
- `gradients` (`sky` page wash, `hero` highlight card);
- `hero` (content on the hero gradient);
- `badge` (iOS Settings-style icon squares);
- `space()`, `radius`, `typography`.

Adding a token means adding it to **both** themes; TypeScript enforces this through `satisfies AppTheme`. Visual language: airy smart-home UI with a pastel sky gradient, white rounded cards (`radius.lg`, soft `shadow`), accessory icon tiles (`LighthouseIcon`), coloured status text, and pill buttons.
