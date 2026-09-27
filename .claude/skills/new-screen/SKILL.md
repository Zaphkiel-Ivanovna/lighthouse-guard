---
name: new-screen
description: Add a screen to a feature and wire it into expo-router (thin route file, Stack options, typed navigation, i18n title, testIDs). Use when adding a page, modal or form sheet.
argument-hint: <feature> <route path, e.g. (lighthouses)/lighthouse/[id]/firmware>
---

# New screen

## 1. Screen component (in the feature)

`src/features/<feature>/screens/<Name>Screen.tsx`:

```tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListSection, Screen } from '@/shared/ui';

export function FirmwareScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen testID='firmware-screen'>
      <Stack.Screen options={{ title: t('lighthouses.firmware.title') }} />
      <ListSection title={t('lighthouses.firmware.current')}>{/* … */}</ListSection>
    </Screen>
  );
}
```

- A **tab root** uses `TabScreen` (title + optional `action` on one line, compact bar on scroll; the native header is hidden via `tabRootOptions`). A **pushed screen** uses `Screen` (automatic insets under the native, transparent header). Use `FlashList` only for long lists.
- Titles and all copy come from i18n (`en.ts` + `fr.ts`).
- Give the root and every interactive element a stable `testID`.

## 2. Export it

Add it to `src/features/<feature>/index.ts`.

## 3. Route file (thin)

`src/app/(tabs)/(<group>)/<path>.tsx`:

```tsx
export { FirmwareScreen as default } from '@/features/lighthouses';
```

Nothing else goes in the route file.

## 4. Stack options

If the screen needs non-default presentation, declare it in the nearest `_layout.tsx`:

```tsx
<Stack.Screen name='lighthouse/[id]/firmware' options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5] }} />
```

Tab stacks use `tabStackOptions` from `@/shared/navigation/stack-options`, and their `index` route gets `tabRootOptions`.

## 5. Navigate with typed routes

```ts
router.push({ pathname: '/lighthouse/[id]/firmware', params: { id } });
```

Typed routes are generated in `.expo/types` when Metro starts. Run `yarn start` once if TypeScript does not know a new route.

## 6. Verify

- Add or extend a Maestro flow if the screen is part of a key journey.
- Run the `verify` skill.
