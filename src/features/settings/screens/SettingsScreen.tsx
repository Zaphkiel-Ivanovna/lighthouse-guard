import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTransportModeStore } from '@/core/ble';
import { usePreference } from '@/core/preferences';
import { useStartupGroup } from '@/features/lighthouses';
import { ListRow, ListSection, TabScreen, type IconName } from '@/shared/ui';
import { useThemePreference } from '@/theme';

type Entry = {
  readonly key: string;
  readonly icon: IconName;
  readonly title: string;
  readonly value?: string;
  readonly href: Href;
};

export function SettingsScreen() {
  const { t } = useTranslation();
  const themePreference = useThemePreference();
  const sortOrder = usePreference('sortOrder');
  const language = usePreference('language');
  const offMode = usePreference('offMode');
  const scanDuration = usePreference('scanDurationSeconds');
  const startupGroup = useStartupGroup();
  const isMockMode = useTransportModeStore((s) => s.mode === 'mock');

  const sections: readonly (readonly Entry[])[] = [
    [
      {
        key: 'appearance',
        icon: { ios: 'paintbrush.fill', android: 'palette' },
        title: t('settings.appearance.title'),
        value: t(`settings.appearance.${themePreference}`),
        href: '/settings/appearance',
      },
      {
        key: 'display',
        icon: { ios: 'list.bullet.rectangle.fill', android: 'view_list' },
        title: t('settings.display.title'),
        value: t(`settings.display.sortBy.${sortOrder}`),
        href: '/settings/display',
      },
      {
        key: 'language',
        icon: { ios: 'globe', android: 'language' },
        title: t('settings.display.language'),
        value: t(`settings.display.languages.${language}`),
        href: '/settings/language',
      },
    ],
    [
      {
        key: 'control',
        icon: { ios: 'power', android: 'power_settings_new' },
        title: t('settings.control.title'),
        value: t(`lighthouses.state.${offMode}`),
        href: '/settings/control',
      },
      {
        key: 'scanning',
        icon: { ios: 'antenna.radiowaves.left.and.right', android: 'bluetooth_searching' },
        title: t('settings.scanning.title'),
        value: t('settings.scanning.seconds', { count: scanDuration }),
        href: '/settings/scanning',
      },
      {
        key: 'groups',
        icon: { ios: 'rectangle.3.group.fill', android: 'workspaces' },
        title: t('settings.groups.title'),
        value: startupGroup?.name ?? t('lighthouses.groups.all'),
        href: '/settings/groups',
      },
    ],
    [
      {
        key: 'data',
        icon: { ios: 'externaldrive.fill', android: 'storage' },
        title: t('settings.data.title'),
        href: '/settings/data',
      },
      {
        key: 'developer',
        icon: { ios: 'hammer.fill', android: 'build' },
        title: t('settings.debug.title'),
        value: isMockMode ? t('settings.debug.simulation') : undefined,
        href: '/settings/developer',
      },
    ],
    [
      {
        key: 'about',
        icon: { ios: 'info.circle.fill', android: 'info' },
        title: t('settings.about.title'),
        value: Constants.expoConfig?.version,
        href: '/settings/about',
      },
    ],
  ];

  return (
    <TabScreen testID='settings-screen' title={t('settings.title')}>
      {sections.map((entries) => (
        <ListSection key={entries[0]?.key}>
          {entries.map((entry) => (
            <ListRow
              key={entry.key}
              testID={`settings-${entry.key}`}
              icon={entry.icon}
              title={entry.title}
              value={entry.value}
              accessory='chevron'
              onPress={() => router.push(entry.href)}
            />
          ))}
        </ListSection>
      ))}
    </TabScreen>
  );
}
