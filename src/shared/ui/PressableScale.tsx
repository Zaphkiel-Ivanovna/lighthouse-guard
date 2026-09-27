import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { spring } from '@/theme';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  readonly children: ReactNode;
  readonly style?: ViewProps['style'];
  readonly containerStyle?: PressableProps['style'];
  readonly scaleTo?: number;
};

export function PressableScale({
  children,
  style,
  containerStyle,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...pressableProps
}: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable
      {...pressableProps}
      style={containerStyle}
      onPressIn={(event) => {
        if (!reduceMotion) scale.set(withSpring(scaleTo, spring.snappy));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, spring.snappy));
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
