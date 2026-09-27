import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { getPreference } from '@/core/preferences';
import { Button, EmptyState, Icon, PressableScale, TabScreen, Text } from '@/shared/ui';
import { transitions } from '@/theme';

import { BleErrorBanner } from '../components/BleErrorBanner';
import { ChannelConflictBanner } from '../components/ChannelConflictBanner';
import { FleetControlCard } from '../components/FleetControlCard';
import { LayoutToggle } from '../components/LayoutToggle';
import { LighthouseCard } from '../components/LighthouseCard';
import { LighthouseIcon } from '../components/LighthouseIcon';
import { LighthouseTile } from '../components/LighthouseTile';
import { ScanHeaderButton } from '../components/ScanHeaderButton';
import { SearchingState } from '../components/SearchingState';
import { StatusPills } from '../components/StatusPills';
import { useActiveGroup } from '../hooks/useGroups';
import { useScanStatus } from '../hooks/useLighthouses';
import { useShownLighthouses, useVisibleLighthouses } from '../hooks/useVisibleLighthouses';
import { refreshReachable, startScan } from '../services/lighthouse-controller';
import { useLighthousesStore } from '../store/lighthouses.store';
import { useListLayout } from '../store/list-layout.store';
import { GROUP_ICON } from '../utils/group-visuals';

const SCAN_ICON = { ios: 'antenna.radiowaves.left.and.right', android: 'bluetooth_searching' } as const;

const ThemedRefreshControl = withUnistyles(RefreshControl, (theme) => ({
  tintColor: theme.colors.accent,
  colors: [theme.colors.accent],
  progressBackgroundColor: theme.colors.surface,
}));

export function LighthouseListScreen() {
  const { t } = useTranslation();
  const allLighthouses = useShownLighthouses();
  const lighthouses = useVisibleLighthouses();
  const activeGroup = useActiveGroup();
  const scan = useScanStatus();
  const isScanning = scan.status === 'scanning';
  const layout = useListLayout();

  useEffect(() => {
    const { devices, scan: current } = useLighthousesStore.getState();
    const isFirstLaunch = Object.keys(devices).length === 0 && current.status === 'idle';
    if (isFirstLaunch && getPreference('autoScanOnLaunch')) void startScan();
  }, []);

  useEffect(() => {
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', (state) => {
      const isBackFromBackground = previous === 'background' && state === 'active';
      previous = state;
      if (isBackFromBackground && getPreference('refreshOnForeground')) refreshReachable();
    });
    return () => subscription.remove();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: t('lighthouses.list.title') }} />
      <TabScreen
        testID='lighthouse-list'
        title={t('lighthouses.list.title')}
        action={<ScanHeaderButton />}
        refreshControl={<ThemedRefreshControl refreshing={false} onRefresh={() => void startScan()} />}
      >
        <StatusPills isScanning={isScanning} foundCount={allLighthouses.length} />
        <BleErrorBanner testID='scan-error' code={scan.error} />
        <ChannelConflictBanner />

        {allLighthouses.length > 0 ? (
          <>
            <FleetControlCard lighthouses={lighthouses} />
            {lighthouses.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text variant='headline' accessibilityRole='header'>
                  {t('lighthouses.list.section')}
                </Text>
                <LayoutToggle />
              </View>
            )}
            {activeGroup && lighthouses.length === 0 && (
              <EmptyState
                testID='group-empty'
                icon={GROUP_ICON}
                title={
                  activeGroup.members.length === 0
                    ? t('lighthouses.groups.emptyGroupTitle', { name: activeGroup.name })
                    : t('lighthouses.groups.outOfRangeTitle', { name: activeGroup.name })
                }
                body={
                  activeGroup.members.length === 0
                    ? t('lighthouses.groups.emptyGroupBody')
                    : t('lighthouses.groups.outOfRangeBody')
                }
              >
                <Button
                  testID='group-empty-edit'
                  variant='secondary'
                  label={
                    activeGroup.members.length === 0
                      ? t('lighthouses.groups.addStations')
                      : t('lighthouses.groups.editGroup')
                  }
                  onPress={() => router.push({ pathname: '/groups/edit', params: { id: activeGroup.id } })}
                />
              </EmptyState>
            )}
            <View style={layout === 'grid' ? styles.grid : styles.list}>
              {lighthouses.map((lighthouse, index) => (
                <Animated.View
                  key={`${layout}-${lighthouse.id}`}
                  entering={transitions.enterItem(index)}
                  layout={transitions.layout()}
                >
                  {layout === 'grid' ? (
                    <LighthouseTile lighthouse={lighthouse} />
                  ) : (
                    <LighthouseCard lighthouse={lighthouse} />
                  )}
                </Animated.View>
              ))}
            </View>
            {!isScanning && (
              <Animated.View
                style={styles.rescanRow}
                entering={transitions.crossfadeIn()}
                layout={transitions.layout()}
              >
                <PressableScale
                  testID='rescan-button'
                  onPress={() => void startScan()}
                  accessibilityRole='button'
                  accessibilityLabel={t('lighthouses.list.rescan')}
                  style={styles.rescan}
                >
                  <Icon name={SCAN_ICON} size={15} tone='muted' />
                  <Text variant='callout' tone='muted'>
                    {t('lighthouses.list.rescan')}
                  </Text>
                </PressableScale>
              </Animated.View>
            )}
          </>
        ) : isScanning ? (
          <SearchingState />
        ) : (
          <EmptyState
            testID='lighthouse-empty'
            visual={<LighthouseIcon state='unknown' size={72} />}
            title={t('lighthouses.list.emptyTitle')}
            body={t('lighthouses.list.emptyBody')}
          >
            <Button
              testID='empty-scan-button'
              size='lg'
              icon={SCAN_ICON}
              label={t('lighthouses.list.scan')}
              onPress={() => void startScan()}
            />
          </EmptyState>
        )}
      </TabScreen>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.space(2),
  },
  list: {
    gap: theme.space(3),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space(3),
  },
  rescanRow: {
    alignItems: 'center',
  },
  rescan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    minHeight: 44,
    paddingHorizontal: theme.space(5),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
}));
