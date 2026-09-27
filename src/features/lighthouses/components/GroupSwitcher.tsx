import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, PressableScale, Text } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { useActiveGroup } from '../hooks/useGroups';

const SWITCH_ICON = { ios: 'chevron.up.chevron.down', android: 'unfold_more' } as const;

export function GroupSwitcher() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const group = useActiveGroup();
  const name = group?.name ?? t('lighthouses.groups.all');

  return (
    <PressableScale
      testID='group-switcher'
      onPress={() => {
        haptics.selection();
        router.push('/groups');
      }}
      scaleTo={0.96}
      hitSlop={6}
      accessibilityRole='button'
      accessibilityLabel={t('lighthouses.groups.switcherA11y', { name })}
      containerStyle={styles.container}
      style={styles.switcher}
    >
      <Text variant='headline' numberOfLines={1} style={styles.name}>
        {name}
      </Text>
      <Icon name={SWITCH_ICON} size={13} color={theme.hero.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexShrink: 1,
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    minHeight: 36,
    marginLeft: -theme.space(3),
    paddingHorizontal: theme.space(3),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.hero.ghost,
  },
  name: {
    flexShrink: 1,
    color: theme.hero.text,
  },
}));
