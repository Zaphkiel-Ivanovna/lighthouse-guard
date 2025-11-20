import { useRouter } from 'expo-router';
import { useMemo, type FC } from 'react';
import { Pressable, useColorScheme, Platform, StyleSheet } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { useLighthouseStore } from '../../stores/lighthouse.store';
import {
  LighthouseDevice,
  LighthousePowerCommand,
  LighthouseState,
} from '../../types/lighthouse.types';

import { LighthousePowerButton } from './PowerButton';
import { LighthouseStatusChip } from './StatusChip';
import { Card, ColorTokens, YStack, XStack, Text } from 'tamagui';

import { LinearGradient } from 'tamagui/linear-gradient';
import { getSignalInfo, rssiToSignalStrength } from '@/utils/signal';
import { SignalChip } from './SignalChip';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const POWER_COMMAND_FROM_STATE: Record<
  LighthouseState,
  LighthousePowerCommand
> = {
  [LighthouseState.ON]: LighthousePowerCommand.SLEEP,
  [LighthouseState.STANDBY]: LighthousePowerCommand.ON,
  [LighthouseState.SLEEP]: LighthousePowerCommand.ON,
  [LighthouseState.BOOTING]: LighthousePowerCommand.ON,
  [LighthouseState.OFF]: LighthousePowerCommand.ON,
  [LighthouseState.UNKNOWN]: LighthousePowerCommand.ON,
  [LighthouseState.ERROR]: LighthousePowerCommand.ON,
};

const CHIP_COLOR_FROM_STATE: Record<LighthouseState, ColorTokens> = {
  [LighthouseState.ON]: '$green8',
  [LighthouseState.OFF]: '$red8',
  [LighthouseState.STANDBY]: '$yellow8',
  [LighthouseState.SLEEP]: '$blue8',
  [LighthouseState.BOOTING]: '$yellow8',
  [LighthouseState.UNKNOWN]: '$black8',
  [LighthouseState.ERROR]: '$red8',
};

interface Props {
  readonly index: number;
  readonly lighthouse: LighthouseDevice;
}

export const LighthouseCard: FC<Props> = ({ index, lighthouse }) => {
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
    return (
      lighthouse.state === LighthouseState.UNKNOWN ||
      lighthouse.state === LighthouseState.BOOTING ||
      isSendingCommand
    );
  }, [lighthouse.state, isSendingCommand]);

  const handleCardPress = () => {
    console.log(lighthouse);
    // router.push(`/home/${lighthouse.id}`);
  };

  return (
    <AnimatedPressable
      onPress={handleCardPress}
      entering={FadeInDown.duration(300)
        .delay(index * 100)
        .easing(Easing.out(Easing.ease))}
    >
      <LinearGradient
        colors={[CHIP_COLOR_FROM_STATE[lighthouse.state], '$black4', '$black3']}
        locations={[0, 0.35, 1]}
        width='100%'
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        rounded='$8'
        px='$4'
        py='$4'
        flexDirection='row'
        borderColor='$black5'
        borderWidth='$1'
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
          <XStack gap='$4' items='center'>
            <LighthouseStatusChip state={lighthouse.state} />
            <SignalChip {...rssiInfos} />
          </XStack>
        </YStack>

        <LighthousePowerButton
          deviceId={lighthouse.id}
          powerCommand={POWER_COMMAND_FROM_STATE[lighthouse.state]}
          disabled={isDisabled}
        />
      </LinearGradient>
    </AnimatedPressable>
  );
};
