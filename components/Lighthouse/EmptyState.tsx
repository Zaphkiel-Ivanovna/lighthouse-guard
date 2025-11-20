import { useLighthouseStore } from '@/stores/lighthouse.store';
import { Radar } from '@tamagui/lucide-icons';
import { useCallback, type FC } from 'react';
import { Button, H4, Paragraph, Spinner, YStack, Text } from 'tamagui';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'tamagui/linear-gradient';

export const LighthouseEmptyState: FC = () => {
  const startScan = useLighthouseStore((state) => state.startScan);
  const isScanning = useLighthouseStore((state) => state.isScanning);

  const handleScan = useCallback(() => {
    startScan();
  }, [startScan]);

  return (
    <YStack flex={1} items='center' justify='center' gap='$6' px='$6'>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#4A90E2', '#7B68EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCircle}
        />
        <Radar size={64} color='white' strokeWidth={2} />
      </View>

      <YStack items='center' gap='$3' maxW='$20'>
        <H4 fontWeight='600'>No lighthouses found</H4>
        <Text fontSize='$4' content='center' opacity={0.7}>
          Make sure Bluetooth is enabled and your Lighthouses are powered on and
          nearby.
        </Text>
      </YStack>

      <Button
        size='$5'
        bg='$blue9'
        color='$white1'
        rounded='$10'
        px='$8'
        onPress={handleScan}
        disabled={isScanning}
        pressStyle={{
          bg: '$blue10',
          scale: 0.98,
        }}
      >
        {isScanning ? (
          <>
            <Spinner size='small' color='$white1' />
            <Text fontSize='$5' fontWeight='600' ml='$2'>
              Scanning...
            </Text>
          </>
        ) : (
          <Text fontSize='$5' fontWeight='600'>
            Scan Now
          </Text>
        )}
      </Button>
    </YStack>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 200,
    width: 200,
  },
  gradientCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
});
