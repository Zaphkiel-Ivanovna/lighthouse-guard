import { useTranslation } from 'react-i18next';

import { Banner } from '@/shared/ui';

import { useChannelConflicts } from '../hooks/useVisibleLighthouses';
import { useDeviceNamesStore } from '../store/device-names.store';

export function ChannelConflictBanner() {
  const { t } = useTranslation();
  const conflicts = useChannelConflicts();
  const names = useDeviceNamesStore((s) => s.names);

  return conflicts.map(({ channel, lighthouses }) => (
    <Banner
      key={channel}
      testID={`channel-conflict-${channel}`}
      tone='warning'
      message={t('lighthouses.list.channelConflict', {
        channel,
        names: lighthouses.map((lighthouse) => names[lighthouse.id] ?? lighthouse.name).join(', '),
      })}
    />
  ));
}
