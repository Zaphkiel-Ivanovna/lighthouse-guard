import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PulseRings, Text } from '@/shared/ui';
import { transitions } from '@/theme';

import { LighthouseIcon } from './LighthouseIcon';

const RADAR = 176;

export function SearchingState() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Animated.View style={styles.container} entering={transitions.crossfadeIn()} testID='lighthouse-searching'>
      <View style={styles.radar}>
        <PulseRings size={RADAR} color={theme.colors.accent} rings={3} periodMs={2400} />
        <View style={styles.core}>
          <LighthouseIcon state='unknown' size={64} />
        </View>
      </View>
      <Text variant='headline' style={styles.centered}>
        {t('lighthouses.list.searching')}
      </Text>
      <Text tone='muted' style={styles.centered}>
        {t('lighthouses.list.searchingHint')}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    gap: theme.space(3),
    paddingTop: theme.space(8),
    paddingHorizontal: theme.space(6),
  },
  radar: {
    width: RADAR,
    height: RADAR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.space(4),
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
    maxWidth: 300,
  },
}));
