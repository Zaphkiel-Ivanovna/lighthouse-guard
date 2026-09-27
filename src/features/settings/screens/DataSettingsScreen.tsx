import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListRow, ListSection, Screen } from '@/shared/ui';

import { useBackupActions } from '../hooks/useBackupActions';

const ICONS = {
  export: { ios: 'square.and.arrow.up', android: 'upload' },
  import: { ios: 'square.and.arrow.down', android: 'download' },
  clearNames: { ios: 'trash.fill', android: 'delete' },
  reset: { ios: 'arrow.counterclockwise', android: 'restart_alt' },
} as const;

export function DataSettingsScreen() {
  const { t } = useTranslation();
  const { exportSettings, importSettings, confirmClearNames, confirmReset } = useBackupActions();

  return (
    <Screen testID='data-settings'>
      <Stack.Screen options={{ title: t('settings.data.title') }} />
      <ListSection title={t('settings.data.backup')} footer={t('settings.data.backupHint')}>
        <ListRow
          testID='export-settings'
          icon={ICONS.export}
          title={t('settings.data.export')}
          onPress={exportSettings}
        />
        <ListRow
          testID='import-settings'
          icon={ICONS.import}
          title={t('settings.data.import')}
          onPress={importSettings}
        />
      </ListSection>
      <ListSection>
        <ListRow
          testID='clear-names'
          icon={ICONS.clearNames}
          title={t('settings.data.clearNames')}
          destructive
          onPress={confirmClearNames}
        />
        <ListRow
          testID='reset-everything'
          icon={ICONS.reset}
          title={t('settings.data.reset')}
          destructive
          onPress={confirmReset}
        />
      </ListSection>
    </Screen>
  );
}
