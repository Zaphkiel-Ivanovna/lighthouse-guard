import { BleNitro, BLEState, type BleNitroManager } from 'react-native-ble-nitro';

import { createLogger } from '@/core/logger';

import { BleError, toBleError } from '../errors';
import type { BleAdapterState, BleTransport, Bytes, ScanRequest } from './ble-transport';

const logger = createLogger('ble:nitro');

const ADAPTER_STATE: Record<BLEState, BleAdapterState> = {
  [BLEState.Unknown]: 'unknown',
  [BLEState.Resetting]: 'resetting',
  [BLEState.Unsupported]: 'unsupported',
  [BLEState.Unauthorized]: 'unauthorized',
  [BLEState.PoweredOff]: 'poweredOff',
  [BLEState.PoweredOn]: 'poweredOn',
};

/** react-native-ble-nitro implementation. The native module is touched lazily (iOS permission prompt on first use). */
export class NitroBleTransport implements BleTransport {
  readonly kind = 'native';
  #manager: BleNitroManager | null = null;

  private get manager(): BleNitroManager {
    this.#manager ??= BleNitro.instance();
    return this.#manager;
  }

  getAdapterState(): BleAdapterState {
    return ADAPTER_STATE[this.manager.state()];
  }

  onAdapterStateChange(listener: (state: BleAdapterState) => void): () => void {
    const subscription = this.manager.subscribeToStateChange((state) => listener(ADAPTER_STATE[state]));
    return () => subscription.remove();
  }

  startScan({ onDevice, onError }: ScanRequest): void {
    this.manager.startScan(
      { allowDuplicates: false },
      (device) => onDevice({ id: device.id, name: device.name || null, rssi: device.rssi }),
      (error) => onError(new BleError('operationFailed', error)),
    );
  }

  stopScan(): void {
    this.manager.stopScan();
  }

  async connect(deviceId: string): Promise<void> {
    try {
      await this.manager.connect(deviceId, (id, interrupted, error) => {
        if (interrupted) logger.warn(`connection to ${id} interrupted`, error);
      });
      await this.manager.discoverServices(deviceId);
    } catch (error) {
      throw toBleError(error, 'connectionFailed');
    }
  }

  /**
   * Always asks the native side to disconnect, even when not (yet) connected: after a
   * connect timeout this cancels the pending connection instead of leaking it.
   */
  async disconnect(deviceId: string): Promise<void> {
    try {
      await this.manager.disconnect(deviceId);
    } catch (error) {
      if (this.manager.isConnected(deviceId)) throw toBleError(error, 'operationFailed');
    }
  }

  async read(deviceId: string, service: string, characteristic: string): Promise<Bytes> {
    try {
      return await this.manager.readCharacteristic(deviceId, service, characteristic);
    } catch (error) {
      throw toBleError(error, 'operationFailed');
    }
  }

  async write(deviceId: string, service: string, characteristic: string, data: Bytes): Promise<void> {
    try {
      await this.manager.writeCharacteristic(deviceId, service, characteristic, [...data], true);
    } catch (error) {
      throw toBleError(error, 'operationFailed');
    }
  }
}
