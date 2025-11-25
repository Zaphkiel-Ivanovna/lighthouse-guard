import { LighthouseState } from '@/types/lighthouse.types';
import type { FC } from 'react';
import { Chip } from '../Chip';
import { GetThemeValueForKey, Text, XStack } from 'tamagui';

const LIGHTHOUSE_STATUS_CHIP_PROPS: Record<
  LighthouseState,
  {
    label: string;
    backgroundColor: GetThemeValueForKey<'backgroundColor'>;
    textColor?: GetThemeValueForKey<'color'>;
  }
> = {
  [LighthouseState.BOOTING]: {
    label: 'Booting',
    backgroundColor: '$yellow7',
    textColor: '$yellow11',
  },
  [LighthouseState.STANDBY]: {
    label: 'Standby',
    backgroundColor: '$red7',
    textColor: '$red11',
  },
  [LighthouseState.ON]: {
    label: 'Awake',
    backgroundColor: '$green7',
    textColor: '$green11',
  },
  [LighthouseState.SLEEP]: {
    label: 'Sleeping',
    backgroundColor: '$blue7',
    textColor: '$blue11',
  },
  [LighthouseState.OFF]: {
    label: 'Off',
    backgroundColor: '$red7',
    textColor: '$red11',
  },
  [LighthouseState.UNKNOWN]: {
    label: 'Unknown',
    backgroundColor: '$black7',
    textColor: '$black11',
  },
  [LighthouseState.ERROR]: {
    label: 'Error',
    backgroundColor: '$red7',
    textColor: '$red11',
  },
};

interface Props {
  readonly state: LighthouseState;
  readonly fontSize?: GetThemeValueForKey<'fontSize'>;
  readonly fontWeight?: GetThemeValueForKey<'fontWeight'>;
  readonly px?: GetThemeValueForKey<'paddingHorizontal'>;
  readonly py?: GetThemeValueForKey<'paddingVertical'>;
}

export const LighthouseStatusChip: FC<Props> = ({
  state,
  fontSize = '$3',
  fontWeight = '600',
  px = '$2',
  py = '$1.5',
}) => {
  const props = LIGHTHOUSE_STATUS_CHIP_PROPS[state];

  return (
    <XStack
      items='center'
      justify='center'
      rounded='$10'
      bg={props.backgroundColor}
      gap='$1'
      px={px}
      py={py}
    >
      <Text color={props.textColor} fontWeight={fontWeight} fontSize={fontSize}>
        {props.label}
      </Text>
    </XStack>
  );
};
