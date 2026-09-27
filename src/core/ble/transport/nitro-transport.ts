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

  readonly #attempts = new Map<string, symbol>();
  readonly #nativeConnects = new Set<string>();

  async connect(deviceId: string): Promise<void> {
    if (this.#nativeConnects.has(deviceId)) {
      throw new BleError('connectionFailed', `a connection to ${deviceId} is still pending`);
    }
    const attempt = Symbol(deviceId);
    this.#attempts.set(deviceId, attempt);
    const isAbandoned = () => this.#attempts.get(deviceId) !== attempt;

    let isLinked = false;
    try {
      this.#nativeConnects.add(deviceId);
      try {
        await this.manager.connect(deviceId, (id, interrupted, error) => {
          if (interrupted) logger.warn(`connection to ${id} interrupted`, error);
        });
        isLinked = true;
      } finally {
        this.#nativeConnects.delete(deviceId);
      }
      if (isAbandoned()) throw new BleError('aborted', `connect ${deviceId} abandoned`);
      await this.manager.getServicesWithCharacteristics(deviceId);
      if (isAbandoned()) throw new BleError('aborted', `connect ${deviceId} abandoned`);
    } catch (error) {
      if (isAbandoned() && isLinked) {
        await this.manager.disconnect(deviceId).catch((cause: unknown) => logger.warn('late disconnect failed', cause));
      }
      throw toBleError(error, 'connectionFailed');
    }
  }

  async disconnect(deviceId: string): Promise<void> {
    this.#attempts.delete(deviceId);
    if (!this.manager.isConnected(deviceId) && !this.#nativeConnects.has(deviceId)) return;
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
