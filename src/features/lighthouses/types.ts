import type { BleErrorCode, LighthouseDetails, PowerCommand, PowerState } from '@/core/ble';

export type Lighthouse = {
  readonly id: string;
  readonly name: string;
  readonly rssi: number;
  readonly state: PowerState;
  readonly channel: number | null;
};

export type CommandStatus = {
  readonly status: 'idle' | 'pending' | 'error';
  readonly error: BleErrorCode | null;
};

export type ScanStatus = {
  readonly status: 'idle' | 'scanning';
  readonly error: BleErrorCode | null;
};

export type FleetCommand = {
  readonly status: 'idle' | 'pending';
  readonly command: PowerCommand | null;
  readonly scopeIds: readonly string[];
};

export type DetailsStatus = {
  readonly status: 'loading' | 'ready' | 'error';
  readonly data: LighthouseDetails | null;
};

export type GroupMember = {
  readonly id: string;
  readonly name: string;
};

export type LighthouseGroup = {
  readonly id: string;
  readonly name: string;
  readonly members: readonly GroupMember[];
};
