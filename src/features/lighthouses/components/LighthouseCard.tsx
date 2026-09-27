import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { usePreference } from '@/core/preferences';
import { Icon, PressableScale, Text } from '@/shared/ui';
import { transitions } from '@/theme';

import { useLighthousePresentation } from '../hooks/useLighthousePresentation';
import type { Lighthouse } from '../types';
import { ChannelLabel } from './ChannelLabel';
import { LighthouseIcon } from './LighthouseIcon';
import { PowerToggle } from './PowerToggle';
import { SignalStrength } from './SignalStrength';

const CHEVRON = { ios: 'chevron.right', android: 'chevron_right' } as const;

type Props = {
  readonly lighthouse: Lighthouse;
};

export function LighthouseCard({ lighthouse }: Props) {
  const { name, subtitle, stateLabel, stateTextColor, isConflicting, a11yLabel, openDetail } =
    useLighthousePresentation(lighthouse);
  const showChannel = usePreference('showChannelOnCards');
  const showSignal = usePreference('showSignalOnCards');

  return (
    <View style={styles.card}>
      <PressableScale
        testID={`lighthouse-card-${lighthouse.id}`}
        onPress={openDetail}
        scaleTo={0.98}
        containerStyle={styles.pressArea}
        accessibilityRole='button'
        accessibilityLabel={a11yLabel}
        style={styles.body}
      >
        <LighthouseIcon state={lighthouse.state} size={56} />
        <View style={styles.texts}>
          <View style={styles.titleRow}>
            <Text variant='headline' numberOfLines={1} style={styles.name}>
              {name}
            </Text>
            <Icon name={CHEVRON} size={12} tone='muted' />
          </View>
          <Text variant='caption' tone='muted' numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={styles.statusRow}>
            <Animated.View
              key={lighthouse.state}
              entering={transitions.crossfadeIn()}
              testID={`lighthouse-state-${lighthouse.id}-${lighthouse.state}`}
            >
              <Text variant='callout' style={styles.status(stateTextColor)}>
                {stateLabel}
              </Text>
            </Animated.View>
            {showChannel && <ChannelLabel lighthouse={lighthouse} isConflicting={isConflicting} />}
            {showSignal && <SignalStrength rssi={lighthouse.rssi} />}
          </View>
        </View>
      </PressableScale>
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
    boxShadow: `0 6px 20px ${theme.colors.shadow}`,
  },
  pressArea: {
    flex: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(4),
    paddingVertical: theme.space(4),
    paddingLeft: theme.space(4),
  },
  texts: {
    flex: 1,
    gap: theme.space(0.5),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(1.5),
  },
  name: {
    flexShrink: 1,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: theme.space(2.5),
    rowGap: theme.space(1),
    marginTop: theme.space(1),
  },
  status: (color: string) => ({
    color,
    fontWeight: '600',
  }),
}));
