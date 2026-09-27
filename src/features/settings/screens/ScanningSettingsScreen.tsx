import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SCAN_DURATIONS, setPreference, usePreference } from '@/core/preferences';
import { ListRow, ListSection, Screen } from '@/shared/ui';

import { ChoiceList } from '../components/ChoiceList';
import { SwitchSetting } from '../components/SwitchSetting';

export function ScanningSettingsScreen() {
  const { t } = useTranslation();
  const autoScan = usePreference('autoScanOnLaunch');
  const refreshOnForeground = usePreference('refreshOnForeground');
  const scanDuration = usePreference('scanDurationSeconds');
  const hiddenCount = Object.keys(usePreference('hiddenLighthouses')).length;

  return (
    <Screen testID='scanning-settings'>
      <Stack.Screen options={{ title: t('settings.scanning.title') }} />
      <ListSection footer={t('settings.scanning.refreshOnForegroundHint')}>
        <SwitchSetting
          testID='auto-scan-switch'
          title={t('settings.scanning.autoScan')}
          value={autoScan}
          onChange={(value) => setPreference('autoScanOnLaunch', value)}
        />
        <SwitchSetting
          testID='refresh-foreground-switch'
          title={t('settings.scanning.refreshOnForeground')}
          value={refreshOnForeground}
          onChange={(value) => setPreference('refreshOnForeground', value)}
        />
      </ListSection>
      <ChoiceList
        title={t('settings.scanning.duration')}
        footer={t('settings.scanning.durationHint')}
        testIDPrefix='scan-duration'
        choices={SCAN_DURATIONS.map((seconds) => ({
          value: String(seconds),
          label: t('settings.scanning.seconds', { count: seconds }),
        }))}
        value={String(scanDuration)}
        onChange={(seconds) =>
          setPreference('scanDurationSeconds', SCAN_DURATIONS.find((option) => String(option) === seconds) ?? 10)
        }
      />
      <ListSection>
        <ListRow
          testID='hidden-stations-row'
          title={t('settings.scanning.hidden')}
          value={String(hiddenCount)}
          accessory='chevron'
          onPress={() => router.push('/settings/hidden-stations')}
        />
      </ListSection>
    </Screen>
  );
}
