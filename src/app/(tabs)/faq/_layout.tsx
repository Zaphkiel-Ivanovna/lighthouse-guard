import { Stack } from 'expo-router';

import { largeTitleStackOptions } from '@/shared/navigation/stack-options';

export default function FaqLayout() {
  return <Stack screenOptions={largeTitleStackOptions} />;
}
