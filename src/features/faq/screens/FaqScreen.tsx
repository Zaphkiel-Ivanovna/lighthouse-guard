import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Screen, Text } from '@/shared/ui';

const QUESTIONS = ['standbyVsSleep', 'notDetected', 'oneConnection'] as const;

export function FaqScreen() {
  const { t } = useTranslation();

  return (
    <Screen testID='faq-screen'>
      <Stack.Screen options={{ title: t('faq.title') }} />
      {QUESTIONS.map((key) => (
        <Card key={key}>
          <Text variant='headline' accessibilityRole='header'>
            {t(`faq.items.${key}.question`)}
          </Text>
          <Text tone='muted'>{t(`faq.items.${key}.answer`)}</Text>
        </Card>
      ))}
    </Screen>
  );
}
