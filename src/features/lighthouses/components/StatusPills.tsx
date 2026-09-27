import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PulseRings, Text } from '@/shared/ui';
import { transitions } from '@/theme';

const DOT = 8;

type Props = {
  readonly isScanning: boolean;
  readonly foundCount: number;
};

export function StatusPills({ isScanning, foundCount }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  if (!isScanning) return null;

  return (
    <Animated.View style={styles.row} layout={transitions.layout()}>
      <Animated.View style={styles.pill} entering={transitions.crossfadeIn()} testID='scan-status'>
        <View style={styles.dotBox}>
          <PulseRings size={DOT * 2.5} color={theme.colors.accent} rings={2} periodMs={1400} />
          <View style={styles.dot} />
        </View>
        <Text variant='callout'>{t('lighthouses.list.searching')}</Text>
        {foundCount > 0 && (
          <Text variant='callout' tone='muted' tabular>
            {t('lighthouses.list.found', { count: foundCount })}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space(2),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    minHeight: 36,
    paddingHorizontal: theme.space(3.5),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    boxShadow: `0 4px 14px ${theme.colors.shadow}`,
  },
  dotBox: {
    width: DOT * 2.5,
    height: DOT * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: theme.colors.accent,
  },
}));
