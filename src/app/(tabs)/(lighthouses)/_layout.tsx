import { Stack } from 'expo-router';

import { largeTitleStackOptions } from '@/shared/navigation/stack-options';

export default function LighthousesLayout() {
  return (
    <Stack screenOptions={largeTitleStackOptions}>
      <Stack.Screen name='index' />
      <Stack.Screen name='lighthouse/[id]/index' options={{ headerLargeTitle: false }} />
      <Stack.Screen
        name='lighthouse/[id]/rename'
        options={{
          presentation: 'formSheet',
          headerShown: false,
          sheetAllowedDetents: [0.45],
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
