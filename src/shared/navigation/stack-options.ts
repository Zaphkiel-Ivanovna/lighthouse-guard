import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

/** Shared header for every tab stack: iOS large titles over a transparent (liquid glass) header. */
export const largeTitleStackOptions = {
  headerLargeTitle: true,
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerTransparent: Platform.OS === 'ios',
} satisfies StackScreenOptions;
