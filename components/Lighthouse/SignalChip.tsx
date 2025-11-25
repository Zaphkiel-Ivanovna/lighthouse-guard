import {
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
} from '@tamagui/lucide-icons';
import { FC, useMemo } from 'react';
import { XStack, Text, YStack } from 'tamagui';
import { ColorTokens } from 'tamagui';

const ICON_FROM_SIGNAL_LEVEL: Record<number, typeof Signal> = {
  0: SignalZero,
  1: SignalZero,
  2: SignalLow,
  3: SignalMedium,
  4: SignalHigh,
  5: Signal,
};

const COLORS_FROM_SIGNAL_LEVEL: Record<number, ColorTokens> = {
  0: '$red10',
  1: '$red10',
  2: '$yellow10',
  3: '$yellow10',
  4: '$green10',
  5: '$green10',
};

interface Props {
  readonly level: number;
  readonly label: string;
  readonly rssi: number | null;
}

export const SignalChip: FC<Props> = ({ level, label }) => {
  const Icon = useMemo(() => ICON_FROM_SIGNAL_LEVEL[level], [level]);

  if (Icon === undefined) {
    return null;
  }

  return (
    <YStack position='relative' width={26} height={26}>
      <YStack position='absolute' opacity={0.3}>
        <Signal size={26} />
      </YStack>
      <YStack position='absolute'>
        <Icon size={26} color={COLORS_FROM_SIGNAL_LEVEL[level]} />
      </YStack>
    </YStack>
  );
};
