import { Stack } from 'expo-router';

import { largeTitleStackOptions } from '@/shared/navigation/stack-options';

export default function SettingsLayout() {
  return <Stack screenOptions={largeTitleStackOptions} />;
}
