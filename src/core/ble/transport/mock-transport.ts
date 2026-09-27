import { createLogger } from '@/core/logger';
import { wait } from '@/core/utils/async';

import { BleError } from '../errors';
import type { BleAdapterState, BleTransport, Bytes, ScanRequest } from './ble-transport';
import {
  DEVICE_INFORMATION_CHARACTERISTICS,
  DEVICE_INFORMATION_SERVICE,
  LIGHTHOUSE_V2_CHARACTERISTICS,
  LIGHTHOUSE_V2_SERVICE,
  POWER_COMMAND_BYTE,
  POWER_STATE_BYTE,
} from '../protocol/constants';

const logger = createLogger('ble:mock');

export type MockDeviceInformation = {
  readonly [field in keyof typeof DEVICE_INFORMATION_CHARACTERISTICS]?: string;
};

export type MockLighthouseSeed = {
  readonly name: string;
  readonly powerByte: number;
  readonly rssi?: number;
  readonly channel?: number;
  readonly information?: MockDeviceInformation;
  readonly unreadable?: boolean;
};

type Step = { readonly byte: number; readonly at: number };

type MockDevice = {
  readonly id: string;
  readonly name: string;
  readonly rssi: number;
  readonly channel: number;
  readonly information: MockDeviceInformation | null;
  readonly unreadable: boolean;
  powerByte: number;
  steps: Step[];
  connected: boolean;
};

export type MockBleTransportOptions = {
  readonly devices?: readonly MockLighthouseSeed[];
  readonly latencyMs?: number;
  readonly bootMs?: number;
};

const MOCK_INFORMATION: MockDeviceInformation = {
  model: '1004',
  firmware: 'R: 2.9.2004771 M: 1.8.2004742 B: 3.4.3782793',
  hardware: '0.0',
  manufacturer: 'Valve Corp.',
};

export const DEFAULT_MOCK_LIGHTHOUSES: readonly MockLighthouseSeed[] = [
  {
    name: 'LHB-1A2B3C4D',
    powerByte: POWER_STATE_BYTE.sleep,
    rssi: -52,
    channel: 1,
    information: { ...MOCK_INFORMATION, serial: 'FB01A2B3C4 V001017-20.A' },
  },
  {
    name: 'LHB-5E6F7A8B',
    powerByte: POWER_STATE_BYTE.standby,
    rssi: -64,
    channel: 2,
    information: { ...MOCK_INFORMATION, serial: 'FB05E6F7A8 V001017-20.A' },
  },
  { name: 'LHB-9C0D1E2F', powerByte: POWER_STATE_BYTE.awakeFromSleep, rssi: -71, channel: 3 },
];

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
      channel: seed.channel ?? 1,
      information: seed.information ?? null,
      unreadable: seed.unreadable ?? false,
      powerByte: seed.powerByte,
      steps: [],
      connected: false,
    });
    return id;
  }

  setAdapterState(state: BleAdapterState): void {
    this.#adapterState = state;
    if (state !== 'poweredOn') {
      this.stopScan();
      this.#devices.forEach((device) => {
        device.connected = false;
      });
    }
    this.#adapterListeners.forEach((listener) => listener(state));
  }

  dropConnection(deviceId: string): void {
    this.#device(deviceId).connected = false;
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
    this.#assertPoweredOn();
    const device = this.#device(deviceId);
    if (device.connected) throw new BleError('connectionFailed', `${deviceId} accepts a single connection`);
    device.connected = true;
  }

  async disconnect(deviceId: string): Promise<void> {
    await wait(this.#latencyMs / 2);
    this.#device(deviceId).connected = false;
  }

  async read(deviceId: string, service: string, characteristic: string): Promise<Bytes> {
    await wait(this.#latencyMs);
    this.#assertPoweredOn();
    const device = this.#connectedDevice(deviceId, service);
    if (device.unreadable) throw new BleError('operationFailed', `${deviceId} does not answer reads`);
    if (service === DEVICE_INFORMATION_SERVICE) return this.#readInformation(device, characteristic);
    switch (characteristic) {
      case LIGHTHOUSE_V2_CHARACTERISTICS.power:
        return [this.#settle(device).powerByte];
      case LIGHTHOUSE_V2_CHARACTERISTICS.channel:
        return [device.channel];
      default:
        throw new BleError('operationFailed', `Characteristic ${characteristic} is not readable`);
    }
  }

  async write(deviceId: string, service: string, characteristic: string, data: Bytes): Promise<void> {
    await wait(this.#latencyMs);
    this.#assertPoweredOn();
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

  #assertPoweredOn(): void {
    if (this.#adapterState !== 'poweredOn') {
      throw new BleError('operationFailed', `Bluetooth adapter is ${this.#adapterState}`);
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
    const hasService =
      service === LIGHTHOUSE_V2_SERVICE || (service === DEVICE_INFORMATION_SERVICE && device.information);
    if (!hasService) throw new BleError('operationFailed', `Unknown service ${service}`);
    return device;
  }

  #readInformation(device: MockDevice, characteristic: string): Bytes {
    const field = (Object.keys(DEVICE_INFORMATION_CHARACTERISTICS) as (keyof MockDeviceInformation)[]).find(
      (key) => DEVICE_INFORMATION_CHARACTERISTICS[key] === characteristic,
    );
    const value = field ? device.information?.[field] : undefined;
    if (value === undefined) throw new BleError('operationFailed', `Characteristic ${characteristic} is not readable`);
    return [...value].map((char) => char.charCodeAt(0));
  }

  #settle(device: MockDevice): MockDevice {
    const now = Date.now();
    while (device.steps[0] && device.steps[0].at <= now) {
      device.powerByte = device.steps[0].byte;
      device.steps = device.steps.slice(1);
    }
    return device;
  }

  #applyPowerCommand(device: MockDevice, command: number | undefined): void {
    const { sleep, standby, booting, awake, awakeFromSleep, awakeFromStandby } = POWER_STATE_BYTE;
    const wasAsleep = device.powerByte === sleep;
    const isAwake = [awake, awakeFromSleep, awakeFromStandby].some((byte) => byte === device.powerByte);
    const spinUpTo = (target: number) => {
      device.powerByte = booting;
      device.steps = [{ byte: target, at: Date.now() + (wasAsleep ? this.#bootMs : this.#bootMs / 2) }];
    };

    switch (command) {
      case POWER_COMMAND_BYTE.sleep:
        device.powerByte = sleep;
        device.steps = [];
        return;
      case POWER_COMMAND_BYTE.on:
        if (!isAwake) spinUpTo(wasAsleep ? awakeFromSleep : awakeFromStandby);
        return;
      case POWER_COMMAND_BYTE.standby:
        if (wasAsleep) spinUpTo(standby);
        else {
          device.powerByte = standby;
          device.steps = [];
        }
        return;
      default:
        throw new BleError('operationFailed', `Unknown power command ${String(command)}`);
    }
  }
}
