import { ColorTokens, GetThemeValueForKey } from 'tamagui';
import {
  LighthousePowerCommand,
  LighthouseState,
} from '../types/lighthouse.types';
import {
  CircleX,
  LoaderCircle,
  MessageCircleQuestion,
  Moon,
  Power,
  PowerOff,
} from '@tamagui/lucide-icons';

export const LIGHTHOUSE_POWER_BYTE_TO_STATE: Record<number, LighthouseState> = {
  0x00: LighthouseState.SLEEP,
  0x02: LighthouseState.STANDBY,
  0x01: LighthouseState.BOOTING,
  0x08: LighthouseState.BOOTING,
  0x09: LighthouseState.BOOTING,
  0x0b: LighthouseState.ON,
  0xff: LighthouseState.UNKNOWN,
};

export const LIGHTHOUSE_V2_CONTROL_SERVICE =
  '00001523-1212-efde-1523-785feabcd124';
export const LIGHTHOUSE_V2_POWER_CHARACTERISTIC =
  '00001525-1212-efde-1523-785feabcd124';
export const LIGHTHOUSE_V2_CHANNEL_CHARACTERISTIC =
  '00001524-1212-efde-1523-785feabcd124';
export const LIGHTHOUSE_V2_IDENTIFY_CHARACTERISTIC =
  '00008421-1212-efde-1523-785feabcd124';

export const LIGHTHOUSE_DEVICE_INFO_SERVICE =
  '0000180A-0000-1000-8000-00805F9B34FB';
export const LIGHTHOUSE_FIRMWARE_REVISION =
  '00002A26-0000-1000-8000-00805F9B34FB';
export const LIGHTHOUSE_MODEL_NUMBER = '00002A24-0000-1000-8000-00805F9B34FB';
export const LIGHTHOUSE_MANUFACTURER_NAME =
  '00002A29-0000-1000-8000-00805F9B34FB';

export const STATUS_POLLING_INTERVAL_MS = 1000;
export const STATUS_POLLING_MIN_INTERVAL_MS = 1000;
export const STATUS_POLLING_TIMEOUT_MS = 15000;

export const COLOR_FROM_LIGHTHOUSE_STATE: Record<
  LighthouseState,
  {
    backgroundColor: ColorTokens;
    primaryColor: ColorTokens;
    logoColor: ColorTokens;
  }
> = {
  [LighthouseState.ON]: {
    backgroundColor: '$green7',
    primaryColor: '$green8',
    logoColor: '$green10',
  },
  [LighthouseState.STANDBY]: {
    backgroundColor: '$red7',
    primaryColor: '$red8',
    logoColor: '$red10',
  },
  [LighthouseState.SLEEP]: {
    backgroundColor: '$blue7',
    primaryColor: '$blue8',
    logoColor: '$blue10',
  },
  [LighthouseState.BOOTING]: {
    backgroundColor: '$yellow7',
    primaryColor: '$yellow8',
    logoColor: '$yellow10',
  },
  [LighthouseState.OFF]: {
    backgroundColor: '$red7',
    primaryColor: '$red8',
    logoColor: '$red10',
  },
  [LighthouseState.UNKNOWN]: {
    backgroundColor: '$black7',
    primaryColor: '$black8',
    logoColor: '$black10',
  },
  [LighthouseState.ERROR]: {
    backgroundColor: '$red7',
    primaryColor: '$red8',
    logoColor: '$red10',
  },
};

export const COLOR_FROM_POWER_COMMAND: Record<
  LighthousePowerCommand,
  {
    backgroundColor: GetThemeValueForKey<'backgroundColor'>;
    shadowColor?: GetThemeValueForKey<'color'>;
    textColor?: GetThemeValueForKey<'color'>;
  }
> = {
  [LighthousePowerCommand.ON]: {
    backgroundColor: '$green7',
    shadowColor: '$green8',
    textColor: '$green10',
  },
  [LighthousePowerCommand.STANDBY]: {
    backgroundColor: '$red7',
    shadowColor: '$red8',
    textColor: '$red10',
  },
  [LighthousePowerCommand.SLEEP]: {
    backgroundColor: '$blue7',
    shadowColor: '$blue8',
    textColor: '$blue10',
  },
};

export const ICON_FROM_COMMAND: Record<
  LighthousePowerCommand,
  ReturnType<typeof Power>
> = {
  [LighthousePowerCommand.ON]: Power,
  [LighthousePowerCommand.STANDBY]: PowerOff,
  [LighthousePowerCommand.SLEEP]: Moon,
};

export const ICON_FROM_STATE: Record<
  LighthouseState,
  ReturnType<typeof Power>
> = {
  [LighthouseState.ON]: Power,
  [LighthouseState.STANDBY]: PowerOff,
  [LighthouseState.SLEEP]: Moon,
  [LighthouseState.BOOTING]: LoaderCircle,
  [LighthouseState.OFF]: PowerOff,
  [LighthouseState.UNKNOWN]: MessageCircleQuestion,
  [LighthouseState.ERROR]: CircleX,
};

export const POWER_COMMAND_FROM_STATE: Record<
  LighthouseState,
  LighthousePowerCommand
> = {
  [LighthouseState.ON]: LighthousePowerCommand.SLEEP,
  [LighthouseState.STANDBY]: LighthousePowerCommand.ON,
  [LighthouseState.SLEEP]: LighthousePowerCommand.ON,
  [LighthouseState.BOOTING]: LighthousePowerCommand.ON,
  [LighthouseState.OFF]: LighthousePowerCommand.ON,
  [LighthouseState.UNKNOWN]: LighthousePowerCommand.ON,
  [LighthouseState.ERROR]: LighthousePowerCommand.ON,
};
