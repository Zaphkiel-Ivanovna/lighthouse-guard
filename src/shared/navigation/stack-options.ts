import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

export const tabStackOptions = {
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  headerTransparent: Platform.OS === 'ios',
} satisfies StackScreenOptions;

export const tabRootOptions = { headerShown: false } satisfies StackScreenOptions;
