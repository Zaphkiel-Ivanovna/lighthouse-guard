import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

import { PulseRing } from './PulseRing';

type Props = {
  readonly size: number;
  readonly color: string;
  readonly rings?: number;
  readonly periodMs?: number;
};

export function PulseRings({ size, color, rings = 3, periodMs = 2200 }: Props) {
  const reduceMotion = useReduceMotion();

  if (reduceMotion) {
    return <Animated.View pointerEvents='none' style={styles.still(size, color)} />;
  }

  return (
    <>
      {Array.from({ length: rings }, (_, index) => (
        <PulseRing key={index} size={size} color={color} delayMs={(periodMs / rings) * index} periodMs={periodMs} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  still: (size: number, color: string) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1.5,
    borderColor: color,
    opacity: 0.35,
  }),
});
