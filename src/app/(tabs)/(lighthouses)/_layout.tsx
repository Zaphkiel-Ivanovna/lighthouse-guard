import { Stack } from 'expo-router';

import { tabRootOptions, tabStackOptions } from '@/shared/navigation/stack-options';

export default function LighthousesLayout() {
  return (
    <Stack screenOptions={tabStackOptions}>
      <Stack.Screen name='index' options={tabRootOptions} />
      <Stack.Screen name='lighthouse/[id]/index' />
      <Stack.Screen
        name='lighthouse/[id]/rename'
        options={{
          presentation: 'formSheet',
          headerShown: false,
          sheetAllowedDetents: [0.45],
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name='groups/index'
        options={{
          presentation: 'formSheet',
          headerShown: false,
          sheetAllowedDetents: [0.55, 1],
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name='groups/edit'
        options={{
          presentation: 'formSheet',
          headerShown: false,
          sheetAllowedDetents: [1],
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
