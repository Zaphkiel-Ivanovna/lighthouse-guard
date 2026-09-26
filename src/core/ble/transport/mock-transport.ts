import { createLogger } from '@/core/logger';
import { wait } from '@/core/utils/async';

import { BleError } from '../errors';
import type { BleAdapterState, BleTransport, Bytes, ScanRequest } from './ble-transport';
import {
  LIGHTHOUSE_V2_CHARACTERISTICS,
  LIGHTHOUSE_V2_SERVICE,
  POWER_COMMAND_BYTE,
  POWER_STATE_BYTE,
} from '../protocol/constants';

const logger = createLogger('ble:mock');

export type MockLighthouseSeed = {
  readonly name: string;
  readonly powerByte: number;
  readonly rssi?: number;
};

type Step = { readonly byte: number; readonly at: number };

type MockDevice = {
  readonly id: string;
  readonly name: string;
  readonly rssi: number;
  powerByte: number;
  steps: Step[];
  connected: boolean;
};

export type MockBleTransportOptions = {
  readonly devices?: readonly MockLighthouseSeed[];
  /** Simulated latency of every GATT operation. */
  readonly latencyMs?: number;
  /** How long a lighthouse stays in `booting` before reaching its target state. */
  readonly bootMs?: number;
};

export const DEFAULT_MOCK_LIGHTHOUSES: readonly MockLighthouseSeed[] = [
  { name: 'LHB-1A2B3C4D', powerByte: POWER_STATE_BYTE.sleep, rssi: -52 },
  { name: 'LHB-5E6F7A8B', powerByte: POWER_STATE_BYTE.standby, rssi: -64 },
  { name: 'LHB-9C0D1E2F', powerByte: POWER_STATE_BYTE.on, rssi: -71 },
];

/** In-memory lighthouses that mimic real hardware timings. Used by debug mode and tests. */
export class MockBleTransport implements BleTransport {
  readonly kind = 'mock';
  readonly #devices = new Map<string, MockDevice>();
  readonly #latencyMs: number;
  readonly #bootMs: number;
  #adapterState: BleAdapterState = 'poweredOn';
  readonly #adapterListeners = new Set<(state: BleAdapterState) => void>();
  #scanTimers: ReturnType<typeof setTimeout>[] = [];

  constructor({ devices = DEFAULT_MOCK_LIGHTHOUSES, latencyMs = 150, bootMs = 3_000 }: MockBleTransportOptions = {}) {
    this.#latencyMs = latencyMs;
    this.#bootMs = bootMs;
    devices.forEach((seed) => this.addDevice(seed));
  }

  addDevice(seed: MockLighthouseSeed): string {
    const id = `MOCK-${seed.name}`;
    this.#devices.set(id, {
      id,
      name: seed.name,
      rssi: seed.rssi ?? -60,
      powerByte: seed.powerByte,
      steps: [],
      connected: false,
    });
    return id;
  }

  setAdapterState(state: BleAdapterState): void {
    this.#adapterState = state;
    this.#adapterListeners.forEach((listener) => listener(state));
  }

  isConnected(deviceId: string): boolean {
    return this.#devices.get(deviceId)?.connected ?? false;
  }

  getAdapterState(): BleAdapterState {
    return this.#adapterState;
  }

  onAdapterStateChange(listener: (state: BleAdapterState) => void): () => void {
    this.#adapterListeners.add(listener);
    return () => this.#adapterListeners.delete(listener);
  }

  startScan({ onDevice }: ScanRequest): void {
    this.stopScan();
    this.#scanTimers = [...this.#devices.values()].map((device, index) =>
      setTimeout(
        () => onDevice({ id: device.id, name: device.name, rssi: device.rssi }),
        this.#latencyMs * (index + 1),
      ),
    );
  }

  stopScan(): void {
    this.#scanTimers.forEach(clearTimeout);
    this.#scanTimers = [];
  }

  async connect(deviceId: string): Promise<void> {
    await wait(this.#latencyMs);
    this.#device(deviceId).connected = true;
  }

  async disconnect(deviceId: string): Promise<void> {
    await wait(this.#latencyMs / 2);
    this.#device(deviceId).connected = false;
  }

  async read(deviceId: string, service: string, characteristic: string): Promise<Bytes> {
    await wait(this.#latencyMs);
    const device = this.#connectedDevice(deviceId, service);
    switch (characteristic) {
      case LIGHTHOUSE_V2_CHARACTERISTICS.power:
        return [this.#settle(device).powerByte];
      case LIGHTHOUSE_V2_CHARACTERISTICS.channel:
        return [0x01];
      default:
        throw new BleError('operationFailed', `Characteristic ${characteristic} is not readable`);
    }
  }

  async write(deviceId: string, service: string, characteristic: string, data: Bytes): Promise<void> {
    await wait(this.#latencyMs);
    const device = this.#connectedDevice(deviceId, service);
    switch (characteristic) {
      case LIGHTHOUSE_V2_CHARACTERISTICS.power:
        this.#applyPowerCommand(this.#settle(device), data[0]);
        return;
      case LIGHTHOUSE_V2_CHARACTERISTICS.identify:
        logger.info(`${device.name} blinks`);
        return;
      default:
        throw new BleError('operationFailed', `Characteristic ${characteristic} is not writable`);
    }
  }

  #device(deviceId: string): MockDevice {
    const device = this.#devices.get(deviceId);
    if (!device) throw new BleError('deviceNotFound', `Unknown mock device ${deviceId}`);
    return device;
  }

  #connectedDevice(deviceId: string, service: string): MockDevice {
    const device = this.#device(deviceId);
    if (!device.connected) throw new BleError('operationFailed', `${deviceId} is not connected`);
    if (service !== LIGHTHOUSE_V2_SERVICE) throw new BleError('operationFailed', `Unknown service ${service}`);
    return device;
  }

  /** Applies the scheduled state steps whose time has come. */
  #settle(device: MockDevice): MockDevice {
    const now = Date.now();
    while (device.steps[0] && device.steps[0].at <= now) {
      device.powerByte = device.steps[0].byte;
      device.steps = device.steps.slice(1);
    }
    return device;
  }

  #applyPowerCommand(device: MockDevice, command: number | undefined): void {
    const isAsleep = device.powerByte === POWER_STATE_BYTE.sleep;
    const bootMs = isAsleep ? this.#bootMs : this.#bootMs / 2;
    const bootTo = (target: number) => {
      device.powerByte = isAsleep ? POWER_STATE_BYTE.booting : POWER_STATE_BYTE.bootingLaser;
      device.steps = [{ byte: target, at: Date.now() + bootMs }];
    };

    switch (command) {
      case POWER_COMMAND_BYTE.sleep:
        device.powerByte = POWER_STATE_BYTE.sleep;
        device.steps = [];
        return;
      case POWER_COMMAND_BYTE.on:
        if (device.powerByte !== POWER_STATE_BYTE.on) bootTo(POWER_STATE_BYTE.on);
        return;
      case POWER_COMMAND_BYTE.standby:
        if (isAsleep) bootTo(POWER_STATE_BYTE.standby);
        else {
          device.powerByte = POWER_STATE_BYTE.standby;
          device.steps = [];
        }
        return;
      default:
        throw new BleError('operationFailed', `Unknown power command ${String(command)}`);
    }
  }
}
