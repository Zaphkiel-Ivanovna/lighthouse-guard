import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { PowerState } from '@/core/ble';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { GradientLayer } from '@/shared/ui';
import { subtleGradient, timing, washGradient } from '@/theme';

type Props = {
  readonly state: PowerState;
  readonly size: number;
};

export function LighthouseIcon({ state, size }: Props) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const isFocused = useIsFocused();
  const isDormant = state === 'sleep' || state === 'unknown';
  const ink = isDormant ? theme.colors.textMuted : theme.lighthouseStateText[state];
  const ledColor = theme.lighthouseState[state];
  const tileImage = isDormant ? subtleGradient(theme.colors.surfaceMuted) : washGradient(theme.lighthouseState[state]);
  const glyph = size * 0.56;
  const shouldBreathe = state === 'booting' && !reduceMotion && isFocused;

  const led = useSharedValue(1);
  useEffect(() => {
    if (!shouldBreathe) {
      led.set(1);
      return;
    }
    led.set(withRepeat(withTiming(0.3, timing.breath), -1, true));
    return () => cancelAnimation(led);
  }, [led, shouldBreathe]);
  const ledStyle = useAnimatedStyle(() => ({ opacity: led.get() }));

  return (
    <View style={styles.tile(size)} accessible={false} importantForAccessibility='no-hide-descendants'>
      <GradientLayer image={tileImage} />
      <View style={styles.housing(glyph, ink)}>
        <View style={styles.lens(glyph, ink)} />
        <Animated.View style={[styles.led(glyph, ledColor, !isDormant), ledStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: (size: number) => ({
    width: size,
    height: size,
    borderRadius: size * 0.28,
    borderCurve: 'continuous',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  housing: (size: number, color: string) => ({
    width: size,
    height: size,
    borderRadius: size * 0.26,
    borderCurve: 'continuous',
    borderWidth: Math.max(2, size * 0.085),
    borderColor: color,
    alignItems: 'center',
    justifyContent: 'center',
    gap: size * 0.11,
  }),
  lens: (size: number, color: string) => ({
    width: size * 0.52,
    height: size * 0.19,
    borderRadius: size * 0.1,
    backgroundColor: color,
  }),
  led: (size: number, color: string, isGlowing: boolean) => ({
    width: size * 0.15,
    height: size * 0.15,
    borderRadius: size * 0.075,
    backgroundColor: color,
    boxShadow: isGlowing ? `0 0 ${size * 0.14}px ${color}` : undefined,
  }),
});
