import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { PowerCommand, PowerState } from '@/core/ble';
import { getPreference, usePreference, type OffMode } from '@/core/preferences';
import { GradientLayer, Icon, PressableScale, Text, type IconName } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';
import { transitions } from '@/theme';

import { useFleetProgress } from '../hooks/useGroups';
import { useFleetCommand } from '../hooks/useLighthouses';
import { setPowerAll } from '../services/lighthouse-controller';
import type { Lighthouse } from '../types';
import { GroupSwitcher } from './GroupSwitcher';

type FleetAction = {
  readonly command: PowerCommand;
  readonly icon: IconName;
  readonly label: 'allOn' | 'allSleep' | 'allStandby';
  readonly progress: 'turningOn' | 'goingToSleep' | 'goingToStandby';
  readonly tone: 'solid' | 'ghost';
};

const TURN_ON: FleetAction = {
  command: 'on',
  icon: { ios: 'power', android: 'power_settings_new' },
  label: 'allOn',
  progress: 'turningOn',
  tone: 'solid',
};

const TURN_OFF: Record<OffMode, FleetAction> = {
  sleep: {
    command: 'sleep',
    icon: { ios: 'moon.zzz.fill', android: 'bedtime' },
    label: 'allSleep',
    progress: 'goingToSleep',
    tone: 'ghost',
  },
  standby: {
    command: 'standby',
    icon: { ios: 'pause.circle.fill', android: 'pause_circle' },
    label: 'allStandby',
    progress: 'goingToStandby',
    tone: 'ghost',
  },
};

type Props = {
  readonly lighthouses: readonly Lighthouse[];
};

export function FleetControlCard({ lighthouses }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const fleet = useFleetCommand();
  const fleetDone = useFleetProgress();
  const total = lighthouses.length;
  const countIn = (state: PowerState) => lighthouses.filter((lighthouse) => lighthouse.state === state).length;
  const onCount = countIn('on');
  const isBusy = fleet.status === 'pending';
  const offMode = usePreference('offMode');
  const actions = [TURN_ON, TURN_OFF[offMode]];

  const run = (action: FleetAction) => {
    const go = () => {
      haptics.impact();
      void setPowerAll(
        action.command,
        lighthouses.map((lighthouse) => lighthouse.id),
      );
    };
    const running = lighthouses.filter((lighthouse) => lighthouse.state === 'on' || lighthouse.state === 'booting');
    if (action.command === 'on' || !getPreference('confirmTurnOffAll') || running.length === 0) {
      go();
      return;
    }
    Alert.alert(t('lighthouses.fleet.confirmTitle', { count: running.length }), t('lighthouses.fleet.confirmBody'), [
      { text: t('common.actions.cancel'), style: 'cancel' },
      { text: t(`lighthouses.fleet.${action.label}`), style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Animated.View style={styles.card} entering={transitions.crossfadeIn()} layout={transitions.layout()}>
      <GradientLayer image={theme.gradients.hero} />

      <View style={styles.header}>
        <GroupSwitcher />
        <Text
          variant='callout'
          tabular
          style={styles.status}
          accessibilityLabel={t('lighthouses.fleet.a11y', { count: onCount, total })}
          testID='fleet-status'
        >
          {t('lighthouses.fleet.status', { on: onCount, total })}
        </Text>
      </View>

      <View style={styles.actions}>
        {actions.map((action) => {
          const isRunning = isBusy && fleet.command === action.command;
          const isDone = countIn(action.command) === total;
          const label = isRunning
            ? t(`lighthouses.fleet.${action.progress}`, { done: fleetDone, total: fleet.scopeIds.length })
            : t(`lighthouses.fleet.${action.label}`);
          const contentColor = action.tone === 'solid' ? theme.hero.onAction : theme.hero.text;

          return (
            <PressableScale
              key={action.command}
              testID={`fleet-${action.command}`}
              onPress={() => run(action)}
              disabled={isBusy || isDone}
              containerStyle={styles.actionArea}
              accessibilityRole='button'
              accessibilityLabel={label}
              accessibilityState={{ disabled: isBusy || isDone, busy: isRunning }}
              style={styles.action(action.tone, isDone && !isRunning)}
            >
              {isRunning ? (
                <ActivityIndicator size='small' color={contentColor} />
              ) : (
                <Icon name={action.icon} size={17} color={contentColor} />
              )}
              <Text
                variant='callout'
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                tabular
                style={styles.actionLabel(contentColor)}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space(4),
    padding: theme.space(5),
    borderRadius: theme.radius.lg + 4,
    borderCurve: 'continuous',
    overflow: 'hidden',
    boxShadow: `0 12px 32px ${theme.colors.shadow}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space(3),
  },
  status: {
    flexShrink: 0,
    color: theme.hero.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.space(2.5),
  },
  actionArea: {
    flex: 1,
  },
  action: (tone: 'solid' | 'ghost', isDone: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(2),
    minHeight: 48,
    paddingHorizontal: theme.space(3),
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: tone === 'solid' ? theme.hero.action : theme.hero.ghost,
    opacity: isDone ? 0.55 : 1,
  }),
  actionLabel: (color: string) => ({
    flexShrink: 1,
    fontWeight: '600',
    color,
  }),
}));
