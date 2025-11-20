import { useLighthouseStore } from '@/stores/lighthouse.store';
import { Radar } from '@tamagui/lucide-icons';
import { useCallback, type FC } from 'react';
import { useColorScheme } from 'react-native';
import { Button, Spinner } from 'tamagui';

export const ScanButton: FC = () => {
  const colorScheme = useColorScheme();
  const startScan = useLighthouseStore((state) => state.startScan);
  const isScanning = useLighthouseStore((state) => state.isScanning);

  const handleScan = useCallback(() => {
    startScan();
  }, [startScan]);

  return (
    <Button
      onPress={handleScan}
      rounded='$8'
      bg='$black4'
      borderColor='$black8'
      icon={
        isScanning ? (
          <Spinner
            size='small'
            color={colorScheme === 'dark' ? '$white1' : '$black1'}
          />
        ) : (
          <Radar
            size={20}
            color={colorScheme === 'dark' ? '$white1' : '$black1'}
          />
        )
      }
    />
  );
};
