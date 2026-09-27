import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { transitions, withAlpha } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = {
  readonly message: string;
  readonly tone?: 'info' | 'warning' | 'danger';
  readonly testID?: string;
};

const ICONS: Record<NonNullable<Props['tone']>, IconName> = {
  info: { ios: 'info.circle.fill', android: 'info' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
  danger: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
};

export function Banner({ message, tone = 'info', testID }: Props) {
  const { theme } = useUnistyles();
  styles.useVariants({ tone });
  return (
    <Animated.View
      testID={testID}
      style={styles.banner}
      accessibilityRole='alert'
      entering={transitions.crossfadeIn()}
      layout={transitions.layout()}
    >
      <Icon
        name={ICONS[tone]}
        tone={tone === 'danger' ? 'danger' : 'accent'}
        color={tone === 'warning' ? theme.lighthouseStateText.booting : undefined}
      />
      <Text variant='callout' style={styles.message}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    paddingVertical: theme.space(3),
    paddingHorizontal: theme.space(4),
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    variants: {
      tone: {
        info: { backgroundColor: withAlpha(theme.colors.accent, 0.12) },
        warning: { backgroundColor: withAlpha(theme.lighthouseState.booting, 0.14) },
        danger: { backgroundColor: withAlpha(theme.colors.danger, 0.12) },
      },
    },
  },
  message: {
    flex: 1,
  },
}));
