import type { BleErrorCode, PowerState } from '@/core/ble';

export type Lighthouse = {
  readonly id: string;
  /** Factory advertised name (`LHB-XXXXXXXX`). The user-facing name comes from `useDisplayName`. */
  readonly name: string;
  readonly rssi: number;
  readonly state: PowerState;
};

export type CommandStatus = {
  readonly status: 'idle' | 'pending' | 'error';
  readonly error: BleErrorCode | null;
};

export type ScanStatus = {
  readonly status: 'idle' | 'scanning';
  readonly error: BleErrorCode | null;
};
