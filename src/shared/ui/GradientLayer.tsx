import type { ComponentProps } from 'react';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { transitions } from '@/theme';

type Props = {
  readonly image: string;
  readonly style?: ComponentProps<typeof Animated.View>['style'];
  readonly fadeIn?: boolean;
};

export function GradientLayer({ image, style, fadeIn = false }: Props) {
  return (
    <Animated.View
      pointerEvents='none'
      style={[styles.layer(image), style]}
      entering={fadeIn ? transitions.crossfadeIn() : undefined}
    />
  );
}

const styles = StyleSheet.create({
  layer: (image: string) => ({
    ...StyleSheet.absoluteFillObject,
    backgroundImage: image,
  }),
});
