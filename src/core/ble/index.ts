export { BleError, toBleError, type BleErrorCode } from './errors';
export {
  createLighthouseClient,
  type DiscoveredLighthouse,
  type LighthouseClient,
  type ScanOptions,
  type SetPowerOptions,
} from './lighthouse-client';
export { ensureBlePermissions } from './permissions';
export { TIMING } from './protocol/constants';
export type { PowerCommand, PowerState } from './protocol/lighthouse-v2';
export { createSerialQueue, type SerialQueue } from './queue';
export type { BleTransport } from './transport/ble-transport';
export { DEFAULT_MOCK_LIGHTHOUSES, MockBleTransport, type MockLighthouseSeed } from './transport/mock-transport';
export { getLighthouseClient, setTransportMode, useTransportModeStore, type TransportMode } from './transport-mode';
