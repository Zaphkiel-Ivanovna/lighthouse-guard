import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

export const spring = {
  snappy: { damping: 38, stiffness: 420, mass: 0.85, overshootClamping: true, reduceMotion: ReduceMotion.System },
  smooth: { damping: 30, stiffness: 220, mass: 1, overshootClamping: true, reduceMotion: ReduceMotion.System },
} satisfies Record<string, WithSpringConfig>;

export const easing = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

export const timing = {
  fast: { duration: 160, easing: easing.out, reduceMotion: ReduceMotion.System },
  base: { duration: 260, easing: easing.out, reduceMotion: ReduceMotion.System },
  slow: { duration: 420, easing: easing.inOut, reduceMotion: ReduceMotion.System },
  breath: { duration: 700, easing: easing.inOut, reduceMotion: ReduceMotion.System },
} satisfies Record<string, WithTimingConfig>;

const STAGGER_MS = 55;

export const transitions = {
  enterItem: (index: number) =>
    FadeInDown.delay(Math.min(index, 8) * STAGGER_MS)
      .duration(380)
      .easing(easing.out)
      .reduceMotion(ReduceMotion.System),
  crossfadeIn: () => FadeIn.duration(timing.base.duration).reduceMotion(ReduceMotion.System),
  crossfadeOut: () => FadeOut.duration(timing.fast.duration).reduceMotion(ReduceMotion.System),
  layout: () => LinearTransition.duration(280).easing(easing.out).reduceMotion(ReduceMotion.System),
};
