import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OFF_MODES, setPreference, usePreference } from '@/core/preferences';
import { ListSection, Screen } from '@/shared/ui';

import { ChoiceList } from '../components/ChoiceList';
import { SwitchSetting } from '../components/SwitchSetting';

export function ControlSettingsScreen() {
  const { t } = useTranslation();
  const offMode = usePreference('offMode');
  const confirmTurnOffAll = usePreference('confirmTurnOffAll');
  const hapticsEnabled = usePreference('haptics');

  return (
    <Screen testID='control-settings'>
      <Stack.Screen options={{ title: t('settings.control.title') }} />
      <ChoiceList
        title={t('settings.control.offMode')}
        testIDPrefix='off-mode'
        choices={OFF_MODES.map((mode) => ({
          value: mode,
          label: t(`lighthouses.state.${mode}`),
          subtitle: t(`lighthouses.detail.description.${mode}`),
        }))}
        value={offMode}
        onChange={(mode) => setPreference('offMode', mode)}
      />
      <ListSection>
        <SwitchSetting
          testID='confirm-turn-off-switch'
          title={t('settings.control.confirmTurnOffAll')}
          value={confirmTurnOffAll}
          onChange={(value) => setPreference('confirmTurnOffAll', value)}
        />
        <SwitchSetting
          testID='haptics-switch'
          title={t('settings.control.haptics')}
          value={hapticsEnabled}
          onChange={(value) => setPreference('haptics', value)}
        />
      </ListSection>
    </Screen>
  );
}
