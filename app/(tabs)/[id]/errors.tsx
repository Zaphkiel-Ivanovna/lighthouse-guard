import { AlertCircle, ArrowLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, Text, View, YStack, XStack, Button } from 'tamagui';
import { useLighthouseStore } from '@/stores/lighthouse.store';
import { transformLighthouseCapabilities } from 'transformers/lighthouse.transformers';
import { CircularButton } from '@/components/CircularButton';

export default function LighthouseErrorsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const device = useLighthouseStore((state) => state.devices[id]);
  const navigation = useNavigation();

  const errors = useMemo(
    () =>
      device?.capabilities
        ? transformLighthouseCapabilities(device.capabilities)
        : [],
    [device?.capabilities]
  );

  const criticalErrors = useMemo(
    () => errors.filter((e) => e.severity === 'critical'),
    [errors]
  );

  const warnings = useMemo(
    () => errors.filter((e) => e.severity === 'warning'),
    [errors]
  );

  const hasCritical = criticalErrors.length > 0;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <CircularButton
          onPress={() => router.back()}
          bg='$black4'
          circleSize={42}
        >
          <ArrowLeft size={20} />
        </CircularButton>
      ),
      headerTitle: () => (
        <YStack flex={1} ml='$2'>
          <Text fontSize='$7' fontWeight='bold' color='$white1'>
            Feature Issues
          </Text>
          <Text fontSize='$3' color='$white8'>
            {device?.localName || device?.name || 'Unknown Device'}
          </Text>
        </YStack>
      ),
    });
  }, [navigation]);

  if (!device) {
    return (
      <YStack flex={1} items='center' justify='center' p='$4'>
        <Text fontSize='$5' color='$color11'>
          Device not found
        </Text>
        <Button mt='$4' onPress={() => router.back()}>
          Go Back
        </Button>
      </YStack>
    );
  }

  if (errors.length === 0) {
    return (
      <YStack flex={1} items='center' justify='center' p='$4'>
        <Text fontSize='$5' color='$green11' fontWeight='600'>
          ✓ No issues detected
        </Text>
        <Text fontSize='$3' color='$color11' mt='$2'>
          All device features are available
        </Text>
        <Button mt='$4' onPress={() => router.back()}>
          Go Back
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg='$background'>
      <YStack
        rounded='$3'
        p='$4'
        m='$4'
        bg={hasCritical ? '$red2' : '$yellow2'}
        borderWidth={1}
        borderColor={hasCritical ? '$red7' : '$yellow7'}
      >
        <XStack gap='$3'>
          {criticalErrors.length > 0 && (
            <View bg='$red9' px='$3' py='$2' rounded='$3'>
              <Text fontSize='$2' fontWeight='600' color='white'>
                {criticalErrors.length} Critical
              </Text>
            </View>
          )}
          {warnings.length > 0 && (
            <View bg='$yellow8' px='$3' py='$2' rounded='$3'>
              <Text fontSize='$2' fontWeight='600' color='white'>
                {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </XStack>
      </YStack>

      {/* Scrollable Content */}
      <ScrollView flex={1}>
        <YStack gap='$4' p='$4'>
          {/* Critical Errors */}
          {criticalErrors.length > 0 && (
            <YStack gap='$3'>
              <Text fontSize='$6' fontWeight='600' color='$red11'>
                Critical Issues
              </Text>
              <Text fontSize='$3' color='$red10' mb='$2'>
                These features are required for basic device functionality
              </Text>
              {criticalErrors.map((error, index) => (
                <View
                  key={`critical-${index}`}
                  p='$4'
                  bg='$red4'
                  rounded='$4'
                  borderWidth={2}
                  borderColor='$red7'
                >
                  <Text fontSize='$5' fontWeight='600' color='$red12'>
                    {error.characteristic}
                  </Text>
                  <Text fontSize='$4' color='$red11' mt='$3' fontWeight='500'>
                    Missing:{' '}
                    {error.missingCapabilities.join(', ').toUpperCase()}
                  </Text>
                </View>
              ))}
              <View
                bg='$red3'
                p='$4'
                rounded='$3'
                borderWidth={1}
                borderColor='$red6'
              >
                <Text fontSize='$4' color='$red11' fontWeight='500'>
                  ⚠️ Device may not function properly without these features
                </Text>
              </View>
            </YStack>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <YStack gap='$3'>
              <Text fontSize='$6' fontWeight='600' color='$yellow11'>
                Warnings
              </Text>
              <Text fontSize='$3' color='$yellow10' mb='$2'>
                These features enhance device functionality but are not critical
              </Text>
              {warnings.map((error, index) => (
                <View
                  key={`warning-${index}`}
                  p='$4'
                  bg='$yellow3'
                  rounded='$4'
                  borderWidth={2}
                  borderColor='$yellow6'
                >
                  <Text fontSize='$5' fontWeight='600' color='$yellow12'>
                    {error.characteristic}
                  </Text>
                  <Text
                    fontSize='$4'
                    color='$yellow11'
                    mt='$3'
                    fontWeight='500'
                  >
                    Missing:{' '}
                    {error.missingCapabilities.join(', ').toUpperCase()}
                  </Text>
                </View>
              ))}
              <View
                bg='$yellow3'
                p='$4'
                rounded='$3'
                borderWidth={1}
                borderColor='$yellow6'
              >
                <Text fontSize='$4' color='$yellow11' fontWeight='500'>
                  ℹ️ Some features may be limited
                </Text>
              </View>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
