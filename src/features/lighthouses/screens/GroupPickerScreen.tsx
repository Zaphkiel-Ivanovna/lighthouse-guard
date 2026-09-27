import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ListRow, ListSection, Text } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { GroupRow } from '../components/GroupRow';
import { useActiveGroup, useGroups } from '../hooks/useGroups';
import { useShownLighthouses } from '../hooks/useVisibleLighthouses';
import { selectGroup } from '../store/groups.store';
import { ALL_GROUPS_ICON, GROUP_ICON, NEW_GROUP_ICON } from '../utils/group-visuals';

export function GroupPickerScreen() {
  const { t } = useTranslation();
  const groups = useGroups();
  const activeGroup = useActiveGroup();
  const lighthouses = useShownLighthouses();

  const choose = (id: string | null) => {
    haptics.selection();
    selectGroup(id);
    router.back();
  };

  const edit = (id: string) => router.push({ pathname: '/groups/edit', params: { id } });
  const create = () => router.push({ pathname: '/groups/edit', params: { activate: '1' } });

  return (
    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} testID='group-picker'>
      <Text variant='headline' accessibilityRole='header'>
        {t('lighthouses.groups.title')}
      </Text>

      <ListSection footer={groups.length === 0 ? t('lighthouses.groups.emptyHint') : undefined}>
        <GroupRow
          testID='group-option-all'
          name={t('lighthouses.groups.all')}
          count={lighthouses.length}
          icon={ALL_GROUPS_ICON}
          selected={activeGroup === null}
          onSelect={() => choose(null)}
        />
        {groups.map((group, index) => (
          <GroupRow
            key={group.id}
            testID={`group-option-${index}`}
            name={group.name}
            count={group.members.length}
            icon={GROUP_ICON}
            selected={activeGroup?.id === group.id}
            onSelect={() => choose(group.id)}
            onEdit={() => edit(group.id)}
          />
        ))}
      </ListSection>

      <ListSection>
        <ListRow testID='group-new' icon={NEW_GROUP_ICON} title={t('lighthouses.groups.new')} onPress={create} />
      </ListSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  sheet: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.space(4),
    padding: theme.space(5),
    paddingBottom: rt.insets.bottom + theme.space(5),
  },
}));
