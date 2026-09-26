import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = {
  readonly message: string;
  readonly tone?: 'info' | 'danger';
  readonly testID?: string;
};

const ICONS: Record<NonNullable<Props['tone']>, IconName> = {
  info: { ios: 'info.circle.fill', android: 'info' },
  danger: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
};

export function Banner({ message, tone = 'info', testID }: Props) {
  styles.useVariants({ tone });
  return (
    <View testID={testID} style={styles.banner} accessibilityRole='alert'>
      <Icon name={ICONS[tone]} tone={tone === 'danger' ? 'danger' : 'accent'} />
      <Text variant='callout' style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    padding: theme.space(3),
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    variants: {
      tone: {
        info: { borderColor: theme.colors.accent, backgroundColor: theme.colors.surface },
        danger: { borderColor: theme.colors.danger, backgroundColor: theme.colors.surface },
      },
    },
  },
  message: {
    flex: 1,
  },
}));
