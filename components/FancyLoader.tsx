import React, { FC, useEffect } from 'react';
import { Stack } from 'tamagui';
import { GetThemeValueForKey } from 'tamagui';
import { Loader2 } from '@tamagui/lucide-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';

interface Props {
  readonly size?: number;
  readonly color?: GetThemeValueForKey<'color'>;
}

export const FancyLoader: FC<Props> = ({ size = 20, color = '$white10' }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Stack width={size * 2} height={size * 2} items='center' justify='center'>
      <Animated.View style={rotateStyle}>
        <Loader2 size={size} color={color} />
      </Animated.View>
    </Stack>
  );
};
