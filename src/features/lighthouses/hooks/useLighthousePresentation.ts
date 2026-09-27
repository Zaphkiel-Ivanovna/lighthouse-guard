import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUnistyles } from 'react-native-unistyles';

import { usePreference } from '@/core/preferences';
import { haptics } from '@/shared/utils/haptics';

import { signalLevel } from '../components/SignalStrength';
import type { Lighthouse } from '../types';
import { useDisplayName } from './useLighthouses';
import { useIsChannelShared } from './useVisibleLighthouses';

export function useLighthousePresentation(lighthouse: Lighthouse) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const name = useDisplayName(lighthouse);
  const stateLabel = t(`lighthouses.state.${lighthouse.state}`);
  const showChannel = usePreference('showChannelOnCards');
  const showSignal = usePreference('showSignalOnCards');
  const isConflicting = useIsChannelShared(lighthouse);
  const channelLabel =
    showChannel && lighthouse.channel !== null
      ? t(isConflicting ? 'lighthouses.card.channelConflictA11y' : 'lighthouses.card.channelA11y', {
          channel: lighthouse.channel,
        })
      : null;
  const signalLabel = showSignal ? t(`lighthouses.signal.${signalLevel(lighthouse.rssi)}`) : null;

  return {
    name,
    subtitle: name !== lighthouse.name ? lighthouse.name : t('lighthouses.card.model'),
    stateLabel,
    stateTextColor: theme.lighthouseStateText[lighthouse.state],
    isConflicting,
    a11yLabel: [t('lighthouses.card.a11yLabel', { name, state: stateLabel }), channelLabel, signalLabel]
      .filter(Boolean)
      .join(', '),
    openDetail: () => {
      haptics.selection();
      router.push({ pathname: '/lighthouse/[id]', params: { id: lighthouse.id } });
    },
  };
}
