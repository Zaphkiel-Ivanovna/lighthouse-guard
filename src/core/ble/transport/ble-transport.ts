import type { BleError } from '../errors';

export type Bytes = readonly number[];

export type BleAdapterState = 'unknown' | 'resetting' | 'unsupported' | 'unauthorized' | 'poweredOff' | 'poweredOn';

export type DiscoveredDevice = {
  readonly id: string;
  readonly name: string | null;
  readonly rssi: number;
};

export type ScanRequest = {
  readonly onDevice: (device: DiscoveredDevice) => void;
  readonly onError: (error: BleError) => void;
};

export type BleTransport = {
  readonly kind: 'native' | 'mock';
  getAdapterState(): BleAdapterState;
  onAdapterStateChange(listener: (state: BleAdapterState) => void): () => void;
  startScan(request: ScanRequest): void;
  stopScan(): void;
  connect(deviceId: string): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  read(deviceId: string, service: string, characteristic: string): Promise<Bytes>;
  write(deviceId: string, service: string, characteristic: string, data: Bytes): Promise<void>;
};
