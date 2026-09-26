import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Banner, EmptyState, Text } from '@/shared/ui';

import { BleErrorBanner } from '../components/BleErrorBanner';
import { LighthouseCard } from '../components/LighthouseCard';
import { ScanButton } from '../components/ScanButton';
import { useIsMockMode, useLighthouseList, useScanStatus } from '../hooks/useLighthouses';
import { startScan } from '../services/lighthouse-controller';
import { useLighthousesStore } from '../store/lighthouses.store';

const EMPTY_ICON = { ios: 'light.beacon.max', android: 'cell_tower' } as const;

export function LighthouseListScreen() {
  const { t } = useTranslation();
  const lighthouses = useLighthouseList();
  const scan = useScanStatus();
  const isMockMode = useIsMockMode();

  useEffect(() => {
    const { devices, scan: current } = useLighthousesStore.getState();
    if (Object.keys(devices).length === 0 && current.status === 'idle') void startScan();
  }, []);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t('lighthouses.list.title') }} />
      <FlashList
        testID='lighthouse-list'
        data={lighthouses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LighthouseCard lighthouse={item} />}
        ItemSeparatorComponent={Separator}
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            {isMockMode && <Banner testID='mock-banner' message={t('lighthouses.list.mockBanner')} />}
            <BleErrorBanner testID='scan-error' code={scan.error} />
            <View style={styles.toolbar}>
              <Text tone='muted' variant='callout'>
                {scan.status === 'scanning' ? t('lighthouses.list.scanning') : ''}
              </Text>
              <ScanButton />
            </View>
          </View>
        }
        ListEmptyComponent={
          scan.status === 'idle' ? (
            <EmptyState
              testID='lighthouse-empty'
              icon={EMPTY_ICON}
              title={t('lighthouses.list.emptyTitle')}
              body={t('lighthouses.list.emptyBody')}
            />
          ) : null
        }
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.space(4),
    paddingBottom: rt.insets.bottom + theme.space(6),
  },
  header: {
    gap: theme.space(3),
    paddingTop: theme.space(2),
    paddingBottom: theme.space(4),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  separator: {
    height: theme.space(3),
  },
}));
