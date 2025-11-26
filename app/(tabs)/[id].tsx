import { CircularButton } from '@/components/CircularButton';
import { useLighthouseStore } from '@/stores/lighthouse.store';
import { useRenameDialogStore } from '@/stores/rename-dialog.store';
import {
  LighthousePowerCommand,
  LighthouseState,
} from '@/types/lighthouse.types';
import {
  ArrowLeft,
  Lightbulb,
  PenSquare,
  ScanSearch,
  Sparkle,
  Sparkles,
  Star,
  Wifi,
} from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import {
  Card,
  Circle,
  ListItem,
  Separator,
  Text,
  XStack,
  YGroup,
  YStack,
  ScrollView,
  Stack,
} from 'tamagui';
import { LighthouseIdentifyButton } from '@/components/Lighthouse/IdentifyButton';
import { getSignalInfo, getSignalStrengthLabel } from '@/utils/signal';
import { LighthousePowerButton } from '@/components/Lighthouse/PowerButton';
import { COLOR_FROM_LIGHTHOUSE_STATE } from '@/utils/constants';
import { LighthouseStatusChip } from '@/components/Lighthouse/StatusChip';
import { ICON_FROM_STATE } from '@/utils/constants';
import { ZoomIn } from 'react-native-reanimated';

export default function LighthouseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const device = useLighthouseStore((state) => state.devices[id]);
  const deviceCustomName = useLighthouseStore(
    (state) => state.customDeviceNames[id]
  );

  const deviceStrength = useMemo(() => {
    if (!device) {
      return null;
    }

    return getSignalInfo(device.rssi);
  }, [device?.rssi]);

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

  console.log('device', device);

  const canControl = useMemo(
    () => device?.state !== LighthouseState.UNKNOWN || commandState?.isLoading,
    [device?.state, commandState?.isLoading]
  );

  const handleRename = () => {
    console.log('handleRename');
    if (device) {
      openRenameDialog(device, 'displayName');
    }
  };

  const handleRenameSubmit = (newName: string) => {
    setCustomDeviceName(id, newName);
  };

  const Icon = useMemo(() => {
    if (!device) {
      return null;
    }

    return ICON_FROM_STATE[device.state];
  }, [device?.state]);

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
      headerRight: () => (
        <CircularButton bg='$black4' circleSize={42}>
          <Star size={20} />
        </CircularButton>
      ),
    });
  }, [navigation, customDeviceNames]);

  if (!device) {
    return (
      <YStack flex={1} items='center' justify='center' px='$4'>
        <Text fontSize='$6' color='$black11'>
          Device not found
        </Text>
      </YStack>
    );
  }

  return (
    <ScrollView>
      <YStack flex={1} gap='$6' p='$4'>
        <YStack gap='$4' width='100%' items='center'>
          <XStack
            width='$11'
            height='$11'
            items='center'
            justify='center'
            shadowColor={COLOR_FROM_LIGHTHOUSE_STATE[device.state].logoColor}
            shadowRadius={24}
          >
            <Icon
              size='$10'
              color={COLOR_FROM_LIGHTHOUSE_STATE[device.state].logoColor}
            />
          </XStack>
          <Text fontSize='$8' fontWeight='700'>
            {deviceCustomName || device.name}
          </Text>
          <LighthouseStatusChip
            state={device.state}
            px='$3'
            py='$2'
            fontSize='$5'
            fontWeight='600'
          />
        </YStack>
        <YStack gap='$3'>
          <XStack gap='$1' flexWrap='wrap' justify='space-evenly'>
            <LighthousePowerButton
              deviceId={device.id}
              state={device.state}
              disabled={!canControl}
              powerCommand={LighthousePowerCommand.ON}
            />
            <LighthousePowerButton
              deviceId={device.id}
              state={device.state}
              disabled={!canControl}
              powerCommand={LighthousePowerCommand.STANDBY}
            />
            <LighthousePowerButton
              deviceId={device.id}
              state={device.state}
              disabled={!canControl}
              powerCommand={LighthousePowerCommand.SLEEP}
            />
          </XStack>
        </YStack>
        <YGroup
          separator={<Separator borderColor='$black5' />}
          borderColor='$black5'
          borderWidth='$1'
        >
          <YGroup.Item>
            <ListItem
              title='Name'
              subTitle={deviceCustomName || device.name}
              iconAfter={
                <PenSquare onPress={handleRename} size={24} color='$black11' />
              }
            />
          </YGroup.Item>
          {deviceCustomName && (
            <YGroup.Item>
              <ListItem title='Original Name' subTitle={device.name} />
            </YGroup.Item>
          )}
          <YGroup.Item>
            <ListItem title='ID' subTitle={device.id} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem title='Signal' subTitle={deviceStrength?.label} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem title='Model Number' subTitle={device.modelNumber} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem title='Firmware' subTitle={device.firmwareRevision} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem title='Manufacturer' subTitle={device.manufacturerName} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem title='Serial Number' subTitle={device.serialNumber} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem
              title='Spot my Lighthouse'
              subTitle='Tap to make the LED blink'
              iconAfter={<ScanSearch size={24} color='$black11' />}
              onPress={() => {
                console.log('Spot my Lighthouse');
              }}
            />
          </YGroup.Item>
        </YGroup>
      </YStack>
    </ScrollView>
  );
}
