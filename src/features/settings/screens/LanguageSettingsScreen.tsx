import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_PREFERENCES, setPreference, usePreference } from '@/core/preferences';
import { Screen } from '@/shared/ui';

import { ChoiceList } from '../components/ChoiceList';

export function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const language = usePreference('language');

  return (
    <Screen testID='language-settings'>
      <Stack.Screen options={{ title: t('settings.display.language') }} />
      <ChoiceList
        footer={t('settings.language.hint')}
        testIDPrefix='language'
        choices={LANGUAGE_PREFERENCES.map((code) => ({ value: code, label: t(`settings.display.languages.${code}`) }))}
        value={language}
        onChange={(code) => setPreference('language', code)}
      />
    </Screen>
  );
}
