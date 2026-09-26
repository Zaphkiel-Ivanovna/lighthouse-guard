---
name: ui-component
description: Create or extend a design-system primitive in src/shared/ui with Unistyles v3 variants, theme tokens, accessibility, testID passthrough and an RNTL test. Use for any reusable visual component (not feature-specific UI).
argument-hint: <ComponentName> [purpose]
---

# Design-system component

Shared primitives live in `src/shared/ui/`: they know nothing about lighthouses or features. Feature-specific UI goes in `src/features/<name>/components/` and composes these primitives.

Before creating one, check `src/shared/ui/index.ts`: extending an existing primitive with a variant is usually better than a new component.

## Template

```tsx
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { haptics } from '@/shared/utils/haptics';

import { Text } from './Text';

type Props = {
  readonly label: string;
  readonly onPress: () => void;
  readonly tone?: 'neutral' | 'accent';
  readonly testID?: string;
};

export function Pill({ label, onPress, tone = 'neutral', testID }: Props) {
  styles.useVariants({ tone });

  const handlePress = () => {
    haptics.selection();
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      accessibilityRole='button'
      accessibilityLabel={label}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <Text variant='caption'>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(1.5),
    borderRadius: theme.radius.pill,
    variants: {
      tone: {
        neutral: { backgroundColor: theme.colors.surfaceMuted },
        accent: { backgroundColor: theme.colors.accent },
      },
    },
  },
  pressed: { opacity: 0.7 },
}));
```

## Checklist

- [ ] `StyleSheet` imported from `react-native-unistyles`. Styles at module level, using theme tokens only.
- [ ] Variants for visual states, with `styles.useVariants()` called first. The variant key **`default` is reserved** by Unistyles, so never use it as an option name.
- [ ] Array style composition, never a spread.
- [ ] Theme values in non-style props (`color`, `tintColor`, `trackColor`…) through `withUnistyles(Component, (theme) => ({ … }))`. `useUnistyles()` only in leaf components.
- [ ] Accessibility: role, label, state (`disabled`, `busy`, `selected`, `checked`), and a 44 pt minimum touch target.
- [ ] `testID` prop forwarded.
- [ ] Icons via `Icon` with `{ ios: SFSymbol, android: MaterialSymbol }`.
- [ ] Exported from `src/shared/ui/index.ts`. **Never** re-export `StyleSheet` there.
- [ ] Test in `src/shared/ui/__tests__/<Name>.test.tsx` (RNTL 14: `await render`, `await fireEvent.press`, query by role or label).
- [ ] If a new token is needed, add it to `src/theme/tokens.ts` and to **both** themes in `themes.ts`.

For advanced Unistyles questions (breakpoints, `ScopedTheme`, Reanimated), load the `react-native-unistyles-v3` skill.
