import { useRouter } from 'expo-router';
import { useMemo, type FC } from 'react';
import { useLighthouseStore } from '../../stores/lighthouse.store';
import {
  LighthouseDevice,
  LighthousePowerCommand,
  LighthouseState,
} from '../../types/lighthouse.types';

import { LighthousePowerButton } from './PowerButton';
import { LighthouseStatusChip } from './StatusChip';
import { Card, ColorTokens, YStack, XStack, Text } from 'tamagui';

import { getSignalInfo } from '@/utils/signal';
import { SignalChip } from './SignalChip';

const CHIP_COLOR_FROM_STATE: Record<LighthouseState, ColorTokens> = {
  [LighthouseState.ON]: '$green4',
  [LighthouseState.OFF]: '$red4',
  [LighthouseState.STANDBY]: '$yellow4',
  [LighthouseState.SLEEP]: '$blue4',
  [LighthouseState.BOOTING]: '$yellow4',
  [LighthouseState.UNKNOWN]: '$black4',
  [LighthouseState.ERROR]: '$red4',
};

interface Props {
  readonly index: number;
  readonly lighthouse: LighthouseDevice;
}

export const LighthouseCard: FC<Props> = ({ index, lighthouse }) => {
  const router = useRouter();

  const commandState = useLighthouseStore(
    (state) => state.commandStates[lighthouse.id]
  );
  const customDeviceNames = useLighthouseStore(
    (state) => state.customDeviceNames
  );

  const rssiInfos = getSignalInfo(lighthouse.rssi);

  const displayName = useMemo(
    () =>
      customDeviceNames[lighthouse.id] ||
      lighthouse.name ||
      lighthouse.localName ||
      'Unknown Device',
    [customDeviceNames, lighthouse.id]
  );

  const isSendingCommand = commandState?.isLoading ?? false;
  const isDisabled = useMemo(() => {
    return !lighthouse.canControl || isSendingCommand;
  }, [lighthouse.canControl, isSendingCommand]);

  const handleCardPress = () => {
    router.push(`/(tabs)/${lighthouse.id}`);
  };

  return (
    <Card
      onPress={handleCardPress}
      width='100%'
      rounded='$8'
      px='$4'
      py='$4'
      flexDirection='row'
      borderColor='$black5'
      borderWidth='$1'
      items='center'
      bg='$black3'
    >
      <YStack flex={1} gap='$2' verticalAlign='center' my='$1'>
        <Text
          fontSize='$8'
          fontWeight='600'
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {displayName}
        </Text>
        <XStack gap='$2' items='center'>
          <SignalChip {...rssiInfos} />
          <LighthouseStatusChip state={lighthouse.state} />
        </XStack>
      </YStack>

      <LighthousePowerButton
        deviceId={lighthouse.id}
        state={lighthouse.state}
        disabled={isDisabled}
      />
    </Card>
  );
};
