import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Icon, IconBadge, PressableScale, Text, type IconName } from '@/shared/ui';

const CHECK_ICON = { ios: 'checkmark', android: 'check' } as const;
const EDIT_ICON = { ios: 'pencil', android: 'edit' } as const;

type Props = {
  readonly name: string;
  readonly count: number;
  readonly icon: IconName;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly onEdit?: () => void;
  readonly testID: string;
};

export function GroupRow({ name, count, icon, selected, onSelect, onEdit, testID }: Props) {
  const { t } = useTranslation();
  const countLabel = t('lighthouses.groups.stations', { count });
  const a11yLabel = t('lighthouses.groups.rowA11y', { name, count });

  return (
    <View style={styles.row}>
      <Pressable
        testID={testID}
        onPress={onSelect}
        accessibilityRole='button'
        accessibilityLabel={a11yLabel}
        accessibilityState={{ selected }}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <IconBadge icon={icon} tint='accent' />
        <View style={styles.texts}>
          <Text numberOfLines={1} style={styles.name(selected)}>
            {name}
          </Text>
          <Text variant='caption' tone='muted' tabular>
            {countLabel}
          </Text>
        </View>
        {selected && <Icon name={CHECK_ICON} size={16} tone='accent' />}
      </Pressable>
      {onEdit && (
        <PressableScale
          testID={`${testID}-edit`}
          onPress={onEdit}
          scaleTo={0.88}
          hitSlop={4}
          accessibilityRole='button'
          accessibilityLabel={t('lighthouses.groups.edit', { name })}
          style={styles.edit}
        >
          <Icon name={EDIT_ICON} size={15} tone='muted' />
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: theme.space(2),
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    minHeight: 56,
    paddingLeft: theme.space(4),
    paddingRight: theme.space(2),
    paddingVertical: theme.space(2.5),
  },
  pressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  texts: {
    flex: 1,
    gap: theme.space(0.5),
  },
  name: (selected: boolean) => ({
    fontWeight: selected ? '600' : '400',
  }),
  edit: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
}));
