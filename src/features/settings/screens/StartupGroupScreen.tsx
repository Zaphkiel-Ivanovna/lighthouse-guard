import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { setStartupGroup, useGroups, useStartupGroup } from '@/features/lighthouses';
import { ListRow, ListSection, Screen } from '@/shared/ui';

export function StartupGroupScreen() {
  const { t } = useTranslation();
  const groups = useGroups();
  const startupGroup = useStartupGroup();

  return (
    <Screen testID='startup-group-screen'>
      <Stack.Screen options={{ title: t('settings.groups.title') }} />
      <ListSection
        title={t('settings.groups.startup')}
        footer={groups.length === 0 ? t('settings.groups.noGroups') : t('settings.groups.startupHint')}
      >
        <ListRow
          testID='startup-group-all'
          title={t('lighthouses.groups.all')}
          accessory='check'
          selected={startupGroup === null}
          onPress={() => setStartupGroup(null)}
        />
        {groups.map((group, index) => (
          <ListRow
            key={group.id}
            testID={`startup-group-${index}`}
            title={group.name}
            accessory='check'
            selected={startupGroup?.id === group.id}
            onPress={() => setStartupGroup(group.id)}
          />
        ))}
      </ListSection>
    </Screen>
  );
}
