import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { createLogger } from '@/core/logger';
import { clearLighthouseNames, knownStations } from '@/features/lighthouses';
import { haptics } from '@/shared/utils/haptics';

import { applyBackup, remapBackup } from '../services/backup';
import { exportBackupFile, pickBackupFile } from '../services/backup-file';
import { resetEverything } from '../services/reset';

const logger = createLogger('settings');

export function useBackupActions() {
  const { t } = useTranslation();

  const exportSettings = async () => {
    try {
      await exportBackupFile(t('settings.data.export'));
    } catch (error) {
      logger.warn('export failed', error);
      haptics.error();
      Alert.alert(t('settings.data.exportFailed'));
    }
  };

  const showInvalidBackup = () => {
    haptics.error();
    Alert.alert(t('settings.data.importInvalidTitle'), t('settings.data.importInvalidBody'));
  };

  const importSettings = async () => {
    try {
      const result = await pickBackupFile();
      if (result.status === 'canceled') return;
      if (result.status === 'invalid') {
        showInvalidBackup();
        return;
      }
      Alert.alert(t('settings.data.importConfirmTitle'), t('settings.data.importConfirmBody'), [
        { text: t('common.actions.cancel'), style: 'cancel' },
        {
          text: t('settings.data.importAction'),
          onPress: () => {
            applyBackup(remapBackup(result.backup, knownStations()));
            haptics.success();
          },
        },
      ]);
    } catch (error) {
      logger.warn('import failed', error);
      showInvalidBackup();
    }
  };

  const confirmClearNames = () => {
    Alert.alert(t('settings.data.clearNamesConfirmTitle'), t('settings.data.clearNamesConfirmBody'), [
      { text: t('common.actions.cancel'), style: 'cancel' },
      { text: t('settings.data.clearNames'), style: 'destructive', onPress: clearLighthouseNames },
    ]);
  };

  const confirmReset = () => {
    Alert.alert(t('settings.data.resetConfirmTitle'), t('settings.data.resetConfirmBody'), [
      { text: t('common.actions.cancel'), style: 'cancel' },
      {
        text: t('settings.data.reset'),
        style: 'destructive',
        onPress: () => {
          resetEverything();
          haptics.success();
        },
      },
    ]);
  };

  return {
    exportSettings: () => void exportSettings(),
    importSettings: () => void importSettings(),
    confirmClearNames,
    confirmReset,
  };
}
