import {
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
} from '@tamagui/lucide-icons';
import { FC } from 'react';
import { XStack, Text, YStack } from 'tamagui';
import { ColorTokens } from 'tamagui';

const ICON_FROM_SIGNAL_LEVEL: Record<number, typeof Signal> = {
  0: Signal,
  1: SignalZero,
  2: SignalLow,
  3: SignalMedium,
  4: SignalHigh,
};

const COLORS_FROM_SIGNAL_LEVEL: Record<number, ColorTokens> = {
  0: '$red10',
  1: '$red10',
  2: '$yellow10',
  3: '$yellow10',
  4: '$green10',
};

interface Props {
  readonly level: number;
  readonly label: string;
  readonly rssi: number | null;
}

export const SignalChip: FC<Props> = ({ level, label }) => {
  const Icon = ICON_FROM_SIGNAL_LEVEL[level];

  return (
    <XStack gap='$2' items='center'>
      <YStack position='relative' width={14} height={14}>
        <YStack position='absolute' opacity={0.3}>
          <Signal size={14} />
        </YStack>
        <YStack position='absolute'>
          <Icon size={14} color={COLORS_FROM_SIGNAL_LEVEL[level]} />
        </YStack>
      </YStack>
      <Text fontSize='$4'>{label}</Text>
    </XStack>
  );
};
