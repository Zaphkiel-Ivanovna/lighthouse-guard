---
paths:
  - 'src/**/*.tsx'
  - 'src/theme/motion.ts'
---

# Motion (Reanimated 4)

Motion in this app is **functional**: every animation communicates something. Before adding one, finish this sentence in one line: it shows **state** (the hardware is doing X), gives **feedback** (your touch or command registered), or keeps **continuity** (what moved where).

| Pattern                     | Meaning                          | Where                                                         |
| --------------------------- | -------------------------------- | ------------------------------------------------------------- |
| `Orbit` (spinning arc)      | Continuous activity              | Pending command, scan running (never a settled state)         |
| `PulseRings` (radar)        | Searching                        | Scan in progress                                              |
| LED breathing (opacity)     | Warming up                       | `LighthouseIcon` LED while a lighthouse boots                 |
| `PressableScale`            | Physical press feedback          | Cards, buttons, toggles                                       |
| Colour interpolation        | State change on the same element | Power toggle fill                                             |
| `transitions.enterItem(i)`  | New content arriving, in order   | Lists (staggered, capped at 8 items)                          |
| `transitions.crossfadeIn()` | Content replaced in place        | State labels, status lines (key the `Animated.View` on state) |
| `transitions.layout()`      | Siblings reflowing               | Anything that appears, disappears or resizes inside a list    |

## Rules

- **No bounce.** Springs are critically damped and clamped (no overshoot). Entrances and reflows are timed ease-out, never `springify()`.
- Use tokens from `@/theme` only (`spring`, `timing`, `easing`, `transitions`). No inline `duration: 300` or ad-hoc spring configs.
- Animate only `transform`, `opacity` and colours. Never width, height, top or left per frame (exception: one-off measured widths such as the `SegmentedControl` indicator).
- Shared values use `.get()` / `.set()`, never `.value`, because the React Compiler is on.
- Themed colours inside worklets come from `useAnimatedTheme()` (`react-native-unistyles/reanimated`), so they follow theme switches without a re-render.
- Combine styles as `[styles.x, animatedStyle]`. Never spread a Unistyles style into `useAnimatedStyle`.
- **Reduce Motion is mandatory.** Tokens carry `ReduceMotion.System`. Infinite loops (`withRepeat`) must use `useReduceMotion()` from `@/shared/hooks/useReduceMotion` (live, unlike Reanimated's `useReducedMotion`, which is read once) and render a static equivalent.
- Loops pause off-screen: gate them with `useIsFocused()` (expo-router), because tab and stack screens stay mounted.
- Infinite loops must be stopped with `cancelAnimation` in the effect cleanup.
- Loops only for real ongoing states (rotor, scan, pending). Never idle decoration.
- A state crossfade uses `entering` only when the element is in flow; add `exiting` only for absolutely positioned layers, otherwise both versions stack during the transition.
- Pair motion with haptics on user-initiated outcomes: `haptics.success()` / `haptics.error()` when a command settles.
- Tests: Reanimated and Worklets are mocked in `jest.setup.ts`, so assert behaviour, not animation frames.
