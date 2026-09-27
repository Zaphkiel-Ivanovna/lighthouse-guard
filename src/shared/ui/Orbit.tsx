import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { withAlpha } from '@/theme';

type Props = {
  readonly size: number;
  readonly color: string;
  readonly thickness?: number;
  readonly periodMs?: number;
};

export function Orbit({ size, color, thickness = 2, periodMs = 1600 }: Props) {
  const reduceMotion = useReduceMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      rotation.set(0);
      return;
    }
    rotation.set(withRepeat(withTiming(360, { duration: periodMs, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(rotation);
  }, [periodMs, reduceMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <Animated.View
      pointerEvents='none'
      style={[styles.arc(size, thickness, color, withAlpha(color, 0.35)), animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  arc: (size: number, thickness: number, head: string, tail: string) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: thickness,
    borderColor: 'transparent',
    borderTopColor: head,
    borderRightColor: tail,
  }),
});
