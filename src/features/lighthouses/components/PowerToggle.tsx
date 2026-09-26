import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { Icon } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { useCommandStatus, useDisplayName } from '../hooks/useLighthouses';
import { setPower } from '../services/lighthouse-controller';
import type { Lighthouse } from '../types';
import { toggleCommandFor } from '../utils/power';

const POWER_ICON = { ios: 'power', android: 'power_settings_new' } as const;

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.accent }));

type Props = {
  readonly lighthouse: Lighthouse;
};

/** Round quick toggle: ON ↔ SLEEP. */
export function PowerToggle({ lighthouse }: Props) {
  const { t } = useTranslation();
  const name = useDisplayName(lighthouse);
  const { status } = useCommandStatus(lighthouse.id);
  const command = toggleCommandFor(lighthouse.state);
  const isPending = status === 'pending';
  const isOn = lighthouse.state === 'on';

  styles.useVariants({ on: isOn });

  const handlePress = () => {
    if (!command) return;
    haptics.impact();
    void setPower(lighthouse.id, command);
  };

  return (
    <Pressable
      testID={`power-toggle-${lighthouse.id}`}
      onPress={handlePress}
      disabled={!command || isPending}
      hitSlop={8}
      accessibilityRole='switch'
      accessibilityLabel={t('lighthouses.card.togglePower', { name })}
      accessibilityState={{ checked: isOn, busy: isPending, disabled: !command }}
      style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
    >
      {isPending ? <Spinner /> : <Icon name={POWER_ICON} size={22} tone={isOn ? 'onAccent' : 'muted'} />}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  toggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      on: {
        true: { backgroundColor: theme.colors.accent },
        false: { backgroundColor: theme.colors.surfaceMuted },
      },
    },
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
}));
