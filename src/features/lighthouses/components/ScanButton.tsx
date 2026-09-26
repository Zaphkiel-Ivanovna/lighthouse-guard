import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui';

import { useScanStatus } from '../hooks/useLighthouses';
import { startScan, stopScan } from '../services/lighthouse-controller';

const SCAN_ICON = { ios: 'antenna.radiowaves.left.and.right', android: 'bluetooth_searching' } as const;

export function ScanButton() {
  const { t } = useTranslation();
  const { status } = useScanStatus();
  const isScanning = status === 'scanning';

  return (
    <Button
      testID='scan-button'
      variant={isScanning ? 'secondary' : 'primary'}
      icon={isScanning ? undefined : SCAN_ICON}
      label={isScanning ? t('lighthouses.list.stopScan') : t('lighthouses.list.scan')}
      onPress={isScanning ? stopScan : () => void startScan()}
    />
  );
}
