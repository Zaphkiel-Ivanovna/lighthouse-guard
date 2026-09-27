import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { GradientLayer, Icon, Orbit, PressableScale } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';
import { subtleGradient } from '@/theme';

import { useScanStatus } from '../hooks/useLighthouses';
import { startScan, stopScan } from '../services/lighthouse-controller';

const SCAN_ICON = { ios: 'antenna.radiowaves.left.and.right', android: 'bluetooth_searching' } as const;
const STOP_ICON = { ios: 'stop.fill', android: 'stop' } as const;
const SIZE = 44;

export function ScanHeaderButton() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isScanning = useScanStatus().status === 'scanning';

  const handlePress = () => {
    haptics.selection();
    if (isScanning) stopScan();
    else void startScan();
  };

  return (
    <PressableScale
      testID='scan-button'
      onPress={handlePress}
      scaleTo={0.88}
      hitSlop={10}
      accessibilityRole='button'
      accessibilityLabel={isScanning ? t('lighthouses.list.stopScan') : t('lighthouses.list.scan')}
      accessibilityState={{ busy: isScanning }}
      style={styles.button}
    >
      <View style={styles.fill}>
        <GradientLayer image={subtleGradient(theme.colors.inverse)} />
      </View>
      {isScanning && (
        <View style={styles.orbit}>
          <Orbit size={SIZE + 8} color={theme.colors.accent} periodMs={1100} />
        </View>
      )}
      <Icon name={isScanning ? STOP_ICON : SCAN_ICON} size={isScanning ? 14 : 20} color={theme.colors.onInverse} />
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.inverse,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
  },
  orbit: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
