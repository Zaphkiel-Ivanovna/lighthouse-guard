import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { setTransportMode, useTransportModeStore } from '@/core/ble';
import { ListSection, Screen } from '@/shared/ui';

import { SwitchSetting } from '../components/SwitchSetting';

export function DeveloperSettingsScreen() {
  const { t } = useTranslation();
  const isMockMode = useTransportModeStore((s) => s.mode === 'mock');

  return (
    <Screen testID='developer-settings'>
      <Stack.Screen options={{ title: t('settings.debug.title') }} />
      <ListSection footer={t('settings.debug.mockModeHint')}>
        <SwitchSetting
          testID='mock-mode-switch'
          title={t('settings.debug.mockMode')}
          value={isMockMode}
          onChange={(enabled) => setTransportMode(enabled ? 'mock' : 'native')}
        />
      </ListSection>
    </Screen>
  );
}
