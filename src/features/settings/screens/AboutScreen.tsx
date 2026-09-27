import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListRow, ListSection, Screen } from '@/shared/ui';

export function AboutScreen() {
  const { t } = useTranslation();

  return (
    <Screen testID='about-settings'>
      <Stack.Screen options={{ title: t('settings.about.title') }} />
      <ListSection footer={t('settings.about.disclaimer')}>
        <ListRow title={t('settings.about.version')} value={Constants.expoConfig?.version ?? '-'} />
        <ListRow title={t('settings.about.license')} value='GPL-3.0' />
      </ListSection>
    </Screen>
  );
}
