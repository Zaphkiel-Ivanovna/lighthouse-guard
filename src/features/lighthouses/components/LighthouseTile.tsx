import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { usePreference } from '@/core/preferences';
import { PressableScale, Text } from '@/shared/ui';
import { breakpoints, transitions } from '@/theme';

import { useLighthousePresentation } from '../hooks/useLighthousePresentation';
import type { Lighthouse } from '../types';
import { ChannelLabel } from './ChannelLabel';
import { LighthouseIcon } from './LighthouseIcon';
import { PowerToggle } from './PowerToggle';
import { SignalStrength } from './SignalStrength';

type Props = {
  readonly lighthouse: Lighthouse;
};

export function LighthouseTile({ lighthouse }: Props) {
  const { name, stateLabel, stateTextColor, isConflicting, a11yLabel, openDetail } =
    useLighthousePresentation(lighthouse);
  const showChannel = usePreference('showChannelOnCards');
  const showSignal = usePreference('showSignalOnCards');
  const isSingleWord = !/\s/.test(name.trim());

  return (
    <View style={styles.container}>
      <PressableScale
        testID={`lighthouse-card-${lighthouse.id}`}
        onPress={openDetail}
        scaleTo={0.97}
        accessibilityRole='button'
        accessibilityLabel={a11yLabel}
        containerStyle={styles.container}
        style={styles.tile}
      >
        <View style={styles.top}>
          <LighthouseIcon state={lighthouse.state} size={48} />
        </View>
        {isSingleWord ? (
          <Text variant='headline' numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {name}
          </Text>
        ) : (
          <Text variant='headline' numberOfLines={2}>
            {name}
          </Text>
        )}
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
      </PressableScale>
      <View style={styles.toggle}>
        <PowerToggle lighthouse={lighthouse} size='sm' />
      </View>
    </View>
  );
}

function columnsFor(width: number): number {
  if (width >= breakpoints.lg) return 4;
  if (width >= breakpoints.md) return 3;
  return 2;
}

function tileWidth(width: number, pagePadding: number, gutter: number): number {
  const columns = columnsFor(width);
  return (width - pagePadding - gutter * (columns - 1)) / columns;
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flexGrow: 1,
  },
  tile: {
    flexGrow: 1,
    width: tileWidth(rt.screen.width, theme.space(8), theme.space(3)),
    gap: theme.space(2),
    padding: theme.space(4),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    boxShadow: `0 6px 20px ${theme.colors.shadow}`,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.space(2),
  },
  statusRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: theme.space(2),
    rowGap: theme.space(1),
  },
  toggle: {
    position: 'absolute',
    top: theme.space(4),
    right: theme.space(4),
  },
  status: (color: string) => ({
    color,
    fontWeight: '600',
  }),
}));
