import type { ReactElement, ReactNode } from 'react';
import { View, type RefreshControlProps } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { GradientLayer } from './GradientLayer';
import { Text } from './Text';

type Props = {
  readonly title: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly refreshControl?: ReactElement<RefreshControlProps>;
  readonly testID?: string;
};

const COMPACT_FADE_RANGE = [28, 52];

export function TabScreen({ title, action, children, refreshControl, testID }: Props) {
  const { theme } = useUnistyles();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.get(), COMPACT_FADE_RANGE, [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.root}>
      <GradientLayer image={theme.gradients.sky} />
      <Animated.ScrollView
        ref={scrollRef}
        testID={testID}
        contentInsetAdjustmentBehavior='never'
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps='handled'
        refreshControl={refreshControl}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text variant='title' accessibilityRole='header' numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {action}
        </View>
        {children}
      </Animated.ScrollView>

      <Animated.View pointerEvents='none' style={[styles.compactBar, compactStyle]}>
        <Text variant='callout' numberOfLines={1} style={styles.compactTitle}>
          {title}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    paddingTop: rt.insets.top,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.space(4),
    paddingHorizontal: theme.space(4),
    paddingBottom: rt.insets.bottom + theme.space(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space(3),
    minHeight: 56,
    paddingTop: theme.space(2),
  },
  title: {
    flex: 1,
  },
  compactBar: {
    position: 'absolute',
    top: rt.insets.top,
    left: 0,
    right: 0,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  compactTitle: {
    fontWeight: '600',
  },
}));
