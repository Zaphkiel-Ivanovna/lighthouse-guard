import { LinearGradient } from '@tamagui/linear-gradient';
import { FC } from 'react';
import { Circle, Text, YStack } from 'tamagui';
import { Power, PowerOff, Moon } from '@tamagui/lucide-icons';
import { LighthousePowerCommand } from '@/types/lighthouse.types';
import { ColorTokens } from 'tamagui';
import { useLighthouseStore } from '@/stores/lighthouse.store';

const COLORS_FROM_COMMAND: Record<LighthousePowerCommand, ColorTokens[]> = {
  [LighthousePowerCommand.ON]: ['$green8', '$green4'],
  [LighthousePowerCommand.SLEEP]: ['$blue8', '$blue4'],
  [LighthousePowerCommand.STANDBY]: ['$red8', '$red4'],
};

const ICON_FROM_COMMAND: Record<
  LighthousePowerCommand,
  ReturnType<typeof Power>
> = {
  [LighthousePowerCommand.ON]: Power,
  [LighthousePowerCommand.STANDBY]: PowerOff,
  [LighthousePowerCommand.SLEEP]: Moon,
};

interface Props {
  readonly label: string;
  readonly powerCommand: LighthousePowerCommand;
  readonly deviceId: string;
  readonly isDisabled: boolean;
}

export const SinglePowerButton: FC<Props> = ({
  label,
  powerCommand,
  deviceId,
  isDisabled,
}) => {
  const sendPowerCommand = useLighthouseStore(
    (state) => state.sendPowerCommand
  );
  const commandState = useLighthouseStore(
    (state) => state.commandStates[deviceId]
  );

  const handleCommand = async () => {
    await sendPowerCommand(deviceId, powerCommand);
  };

  const Icon = ICON_FROM_COMMAND[powerCommand];

  const isLoadingOrDisabled = commandState?.isLoading || isDisabled;

  const handlePress = () => {
    if (isLoadingOrDisabled) return;
    void handleCommand();
  };

  return (
    <YStack
      width='49%'
      mb='$2'
      onPress={handlePress}
      opacity={isLoadingOrDisabled ? 0.6 : 1}
    >
      <LinearGradient
        colors={[...COLORS_FROM_COMMAND[powerCommand], '$black4', '$black3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        rounded='$6'
        px='$4'
        py='$2'
        flexDirection='row'
        items='center'
        borderColor='$black5'
        borderWidth='$1'
        width='100%'
        gap='$3'
      >
        <Circle size={40} bg='rgba(0, 0, 0, 0.2)'>
          <Icon size={24} color='white' />
        </Circle>
        <Text fontSize='$6' fontWeight='500' color='$white1'>
          {label}
        </Text>
      </LinearGradient>
    </YStack>
  );
};
