import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { useDisplayName } from '../hooks/useLighthouses';
import type { Lighthouse } from '../types';
import { PowerToggle } from './PowerToggle';
import { StatusChip } from './StatusChip';

type Props = {
  readonly lighthouse: Lighthouse;
};

export function LighthouseCard({ lighthouse }: Props) {
  const { t } = useTranslation();
  const name = useDisplayName(lighthouse);

  const openDetail = () => {
    haptics.selection();
    router.push({ pathname: '/lighthouse/[id]', params: { id: lighthouse.id } });
  };

  return (
    <View style={styles.card}>
      <View style={styles.accent(lighthouse.state)} />
      <Pressable
        testID={`lighthouse-card-${lighthouse.id}`}
        onPress={openDetail}
        accessibilityRole='button'
        accessibilityLabel={t('lighthouses.card.a11yLabel', {
          name,
          state: t(`lighthouses.state.${lighthouse.state}`),
        })}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <Text variant='headline' numberOfLines={1}>
          {name}
        </Text>
        <StatusChip state={lighthouse.state} testID={`lighthouse-state-${lighthouse.id}-${lighthouse.state}`} />
      </Pressable>
      <PowerToggle lighthouse={lighthouse} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    paddingRight: theme.space(4),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  accent: (state: keyof typeof theme.lighthouseState) => ({
    alignSelf: 'stretch',
    width: 5,
    backgroundColor: theme.lighthouseState[state],
  }),
  body: {
    flex: 1,
    gap: theme.space(2),
    paddingVertical: theme.space(4),
    paddingLeft: theme.space(2),
  },
  pressed: {
    opacity: 0.7,
  },
}));
