import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, ListRow, ListSection, Text, TextField } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { GroupMemberRow } from '../components/GroupMemberRow';
import { useGroup } from '../hooks/useGroups';
import { useLighthouseList } from '../hooks/useLighthouses';
import { useShownLighthouses } from '../hooks/useVisibleLighthouses';
import {
  createGroup,
  deleteGroup,
  isValidGroupName,
  MAX_GROUP_NAME_LENGTH,
  selectGroup,
  updateGroup,
} from '../store/groups.store';
import type { GroupMember } from '../types';

const DELETE_ICON = { ios: 'trash.fill', android: 'delete' } as const;

type Params = {
  readonly id?: string;
  readonly members?: string;
  readonly activate?: string;
};

export function GroupEditorScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<Params>();
  const liveGroup = useGroup(params.id);
  const [group] = useState(liveGroup);
  const lighthouses = useShownLighthouses();
  const reachable = useLighthouseList();
  const [name, setName] = useState(group?.name ?? '');
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(group ? group.members.map((member) => member.id) : (params.members?.split(',') ?? [])),
  );
  const [error, setError] = useState<string | null>(null);

  const inRange = new Map(reachable.map((lighthouse) => [lighthouse.id, lighthouse]));
  const shownIds = new Set(lighthouses.map((lighthouse) => lighthouse.id));
  const candidates: GroupMember[] = [
    ...lighthouses.map(({ id, name: factoryName }) => ({ id, name: factoryName })),
    ...(group?.members.filter((member) => !shownIds.has(member.id)) ?? []),
  ];

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setError(null);
  };

  const save = () => {
    if (!isValidGroupName(name)) {
      haptics.error();
      setError(t('lighthouses.groups.editor.nameRequired'));
      return;
    }
    const members = candidates.filter((candidate) => selected.has(candidate.id));
    haptics.success();
    if (group) {
      updateGroup(group.id, name, members);
      router.back();
      return;
    }
    const createdId = createGroup(name, members);
    if (createdId && params.activate === '1') {
      selectGroup(createdId);
      router.dismiss(2);
      return;
    }
    router.back();
  };

  const confirmDelete = () => {
    if (!group) return;
    Alert.alert(
      t('lighthouses.groups.editor.deleteConfirmTitle', { name: group.name }),
      t('lighthouses.groups.editor.deleteConfirmBody'),
      [
        { text: t('common.actions.cancel'), style: 'cancel' },
        {
          text: t('lighthouses.groups.editor.delete'),
          style: 'destructive',
          onPress: () => {
            deleteGroup(group.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.sheet}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps='handled'
      testID='group-editor'
    >
      <View style={styles.toolbar}>
        <Button
          testID='group-cancel'
          variant='ghost'
          label={t('common.actions.cancel')}
          onPress={() => router.back()}
        />
        <Button
          testID='group-save'
          label={group ? t('common.actions.save') : t('lighthouses.groups.editor.create')}
          onPress={save}
        />
      </View>

      <Text variant='title' accessibilityRole='header'>
        {group ? t('lighthouses.groups.editor.editTitle') : t('lighthouses.groups.editor.newTitle')}
      </Text>

      <TextField
        testID='group-name-input'
        accessibilityLabel={t('lighthouses.groups.editor.nameLabel')}
        value={name}
        onChangeText={handleNameChange}
        placeholder={t('lighthouses.groups.editor.namePlaceholder')}
        error={error}
        autoFocus={!group}
        returnKeyType='done'
        maxLength={MAX_GROUP_NAME_LENGTH}
      />

      {candidates.length > 0 ? (
        <ListSection title={t('lighthouses.groups.editor.members')}>
          {candidates.map((member) => (
            <GroupMemberRow
              key={member.id}
              member={member}
              lighthouse={inRange.get(member.id)}
              selected={selected.has(member.id)}
              onToggle={() => toggle(member.id)}
            />
          ))}
        </ListSection>
      ) : (
        <Text tone='muted' style={styles.hint}>
          {t('lighthouses.groups.editor.noStations')}
        </Text>
      )}

      {group && (
        <ListSection>
          <ListRow
            testID='group-delete'
            icon={DELETE_ICON}
            title={t('lighthouses.groups.editor.delete')}
            destructive
            onPress={confirmDelete}
          />
        </ListSection>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  sheet: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.space(5),
    padding: theme.space(5),
    paddingBottom: rt.insets.bottom + theme.space(6),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: -theme.space(3),
  },
  hint: {
    paddingHorizontal: theme.space(1),
  },
}));
