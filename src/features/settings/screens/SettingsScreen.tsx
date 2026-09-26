import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { setTransportMode, useTransportModeStore } from '@/core/ble';
import { clearLighthouseNames } from '@/features/lighthouses';
import { ListRow, ListSection, Screen, Switch } from '@/shared/ui';
import { setThemePreference, useThemePreference, type ThemePreference } from '@/theme';

const THEME_OPTIONS: readonly ThemePreference[] = ['system', 'light', 'dark'];

export function SettingsScreen() {
  const { t } = useTranslation();
  const themePreference = useThemePreference();
  const isMockMode = useTransportModeStore((s) => s.mode === 'mock');

  const confirmClearNames = () => {
    Alert.alert(t('settings.data.clearNamesConfirmTitle'), t('settings.data.clearNamesConfirmBody'), [
      { text: t('common.actions.cancel'), style: 'cancel' },
      { text: t('settings.data.clearNames'), style: 'destructive', onPress: clearLighthouseNames },
    ]);
  };

  return (
    <Screen testID='settings-screen'>
      <Stack.Screen options={{ title: t('settings.title') }} />

      <ListSection title={t('settings.appearance.title')}>
        {THEME_OPTIONS.map((option) => (
          <ListRow
            key={option}
            testID={`theme-${option}`}
            title={t(`settings.appearance.${option}`)}
            accessory='check'
            selected={themePreference === option}
            onPress={() => setThemePreference(option)}
          />
        ))}
      </ListSection>

      <ListSection title={t('settings.debug.title')} footer={t('settings.debug.mockModeHint')}>
        <ListRow
          title={t('settings.debug.mockMode')}
          accessory={
            <Switch
              testID='mock-mode-switch'
              value={isMockMode}
              onValueChange={(enabled) => setTransportMode(enabled ? 'mock' : 'native')}
              accessibilityLabel={t('settings.debug.mockMode')}
            />
          }
        />
      </ListSection>

      <ListSection title={t('settings.data.title')}>
        <ListRow testID='clear-names' title={t('settings.data.clearNames')} destructive onPress={confirmClearNames} />
      </ListSection>

      <ListSection title={t('settings.about.title')}>
        <ListRow title={t('settings.about.version')} value={Constants.expoConfig?.version ?? '—'} />
      </ListSection>
    </Screen>
  );
}
