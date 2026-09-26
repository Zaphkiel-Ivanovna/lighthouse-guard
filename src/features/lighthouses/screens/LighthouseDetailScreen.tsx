import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Card, EmptyState, ListRow, ListSection, Screen, Text } from '@/shared/ui';

import { BleErrorBanner } from '../components/BleErrorBanner';
import { PowerModeSelector } from '../components/PowerModeSelector';
import { StatusChip } from '../components/StatusChip';
import { useCommandStatus, useDisplayName, useLighthouse } from '../hooks/useLighthouses';
import { identify } from '../services/lighthouse-controller';
import type { Lighthouse } from '../types';

const MISSING_ICON = { ios: 'questionmark.circle', android: 'help' } as const;
const IDENTIFY_ICON = { ios: 'lightbulb.max', android: 'lightbulb' } as const;
const RENAME_ICON = { ios: 'pencil', android: 'edit' } as const;

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
  const name = useDisplayName(lighthouse);
  const command = useCommandStatus(lighthouse.id);

  const openRename = () => router.push({ pathname: '/lighthouse/[id]/rename', params: { id: lighthouse.id } });

  return (
    <Screen testID='lighthouse-detail'>
      <Stack.Screen options={{ title: name }} />

      <Card>
        <View style={styles.statusRow}>
          <Text variant='label' tone='muted'>
            {t('lighthouses.detail.power')}
          </Text>
          <StatusChip state={lighthouse.state} testID={`detail-state-${lighthouse.state}`} />
        </View>
        <PowerModeSelector lighthouse={lighthouse} />
      </Card>

      <BleErrorBanner testID='command-error' code={command.status === 'error' ? command.error : null} />

      <ListSection title={t('lighthouses.detail.actions')}>
        <ListRow
          testID='identify-button'
          icon={IDENTIFY_ICON}
          title={t('lighthouses.detail.identify')}
          subtitle={t('lighthouses.detail.identifyHint')}
          onPress={() => void identify(lighthouse.id)}
        />
        <ListRow
          testID='rename-button'
          icon={RENAME_ICON}
          title={t('lighthouses.detail.rename')}
          accessory='chevron'
          onPress={openRename}
        />
      </ListSection>

      <ListSection title={t('lighthouses.detail.info')}>
        <ListRow title={t('lighthouses.detail.identifier')} value={lighthouse.name} />
        <ListRow
          title={t('lighthouses.detail.signal')}
          value={t('lighthouses.detail.signalValue', { rssi: lighthouse.rssi })}
        />
      </ListSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
