import { useEffect } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { haptics } from '@/shared/utils/haptics';
import { spring, subtleGradient, timing } from '@/theme';

import { GradientLayer } from './GradientLayer';
import { Text } from './Text';

export type SegmentOption<T extends string> = {
  readonly value: T;
  readonly label: string;
  readonly testID?: string;
};

type Props<T extends string> = {
  readonly options: readonly SegmentOption<T>[];
  readonly value: T | null;
  readonly onChange: (value: T) => void;
  readonly accessibilityLabel: string;
  readonly tone?: 'neutral' | 'accent';
  readonly disabled?: boolean;
};

const INSET = 3;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  tone = 'neutral',
  disabled = false,
}: Props<T>) {
  styles.useVariants({ tone, disabled });
  const { theme } = useUnistyles();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const segmentWidth = useSharedValue(0);
  const offset = useSharedValue(Math.max(selectedIndex, 0));
  const visibility = useSharedValue(selectedIndex >= 0 ? 1 : 0);

  useEffect(() => {
    if (selectedIndex >= 0) offset.set(withSpring(selectedIndex, spring.smooth));
    visibility.set(withTiming(selectedIndex >= 0 ? 1 : 0, timing.fast));
  }, [offset, selectedIndex, visibility]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth.get(),
    opacity: visibility.get(),
    transform: [{ translateX: offset.get() * segmentWidth.get() }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    segmentWidth.set((event.nativeEvent.layout.width - INSET * 2) / options.length);
  };

  return (
    <View
      style={styles.track}
      onLayout={handleLayout}
      accessibilityRole='radiogroup'
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        {tone === 'accent' && <GradientLayer image={subtleGradient(theme.colors.accent)} />}
      </Animated.View>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            testID={option.testID}
            style={styles.segment}
            disabled={disabled}
            onPress={() => {
              if (isSelected) return;
              haptics.selection();
              onChange(option.value);
            }}
            accessibilityRole='radio'
            accessibilityLabel={option.label}
            accessibilityState={{ checked: isSelected, selected: isSelected, disabled }}
          >
            <Text
              variant='callout'
              tone={isSelected && tone === 'accent' ? 'onAccent' : 'primary'}
              style={isSelected ? styles.selectedLabel : undefined}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: 'row',
    padding: INSET,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.surfaceMuted,
    variants: {
      disabled: {
        true: { opacity: 0.5 },
        false: {},
      },
      tone: {
        neutral: {},
        accent: {},
      },
    },
  },
  indicator: {
    position: 'absolute',
    top: INSET,
    bottom: INSET,
    left: INSET,
    borderRadius: theme.radius.md - INSET,
    borderCurve: 'continuous',
    overflow: 'hidden',
    variants: {
      tone: {
        neutral: {
          backgroundColor: theme.colors.surfaceRaised,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          boxShadow: `0 1px 3px ${theme.colors.shadow}`,
        },
        accent: { backgroundColor: theme.colors.accent },
      },
      disabled: {
        true: {},
        false: {},
      },
    },
  },
  selectedLabel: {
    fontWeight: '600',
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space(2),
  },
}));
