import { CircularButton } from '@/components/CircularButton';
import { useLighthouseStore } from '@/stores/lighthouse.store';
import { LighthousePowerCommand } from '@/types/lighthouse.types';
import { ArrowLeft, Star } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Text, XStack, YStack, ScrollView } from 'tamagui';
import { LighthousePowerButton } from '@/components/Lighthouse/PowerButton';
import { COLOR_FROM_LIGHTHOUSE_STATE } from '@/utils/constants';
import { LighthouseStatusChip } from '@/components/Lighthouse/StatusChip';
import { ICON_FROM_STATE } from '@/utils/constants';
import { LighthouseDetailsView } from '@/components/Lighthouse/DetailsView';
import { LighthouseCapabilitiesErrorButton } from '@/components/Lighthouse/CapabilitiesErrorView';

export default function LighthouseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const device = useLighthouseStore((state) => state.devices[id]);
  const deviceCustomName = useLighthouseStore(
    (state) => state.customDeviceNames[id]
  );

  const commandState = useLighthouseStore((state) => state.commandStates[id]);
  const customDeviceNames = useLighthouseStore(
    (state) => state.customDeviceNames
  );

  const canControl = useMemo(
    () => !commandState?.isLoading,
    [device?.state, commandState?.isLoading]
  );

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
        <LighthouseCapabilitiesErrorButton
          deviceId={id}
          capabilities={device.capabilities}
        />
        <LighthouseDetailsView deviceId={id} />
      </YStack>
    </ScrollView>
  );
}
