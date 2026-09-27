import { NativeTabs } from 'expo-router/native-tabs';
import { useTranslation } from 'react-i18next';
import { useUnistyles } from 'react-native-unistyles';

import lighthouseTabIcon from '@/assets/images/tabs/lighthouse.png';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <NativeTabs tintColor={theme.colors.accent}>
      <NativeTabs.Trigger name='(lighthouses)' testID='tab-lighthouses'>
        <NativeTabs.Trigger.Icon src={lighthouseTabIcon} renderingMode='template' />
        <NativeTabs.Trigger.Label>{t('tabs.lighthouses')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='settings' testID='tab-settings'>
        <NativeTabs.Trigger.Icon sf='gearshape.fill' md='settings' />
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='faq' testID='tab-faq'>
        <NativeTabs.Trigger.Icon sf='questionmark.circle.fill' md='help' />
        <NativeTabs.Trigger.Label>{t('tabs.faq')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
