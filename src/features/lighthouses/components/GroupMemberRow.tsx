import { useTranslation } from 'react-i18next';

import { ListRow } from '@/shared/ui';

import { useDisplayName } from '../hooks/useLighthouses';
import type { GroupMember, Lighthouse } from '../types';

type Props = {
  readonly member: GroupMember;
  readonly lighthouse: Lighthouse | undefined;
  readonly selected: boolean;
  readonly onToggle: () => void;
};

export function GroupMemberRow({ member, lighthouse, selected, onToggle }: Props) {
  const { t } = useTranslation();
  const name = useDisplayName(member);

  return (
    <ListRow
      testID={`group-member-${member.id}`}
      title={name}
      subtitle={lighthouse ? t(`lighthouses.state.${lighthouse.state}`) : t('lighthouses.groups.editor.notInRange')}
      checked={selected}
      onPress={onToggle}
    />
  );
}
