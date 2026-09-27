import { Stack } from 'expo-router';

import { tabRootOptions, tabStackOptions } from '@/shared/navigation/stack-options';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={tabStackOptions}>
      <Stack.Screen name='index' options={tabRootOptions} />
      <Stack.Screen name='appearance' />
      <Stack.Screen name='display' />
      <Stack.Screen name='language' />
      <Stack.Screen name='control' />
      <Stack.Screen name='scanning' />
      <Stack.Screen name='hidden-stations' />
      <Stack.Screen name='groups' />
      <Stack.Screen name='data' />
      <Stack.Screen name='developer' />
      <Stack.Screen name='about' />
      <Stack.Screen
        name='app-icon'
        options={{
          presentation: 'formSheet',
          headerShown: false,
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
