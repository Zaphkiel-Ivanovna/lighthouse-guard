import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useAnimatedTheme } from 'react-native-unistyles/reanimated';

import { usePreference } from '@/core/preferences';
import { GradientLayer, Icon, Orbit, PressableScale } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';
import { subtleGradient, timing } from '@/theme';

import { useCommandStatus, useDisplayName } from '../hooks/useLighthouses';
import { setPower } from '../services/lighthouse-controller';
import type { Lighthouse } from '../types';
import { toggleCommandFor } from '../utils/power';

const POWER_ICON = { ios: 'power', android: 'power_settings_new' } as const;
const SIZES = { md: 48, sm: 40 } as const;

type Props = {
  readonly lighthouse: Lighthouse;
  readonly size?: keyof typeof SIZES;
};

export function PowerToggle({ lighthouse, size = 'md' }: Props) {
  const dimension = SIZES[size];
  const iconSize = size === 'md' ? 22 : 19;
  const { t } = useTranslation();
  const { theme: staticTheme } = useUnistyles();
  const theme = useAnimatedTheme();
  const name = useDisplayName(lighthouse);
  const { status } = useCommandStatus(lighthouse.id);
  const offMode = usePreference('offMode');
  const command = toggleCommandFor(lighthouse.state, offMode);
  const isPending = status === 'pending';
  const isOn = lighthouse.state === 'on' || lighthouse.state === 'booting';

  const progress = useSharedValue(isOn ? 1 : 0);
  useEffect(() => {
    progress.set(withTiming(isOn ? 1 : 0, timing.base));
  }, [isOn, progress]);

  const previousStatus = useRef(status);
  useEffect(() => {
    if (previousStatus.current === 'pending' && status === 'idle') haptics.success();
    if (previousStatus.current === 'pending' && status === 'error') haptics.error();
    previousStatus.current = status;
  }, [status]);

  const fillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.get(),
      [0, 1],
      [theme.get().colors.surfaceMuted, theme.get().lighthouseState.on],
    ),
  }));

  const onIconStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const offIconStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.get() }));

  const handlePress = () => {
    haptics.impact();
    void setPower(lighthouse.id, command);
  };

  return (
    <PressableScale
      testID={`power-toggle-${lighthouse.id}`}
      onPress={handlePress}
      disabled={isPending}
      scaleTo={0.9}
      hitSlop={8}
      accessibilityRole='switch'
      accessibilityLabel={t('lighthouses.card.togglePower', { name })}
      accessibilityState={{ checked: isOn, busy: isPending, disabled: isPending }}
      style={styles.wrapper(dimension)}
    >
      <Animated.View style={[styles.fill(dimension), fillStyle]}>
        <GradientLayer image={subtleGradient(staticTheme.lighthouseState.on)} style={onIconStyle} />
        <Animated.View style={[styles.icon, offIconStyle]}>
          <Icon name={POWER_ICON} size={iconSize} tone='muted' />
        </Animated.View>
        <Animated.View style={[styles.icon, onIconStyle]}>
          <Icon name={POWER_ICON} size={iconSize} tone='onBadge' />
        </Animated.View>
      </Animated.View>
      {isPending && (
        <View style={styles.orbit(dimension)}>
          <Orbit size={dimension + 8} color={staticTheme.lighthouseState.on} thickness={2} periodMs={900} />
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: (size: number) => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  fill: (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  icon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: (size: number) => ({
    position: 'absolute',
    width: size + 8,
    height: size + 8,
    alignItems: 'center',
    justifyContent: 'center',
  }),
});
