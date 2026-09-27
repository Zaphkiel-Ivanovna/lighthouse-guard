import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ListRow, ListSection } from '@/shared/ui';

import { SignalStrength } from './SignalStrength';
import { useLighthouseDetails } from '../hooks/useLighthouses';
import { useChannelConflicts } from '../hooks/useVisibleLighthouses';
import { loadDetails } from '../services/lighthouse-controller';
import { useDeviceNamesStore } from '../store/device-names.store';
import type { Lighthouse } from '../types';
import { formatFirmware } from '../utils/firmware';

const RETRY_ICON = { ios: 'arrow.clockwise', android: 'refresh' } as const;
const DEVICE_FIELDS = ['firmware', 'hardware', 'model', 'serial', 'manufacturer'] as const;
const LONG_VALUE = 20;

type Props = {
  readonly lighthouse: Lighthouse;
};

export function LighthouseInfoSection({ lighthouse }: Props) {
  const { t } = useTranslation();
  const details = useLighthouseDetails(lighthouse.id);
  const isLoading = !details || details.status === 'loading';
  const hasFailed = details?.status === 'error';
  const data = details?.data ?? null;
  const conflicts = useChannelConflicts();
  const names = useDeviceNamesStore((s) => s.names);

  useEffect(() => {
    void loadDetails(lighthouse.id);
  }, [lighthouse.id]);

  const footer = isLoading
    ? t('lighthouses.detail.readingDetails')
    : hasFailed
      ? t('lighthouses.detail.detailsError')
      : undefined;
  const channel = lighthouse.channel ?? data?.channel;
  const sharedWith = conflicts
    .find((conflict) => conflict.channel === channel)
    ?.lighthouses.filter((other) => other.id !== lighthouse.id)
    .map((other) => names[other.id] ?? other.name);

  return (
    <ListSection title={t('lighthouses.detail.info')} footer={footer}>
      <ListRow title={t('lighthouses.detail.identifier')} value={lighthouse.name} />
      <ListRow
        testID='detail-channel'
        title={t('lighthouses.detail.channel')}
        value={channel ? String(channel) : isLoading ? undefined : t('lighthouses.detail.unavailable')}
        subtitle={
          sharedWith?.length ? t('lighthouses.detail.channelShared', { names: sharedWith.join(', ') }) : undefined
        }
        loading={isLoading && !channel}
      />
      {DEVICE_FIELDS.map((field) => {
        const raw = data?.[field];
        if (!raw) return null;
        const value = field === 'firmware' ? formatFirmware(raw) : raw;
        const isLong = value.length > LONG_VALUE;
        return (
          <ListRow
            key={field}
            testID={`detail-${field}`}
            title={t(`lighthouses.detail.${field}`)}
            value={isLong ? undefined : value}
            subtitle={isLong ? value : undefined}
          />
        );
      })}
      <ListRow
        title={t('lighthouses.detail.signal')}
        value={t('lighthouses.detail.signalValue', { rssi: lighthouse.rssi })}
        accessory={<SignalStrength rssi={lighthouse.rssi} />}
      />
      <ListRow title={t('lighthouses.detail.bluetoothId')} subtitle={lighthouse.id} />
      {hasFailed && (
        <ListRow
          testID='detail-read-again'
          icon={RETRY_ICON}
          title={t('lighthouses.detail.readAgain')}
          onPress={() => void loadDetails(lighthouse.id, { force: true })}
        />
      )}
    </ListSection>
  );
}
