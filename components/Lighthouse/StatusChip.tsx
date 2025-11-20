import { LighthouseState } from '@/types/lighthouse.types';
import type { FC } from 'react';
import { Chip } from '../Chip';
import { GetThemeValueForKey, Text, XStack } from 'tamagui';
import { Circle } from 'tamagui';

const LIGHTHOUSE_STATUS_CHIP_PROPS: Record<
  LighthouseState,
  {
    label: string;
    dotColor: GetThemeValueForKey<'backgroundColor'>;
  }
> = {
  [LighthouseState.BOOTING]: {
    label: 'Booting',
    dotColor: '$yellow10',
  },
  [LighthouseState.STANDBY]: {
    label: 'Standby',
    dotColor: '$blue10',
  },
  [LighthouseState.ON]: {
    label: 'On',
    dotColor: '$green10',
  },
  [LighthouseState.SLEEP]: {
    label: 'Sleep',
    dotColor: '$blue10',
  },
  [LighthouseState.OFF]: {
    label: 'Off',
    dotColor: '$red10',
  },
  [LighthouseState.UNKNOWN]: {
    label: 'Unknown',
    dotColor: '$black10',
  },
  [LighthouseState.ERROR]: {
    label: 'Error',
    dotColor: '$red10',
  },
};

interface Props {
  readonly state: LighthouseState;
}

export const LighthouseStatusChip: FC<Props> = ({ state }) => {
  const props = LIGHTHOUSE_STATUS_CHIP_PROPS[state];

  return (
    <XStack items='center' gap='$2'>
      <Circle size={12} bg={props.dotColor} />
      <Text>{props.label}</Text>
    </XStack>
  );
};
