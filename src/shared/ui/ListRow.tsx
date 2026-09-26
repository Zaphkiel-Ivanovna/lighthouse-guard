import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { haptics } from '@/shared/utils/haptics';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

const CHEVRON: IconName = { ios: 'chevron.right', android: 'chevron_right' };
const CHECKMARK: IconName = { ios: 'checkmark', android: 'check' };

type Props = {
  readonly title: string;
  readonly subtitle?: string;
  readonly value?: string;
  readonly icon?: IconName;
  /** `chevron` for navigation, `check` for the selected option, or a custom node (e.g. a Switch). */
  readonly accessory?: 'chevron' | 'check' | ReactNode;
  readonly destructive?: boolean;
  readonly onPress?: () => void;
  readonly selected?: boolean;
  readonly testID?: string;
};

export function ListRow({
  title,
  subtitle,
  value,
  icon,
  accessory,
  destructive = false,
  onPress,
  selected,
  testID,
}: Props) {
  const content = (
    <>
      {icon && <Icon name={icon} tone={destructive ? 'danger' : 'accent'} />}
      <View style={styles.texts}>
        <Text tone={destructive ? 'danger' : 'primary'}>{title}</Text>
        {subtitle && (
          <Text variant='caption' tone='muted'>
            {subtitle}
          </Text>
        )}
      </View>
      {value && <Text tone='muted'>{value}</Text>}
      {accessory === 'chevron' ? (
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
      accessibilityRole='button'
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
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
  texts: {
    flex: 1,
    gap: theme.space(0.5),
  },
}));
