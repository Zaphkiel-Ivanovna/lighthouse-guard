import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/shared/ui';

import type { Lighthouse } from '../types';

type Props = {
  readonly lighthouse: Lighthouse;
  readonly isConflicting: boolean;
};

export function ChannelLabel({ lighthouse, isConflicting }: Props) {
  const { t } = useTranslation();
  if (lighthouse.channel === null) return null;

  return (
    <Text
      variant='caption'
      tabular
      testID={`channel-label-${lighthouse.id}`}
      style={styles.label(isConflicting)}
      accessibilityLabel={t(isConflicting ? 'lighthouses.card.channelConflictA11y' : 'lighthouses.card.channelA11y', {
        channel: lighthouse.channel,
      })}
    >
      {t('lighthouses.card.channel', { channel: lighthouse.channel })}
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  label: (isConflicting: boolean) => ({
    fontWeight: '600',
    color: isConflicting ? theme.lighthouseStateText.booting : theme.colors.textMuted,
  }),
}));
