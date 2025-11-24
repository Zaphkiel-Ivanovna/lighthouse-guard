import { CircularButton } from '@/components/CircularButton';
import { useLighthouseStore } from '@/stores/lighthouse.store';
import { useRenameDialogStore } from '@/stores/rename-dialog.store';
import {
  LighthousePowerCommand,
  LighthouseState,
} from '@/types/lighthouse.types';
import { ArrowLeft, PenSquare, Star, Wifi } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Card, Circle, Text, XStack, YStack } from 'tamagui';
import { SinglePowerButton } from '@/components/Lighthouse/SinglePowerButton';
import { IdentifyButton } from '@/components/Lighthouse/IdentifyButton';
import { getSignalInfo } from '@/utils/signal';

export default function LighthouseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const getDeviceById = useLighthouseStore((state) => state.getDeviceById);
  const getDeviceDisplayName = useLighthouseStore(
    (state) => state.getDeviceDisplayName
  );
  const setCustomDeviceName = useLighthouseStore(
    (state) => state.setCustomDeviceName
  );
  const clearCustomDeviceName = useLighthouseStore(
    (state) => state.clearCustomDeviceName
  );
  const commandState = useLighthouseStore((state) => state.commandStates[id]);
  const openRenameDialog = useRenameDialogStore((state) => state.openDialog);
  const customDeviceNames = useLighthouseStore(
    (state) => state.customDeviceNames
  );

  const device = getDeviceById(id);
  const displayName = useMemo(
    () => getDeviceDisplayName(id),
    [id, customDeviceNames]
  );

  const canControl = useMemo(
    () => device?.state !== LighthouseState.UNKNOWN || commandState?.isLoading,
    [device?.state, commandState?.isLoading]
  );

  const isPowerDisabled =
    !device ||
    device.state === LighthouseState.UNKNOWN ||
    device.state === LighthouseState.BOOTING ||
    commandState?.isLoading;

  console.log(device);

  const handleRename = () => {
    if (device) {
      openRenameDialog(device, displayName);
    }
  };

  const handleRenameSubmit = (newName: string) => {
    setCustomDeviceName(id, newName);
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <YStack ml='$2'>
          <Text
            numberOfLines={1}
            fontWeight='800'
            fontSize='$6'
            ellipsizeMode='tail'
          >
            {displayName}
          </Text>
          <Text
            numberOfLines={1}
            color='$black11'
            fontSize='$2'
            ellipsizeMode='tail'
          >
            {device?.id}
          </Text>
        </YStack>
      ),
      headerLeft: () => (
        <CircularButton
          onPress={() => router.back()}
          bg='$black4'
          circleSize={42}
        >
          <ArrowLeft size={20} />
        </CircularButton>
      ),
      headerRight: () => (
        <CircularButton bg='$black4' circleSize={42}>
          <Star size={20} />
        </CircularButton>
      ),
    });
  }, [navigation, displayName, customDeviceNames]);

  if (!device) {
    return (
      <YStack flex={1} items='center' justify='center' px='$4'>
        <Text fontSize='$6' color='$black11'>
          Device not found
        </Text>
      </YStack>
    );
  }

  const signalInfo = getSignalInfo(device.rssi);
  const signalDescription =
    signalInfo.rssi != null
      ? `Signal strength: ${signalInfo.label} (${signalInfo.rssi} dBm)`
      : 'Signal strength: Unknown';

  const statusTitle =
    device.state === LighthouseState.ON
      ? 'Active'
      : device.state === LighthouseState.STANDBY
      ? 'Standby'
      : device.state === LighthouseState.SLEEP
      ? 'Sleep'
      : device.state === LighthouseState.OFF
      ? 'Off'
      : 'Unknown';

  return (
    <YStack flex={1} p='$4'>
      <YStack mb='$4' gap='$3'>
        <Card
          px='$4'
          py='$3'
          rounded='$6'
          borderColor='$black5'
          borderWidth='$1'
          bg='$black3'
        >
          <XStack justify='space-between' items='center'>
            <XStack gap='$3' items='center'>
              <Circle size={40} bg='rgba(34, 197, 94, 0.25)'>
                <Wifi size={24} color='white' />
              </Circle>
              <YStack>
                <Text fontSize='$6' fontWeight='700'>
                  {statusTitle}
                </Text>
                <Text fontSize='$3' color='$black11'>
                  {signalDescription}
                </Text>
              </YStack>
            </XStack>
            <Circle size={12} bg='$green10' />
          </XStack>
        </Card>
      </YStack>
      <YStack mb='$4' gap='$3'>
        <Text fontSize='$8' fontWeight='700'>
          Quick Actions
        </Text>
        <XStack gap='$1' flexWrap='wrap' justify='space-between'>
          <SinglePowerButton
            label='Power'
            powerCommand={LighthousePowerCommand.ON}
            deviceId={device.id}
            isDisabled={isPowerDisabled}
          />
          <SinglePowerButton
            label='Standby'
            powerCommand={LighthousePowerCommand.STANDBY}
            deviceId={device.id}
            isDisabled={!canControl}
          />
          <SinglePowerButton
            label='Sleep'
            powerCommand={LighthousePowerCommand.SLEEP}
            deviceId={device.id}
            isDisabled={!canControl}
          />
          <IdentifyButton deviceId={device.id} isDisabled={!canControl} />
        </XStack>
      </YStack>
      <YStack gap='$3'>
        <Text fontSize='$8' fontWeight='700'>
          Details
        </Text>
        <Card
          px='$4'
          py='$2'
          borderColor='$black5'
          borderWidth='$1'
          rounded='$6'
          gap='$2'
        >
          <XStack
            justify='space-between'
            borderBottomWidth='$1'
            borderColor='$black5'
            py='$2'
          >
            <Text fontSize='$5' color='$black11'>
              Name
            </Text>
            <XStack gap='$2'>
              <Text fontSize='$6'>{device.name}</Text>
              <PenSquare size={20} color='$black11' />
            </XStack>
          </XStack>
          <XStack justify='space-between' py='$2'>
            <Text fontSize='$5' color='$black11'>
              ID
            </Text>
            <Text fontSize='$6'>{device.id}</Text>
          </XStack>
        </Card>
      </YStack>
    </YStack>
  );
}
