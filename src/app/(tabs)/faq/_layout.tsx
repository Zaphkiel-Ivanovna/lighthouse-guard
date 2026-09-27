import { Stack } from 'expo-router';

import { tabRootOptions, tabStackOptions } from '@/shared/navigation/stack-options';

export default function FaqLayout() {
  return (
    <Stack screenOptions={tabStackOptions}>
      <Stack.Screen name='index' options={tabRootOptions} />
    </Stack>
  );
}
