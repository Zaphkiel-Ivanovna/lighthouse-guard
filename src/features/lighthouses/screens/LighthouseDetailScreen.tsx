import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { hideLighthouse } from '@/core/preferences';
import { EmptyState, ListRow, ListSection, Screen, Text } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';
import { transitions } from '@/theme';

import { BleErrorBanner } from '../components/BleErrorBanner';
import { LighthouseGroupsSection } from '../components/LighthouseGroupsSection';
import { LighthouseIcon } from '../components/LighthouseIcon';
import { LighthouseInfoSection } from '../components/LighthouseInfoSection';
import { PowerModeSelector } from '../components/PowerModeSelector';
import { useCommandStatus, useDisplayName, useLighthouse } from '../hooks/useLighthouses';
import { identify } from '../services/lighthouse-controller';
import type { Lighthouse } from '../types';

const MISSING_ICON = { ios: 'questionmark.circle', android: 'help' } as const;
const IDENTIFY_ICON = { ios: 'scope', android: 'my_location' } as const;
const RENAME_ICON = { ios: 'pencil', android: 'edit' } as const;
const HIDE_ICON = { ios: 'eye.slash.fill', android: 'visibility_off' } as const;

export function LighthouseDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lighthouse = useLighthouse(id);

  if (!lighthouse) {
    return (
      <Screen>
        <EmptyState icon={MISSING_ICON} title={t('lighthouses.detail.notFound')} />
      </Screen>
    );
  }

  return <LighthouseDetail lighthouse={lighthouse} />;
}

function LighthouseDetail({ lighthouse }: { readonly lighthouse: Lighthouse }) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const name = useDisplayName(lighthouse);
  const command = useCommandStatus(lighthouse.id);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const runIdentify = async () => {
    setIsIdentifying(true);
    await identify(lighthouse.id);
    setIsIdentifying(false);
  };

  const openRename = () => router.push({ pathname: '/lighthouse/[id]/rename', params: { id: lighthouse.id } });

  const confirmHide = () => {
    Alert.alert(t('lighthouses.detail.hideConfirmTitle', { name }), t('lighthouses.detail.hideConfirmBody'), [
      { text: t('common.actions.cancel'), style: 'cancel' },
      {
        text: t('lighthouses.detail.hide'),
        style: 'destructive',
        onPress: () => {
          hideLighthouse(lighthouse.id, lighthouse.name);
          haptics.success();
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen testID='lighthouse-detail' tint={theme.lighthouseState[lighthouse.state]}>
      <Stack.Screen options={{ title: name }} />

      <View style={styles.hero}>
        <LighthouseIcon state={lighthouse.state} size={128} />
        <Animated.View key={lighthouse.state} style={styles.heroTexts} entering={transitions.crossfadeIn()}>
          <Text
            variant='display'
            testID={`detail-state-${lighthouse.state}`}
            accessibilityRole='header'
            style={styles.stateTitle(theme.lighthouseStateText[lighthouse.state])}
          >
            {t(`lighthouses.state.${lighthouse.state}`)}
          </Text>
          <Text tone='muted' style={styles.centered}>
            {t(`lighthouses.detail.description.${lighthouse.state}`)}
          </Text>
        </Animated.View>
      </View>

      <PowerModeSelector lighthouse={lighthouse} />
      <BleErrorBanner testID='command-error' code={command.status === 'error' ? command.error : null} />

      <ListSection title={t('lighthouses.detail.actions')}>
        <ListRow
          testID='identify-button'
          icon={IDENTIFY_ICON}
          title={t('lighthouses.detail.identify')}
          subtitle={t('lighthouses.detail.identifyHint')}
          loading={isIdentifying}
          onPress={() => void runIdentify()}
        />
        <ListRow
          testID='rename-button'
          icon={RENAME_ICON}
          title={t('lighthouses.detail.rename')}
          accessory='chevron'
          onPress={openRename}
        />
        <ListRow
          testID='hide-button'
          icon={HIDE_ICON}
          title={t('lighthouses.detail.hide')}
          subtitle={t('lighthouses.detail.hideHint')}
          onPress={confirmHide}
        />
      </ListSection>

      <LighthouseGroupsSection lighthouse={lighthouse} />

      <LighthouseInfoSection lighthouse={lighthouse} />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  hero: {
    alignItems: 'center',
    gap: theme.space(5),
    paddingTop: theme.space(4),
  },
  stateTitle: (color: string) => ({
    color,
  }),
  heroTexts: {
    alignItems: 'center',
    gap: theme.space(1.5),
  },
  centered: {
    textAlign: 'center',
    maxWidth: 320,
  },
}));
