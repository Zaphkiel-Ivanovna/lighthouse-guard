import { AlertCircle } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { FC, useMemo } from 'react';
import { Button, Text } from 'tamagui';
import { LighthouseCharacteristicCapabilities } from '@/types/lighthouse.types';
import { transformLighthouseCapabilities } from 'transformers/lighthouse.transformers';

interface Props {
  readonly deviceId: string;
  readonly capabilities?: LighthouseCharacteristicCapabilities;
}

export const LighthouseCapabilitiesErrorButton: FC<Props> = ({
  deviceId,
  capabilities,
}) => {
  const router = useRouter();

  if (!capabilities) {
    return null;
  }

  const errors = useMemo(
    () => transformLighthouseCapabilities(capabilities),
    [capabilities]
  );

  const criticalErrors = useMemo(
    () => errors.filter((e) => e.severity === 'critical'),
    [errors]
  );

  if (errors.length === 0) {
    return null;
  }

  const totalIssues = errors.length;
  const hasCritical = criticalErrors.length > 0;

  return (
    <Button
      size='$3'
      bg={hasCritical ? '$red9' : '$yellow9'}
      pressStyle={{ opacity: 0.8 }}
      icon={<AlertCircle size={16} />}
      onPress={() => router.push(`/(tabs)/${deviceId}/errors`)}
    >
      <Text color='white' fontWeight='600'>
        {totalIssues} Feature Issue{totalIssues > 1 ? 's' : ''}
      </Text>
    </Button>
  );
};
