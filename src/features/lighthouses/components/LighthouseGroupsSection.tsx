import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListRow, ListSection } from '@/shared/ui';

import { useGroups } from '../hooks/useGroups';
import { toggleGroupMember } from '../store/groups.store';
import type { Lighthouse } from '../types';
import { GROUP_ICON, NEW_GROUP_ICON } from '../utils/group-visuals';

type Props = {
  readonly lighthouse: Lighthouse;
};

export function LighthouseGroupsSection({ lighthouse }: Props) {
  const { t } = useTranslation();
  const groups = useGroups();
  const member = { id: lighthouse.id, name: lighthouse.name };

  return (
    <ListSection
      title={t('lighthouses.detail.groups')}
      footer={groups.length === 0 ? t('lighthouses.detail.groupsHint') : undefined}
    >
      {groups.map((group, index) => {
        const isMember = group.members.some((current) => current.id === lighthouse.id);
        return (
          <ListRow
            key={group.id}
            testID={`detail-group-${index}`}
            icon={GROUP_ICON}
            title={group.name}
            checked={isMember}
            onPress={() => toggleGroupMember(group.id, member)}
          />
        );
      })}
      <ListRow
        testID='detail-group-new'
        icon={NEW_GROUP_ICON}
        title={t('lighthouses.groups.new')}
        accessory='chevron'
        onPress={() => router.push({ pathname: '/groups/edit', params: { members: lighthouse.id } })}
      />
    </ListSection>
  );
}
