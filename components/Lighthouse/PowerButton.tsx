import { FC, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'tamagui/linear-gradient';
import { LighthousePowerCommand } from 'types/lighthouse.types';

import { Power, PowerOff, Moon } from '@tamagui/lucide-icons';
import { ButtonProps, Spinner } from 'tamagui';
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

const COLORS_FROM_COMMAND: Record<
  LighthousePowerCommand,
  [string, string, ...string[]]
> = {
  [LighthousePowerCommand.ON]: ['#10b981', '#059669'],
  [LighthousePowerCommand.STANDBY]: ['#ef4444', '#dc2626'],
  [LighthousePowerCommand.SLEEP]: ['#3b82f6', '#2563eb'],
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
        <LinearGradient
          colors={COLORS_FROM_COMMAND[powerCommand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {commandState?.isLoading ? (
          <Spinner color='white' />
        ) : (
          <Icon size={28} className='text-foreground' />
        )}
      </CircularButton>
    </Animated.View>
  );
};
