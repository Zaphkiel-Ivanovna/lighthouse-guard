import { FC, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import { LighthouseState } from 'types/lighthouse.types';

import { ButtonProps, Spinner } from 'tamagui';
import { useLighthouseStore } from 'stores/lighthouse.store';
import { CircularButton } from '../CircularButton';
import {
  COLOR_FROM_LIGHTHOUSE_STATE,
  COLOR_FROM_POWER_COMMAND,
  ICON_FROM_COMMAND,
  POWER_COMMAND_FROM_STATE,
} from '@/utils/constants';

interface Props extends Omit<ButtonProps, 'onPress'> {
  readonly deviceId: string;
  readonly state: LighthouseState;
}

export const LighthousePowerButton: FC<Props> = ({
  deviceId,
  state,
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

  const powerCommand = useMemo(() => POWER_COMMAND_FROM_STATE[state], [state]);
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
        bg={COLOR_FROM_POWER_COMMAND[powerCommand].backgroundColor}
        shadowColor={COLOR_FROM_POWER_COMMAND[powerCommand].shadowColor}
        shadowRadius={8}
        borderColor={COLOR_FROM_POWER_COMMAND[powerCommand].shadowColor}
        borderWidth='$1'
        opacity={isDisabled ? 0.6 : 1}
        {...props}
      >
        {commandState?.isLoading ? (
          <Spinner color='white' size='large' />
        ) : (
          <Icon size={28} />
        )}
      </CircularButton>
    </Animated.View>
  );
};
