import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { canChangeAppIcon, useAppIcon } from '@/core/app-icon';
import { setPreference, usePreference } from '@/core/preferences';
import { ListRow, ListSection, Screen, SegmentedControl } from '@/shared/ui';
import { setThemePreference, THEME_PREFERENCES, useThemePreference } from '@/theme';

import { AccentPicker } from '../components/AccentPicker';
import { THUMBNAILS } from '../components/app-icon-thumbnails';
import { SwitchSetting } from '../components/SwitchSetting';

export function AppearanceSettingsScreen() {
  const { t } = useTranslation();
  const themePreference = useThemePreference();
  const appIcon = useAppIcon();
  const launchAnimation = usePreference('launchAnimation');

  return (
    <Screen testID='appearance-settings'>
      <Stack.Screen options={{ title: t('settings.appearance.title') }} />
      <ListSection title={t('settings.appearance.theme')}>
        <View style={styles.segmentRow}>
          <SegmentedControl
            options={THEME_PREFERENCES.map((option) => ({
              value: option,
              label: t(`settings.appearance.${option}`),
              testID: `theme-${option}`,
            }))}
            value={themePreference}
            onChange={setThemePreference}
            accessibilityLabel={t('settings.appearance.theme')}
          />
        </View>
      </ListSection>

      <ListSection title={t('settings.accent.title')}>
        <AccentPicker />
      </ListSection>

      <ListSection>
        {canChangeAppIcon && (
          <ListRow
            testID='app-icon-row'
            leading={<Image source={THUMBNAILS[appIcon]} style={styles.appIcon} accessible={false} />}
            title={t('settings.appIcon.title')}
            value={t(`settings.appIcon.names.${appIcon}`)}
            accessory='chevron'
            onPress={() => router.push('/settings/app-icon')}
          />
        )}
        <SwitchSetting
          testID='launch-animation-switch'
          title={t('settings.display.launchAnimation')}
          value={launchAnimation}
          onChange={(value) => setPreference('launchAnimation', value)}
        />
      </ListSection>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  segmentRow: {
    padding: theme.space(3),
  },
  appIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
  },
}));
