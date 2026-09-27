import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { haptics } from '@/shared/utils/haptics';

import { Icon, type IconName } from './Icon';
import { IconBadge } from './IconBadge';
import { Text } from './Text';

const CHEVRON: IconName = { ios: 'chevron.right', android: 'chevron_right' };
const CHECKMARK: IconName = { ios: 'checkmark', android: 'check' };
const CHECKBOX_ON: IconName = { ios: 'checkmark.circle.fill', android: 'check_circle' };
const CHECKBOX_OFF: IconName = { ios: 'circle', android: 'radio_button_unchecked' };

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.textMuted }));

type Props = {
  readonly title: string;
  readonly subtitle?: string;
  readonly value?: string;
  readonly icon?: IconName;
  readonly leading?: ReactNode;
  readonly accessory?: 'chevron' | 'check' | ReactNode;
  readonly destructive?: boolean;
  readonly onPress?: () => void;
  readonly selected?: boolean;
  readonly checked?: boolean;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly testID?: string;
};

export function ListRow({
  title,
  subtitle,
  value,
  icon,
  leading,
  accessory,
  destructive = false,
  onPress,
  selected,
  checked,
  loading = false,
  disabled = false,
  testID,
}: Props) {
  const content = (
    <>
      {leading ?? (icon && <IconBadge icon={icon} tint={destructive ? 'red' : 'accent'} />)}
      <View style={styles.texts}>
        <Text tone={destructive ? 'danger' : 'primary'}>{title}</Text>
        {subtitle && (
          <Text variant='caption' tone='muted'>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text tone='muted' tabular numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      )}
      {loading ? (
        <Spinner size='small' />
      ) : checked !== undefined ? (
        <Icon name={checked ? CHECKBOX_ON : CHECKBOX_OFF} size={22} tone={checked ? 'accent' : 'muted'} />
      ) : accessory === 'chevron' ? (
        <Icon name={CHEVRON} size={14} tone='muted' />
      ) : accessory === 'check' ? (
        selected && <Icon name={CHECKMARK} size={16} tone='accent' />
      ) : (
        accessory
      )}
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={styles.row}>
        {content}
      </View>
    );
  }

  const handlePress = () => {
    haptics.selection();
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      accessibilityRole={checked === undefined ? 'button' : 'checkbox'}
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      disabled={loading || disabled}
      accessibilityState={{ selected, checked, busy: loading, disabled: loading || disabled }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    minHeight: 48,
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(3),
  },
  pressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.45,
  },
  texts: {
    flex: 1,
    gap: theme.space(0.5),
  },
  value: {
    flexShrink: 1,
    maxWidth: '50%',
  },
}));
