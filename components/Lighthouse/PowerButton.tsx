import { FC, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'tamagui/linear-gradient';
import { LighthousePowerCommand } from 'types/lighthouse.types';

import { Power, PowerOff, Moon } from '@tamagui/lucide-icons';
import { ButtonProps, ColorTokens, Spinner } from 'tamagui';
import { useLighthouseStore } from 'stores/lighthouse.store';
import { CircularButton } from '../CircularButton';

interface Props extends Omit<ButtonProps, 'onPress'> {
  readonly deviceId: string;
  readonly powerCommand: LighthousePowerCommand;
}

const ICON_FROM_COMMAND: Record<
  LighthousePowerCommand,
  ReturnType<typeof Power>
> = {
  [LighthousePowerCommand.ON]: Power,
  [LighthousePowerCommand.STANDBY]: PowerOff,
  [LighthousePowerCommand.SLEEP]: Moon,
};

export const LighthousePowerButton: FC<Props> = ({
  deviceId,
  powerCommand,
  size,
  ...props
}) => {
  const sendPowerCommand = useLighthouseStore(
    (state) => state.sendPowerCommand
  );
  const commandState = useLighthouseStore(
    (state) => state.commandStates[deviceId]
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handleCommand = async () => {
    await sendPowerCommand(deviceId, powerCommand);
  };

  const Icon = ICON_FROM_COMMAND[powerCommand];
  const isDisabled = commandState?.isLoading || props.disabled;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <CircularButton
        onPress={handleCommand}
        onPressIn={isDisabled ? undefined : handlePressIn}
        onPressOut={isDisabled ? undefined : handlePressOut}
        disabled={isDisabled}
        {...props}
      >
        {commandState?.isLoading ? (
          <Spinner color='white' size='large' />
        ) : (
          <Icon size={28} color={isDisabled ? '$black5' : '$white1'} />
        )}
      </CircularButton>
    </Animated.View>
  );
};
