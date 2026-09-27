import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  readonly size: number;
  readonly color: string;
  readonly delayMs: number;
  readonly periodMs: number;
};

export function PulseRing({ size, color, delayMs, periodMs }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(delayMs, withRepeat(withTiming(1, { duration: periodMs, easing: Easing.out(Easing.quad) }), -1, false)),
    );
    return () => cancelAnimation(progress);
  }, [delayMs, periodMs, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.15, 1], [0, 0.55, 0]),
    transform: [{ scale: interpolate(progress.get(), [0, 1], [0.35, 1]) }],
  }));

  return <Animated.View pointerEvents='none' style={[styles.ring(size, color), animatedStyle]} />;
}

const styles = StyleSheet.create({
  ring: (size: number, color: string) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1.5,
    borderColor: color,
  }),
});
