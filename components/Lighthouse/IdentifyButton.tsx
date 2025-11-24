import { LinearGradient } from '@tamagui/linear-gradient';
import { FC } from 'react';
import { Circle, Text, YStack } from 'tamagui';
import { LocateFixed } from '@tamagui/lucide-icons';
import { useLighthouseStore } from '@/stores/lighthouse.store';

interface Props {
  readonly deviceId: string;
  readonly isDisabled: boolean;
}

export const IdentifyButton: FC<Props> = ({ deviceId, isDisabled }) => {
  const identifyDevice = useLighthouseStore((state) => state.identifyDevice);
  const commandState = useLighthouseStore(
    (state) => state.commandStates[deviceId]
  );

  const handleIdentify = async () => {
    await identifyDevice(deviceId);
  };

  const isLoadingOrDisabled = commandState?.isLoading || isDisabled;

  const handlePress = () => {
    if (isLoadingOrDisabled) return;
    handleIdentify();
  };

  return (
    <YStack
      width='49%'
      mb='$2'
      onPress={handlePress}
      opacity={isLoadingOrDisabled ? 0.6 : 1}
    >
      <LinearGradient
        colors={['$yellow8', '$black4', '$black3']}
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
          <LocateFixed size={24} color='white' />
        </Circle>
        <Text fontSize='$6' fontWeight='500' color='$white1'>
          Identify
        </Text>
      </LinearGradient>
    </YStack>
  );
};
