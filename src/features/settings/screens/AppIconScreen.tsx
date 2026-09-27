import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/shared/ui';

import { AppIconPicker } from '../components/AppIconPicker';

export function AppIconScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.sheet} testID='app-icon-sheet'>
      <View style={styles.header}>
        <Text variant='headline' accessibilityRole='header'>
          {t('settings.appIcon.title')}
        </Text>
        <Text variant='callout' tone='muted'>
          {t('settings.appIcon.hint')}
        </Text>
      </View>
      <View style={styles.card}>
        <AppIconPicker />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  sheet: {
    gap: theme.space(4),
    padding: theme.space(5),
    paddingBottom: rt.insets.bottom + theme.space(4),
    backgroundColor: theme.colors.background,
  },
  header: {
    gap: theme.space(1),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
  },
}));
