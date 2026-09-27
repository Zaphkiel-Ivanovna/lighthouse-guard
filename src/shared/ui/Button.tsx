import { ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles, withUnistyles } from 'react-native-unistyles';

import { haptics } from '@/shared/utils/haptics';
import { subtleGradient } from '@/theme';

import { GradientLayer } from './GradientLayer';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type TextTone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly size?: 'md' | 'lg';
  readonly icon?: IconName;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
};

const CONTENT_TONE: Record<ButtonVariant, TextTone> = {
  primary: 'onAccent',
  secondary: 'primary',
  ghost: 'accent',
  danger: 'onDanger',
};

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.textMuted }));

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: Props) {
  const { theme } = useUnistyles();
  const isDisabled = disabled || loading;
  const fill = variant === 'primary' ? theme.colors.accent : variant === 'danger' ? theme.colors.danger : null;
  styles.useVariants({ variant, size, disabled: isDisabled });
  const tone = CONTENT_TONE[variant];

  const handlePress = () => {
    haptics.impact();
    onPress();
  };

  return (
    <PressableScale
      testID={testID}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={styles.button}
    >
      {fill && <GradientLayer image={subtleGradient(fill)} />}
      {loading ? <Spinner size='small' /> : icon && <Icon name={icon} size={18} tone={tone} />}
      <Text variant='callout' tone={tone}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(2),
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.accent },
        secondary: { backgroundColor: theme.colors.surfaceMuted },
        ghost: { backgroundColor: 'transparent' },
        danger: { backgroundColor: theme.colors.danger },
      },
      size: {
        md: { minHeight: 44, paddingHorizontal: theme.space(4) },
        lg: { minHeight: 52, paddingHorizontal: theme.space(6) },
      },
      disabled: {
        true: { opacity: 0.45 },
        false: {},
      },
    },
  },
}));
