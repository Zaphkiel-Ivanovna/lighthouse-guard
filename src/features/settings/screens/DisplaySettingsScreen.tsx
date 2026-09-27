import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { setPreference, SORT_ORDERS, usePreference } from '@/core/preferences';
import { ListSection, Screen } from '@/shared/ui';

import { ChoiceList } from '../components/ChoiceList';
import { SwitchSetting } from '../components/SwitchSetting';

export function DisplaySettingsScreen() {
  const { t } = useTranslation();
  const sortOrder = usePreference('sortOrder');
  const showChannel = usePreference('showChannelOnCards');
  const showSignal = usePreference('showSignalOnCards');

  return (
    <Screen testID='display-settings'>
      <Stack.Screen options={{ title: t('settings.display.title') }} />
      <ChoiceList
        title={t('settings.display.sort')}
        testIDPrefix='sort'
        choices={SORT_ORDERS.map((order) => ({ value: order, label: t(`settings.display.sortBy.${order}`) }))}
        value={sortOrder}
        onChange={(order) => setPreference('sortOrder', order)}
      />
      <ListSection title={t('settings.display.cards')}>
        <SwitchSetting
          testID='show-channel-switch'
          title={t('settings.display.showChannel')}
          value={showChannel}
          onChange={(value) => setPreference('showChannelOnCards', value)}
        />
        <SwitchSetting
          testID='show-signal-switch'
          title={t('settings.display.showSignal')}
          value={showSignal}
          onChange={(value) => setPreference('showSignalOnCards', value)}
        />
      </ListSection>
    </Screen>
  );
}
