import { createLogger } from '@/core/logger';
import { TimeoutError, wait, withTimeout } from '@/core/utils/async';

import { BleError, toBleError } from './errors';
import {
  DEVICE_INFORMATION_CHARACTERISTICS,
  DEVICE_INFORMATION_SERVICE,
  LIGHTHOUSE_V2_CHARACTERISTICS,
  LIGHTHOUSE_V2_SERVICE,
  TIMING,
} from './protocol/constants';
import {
  decodeChannel,
  decodePowerState,
  decodeText,
  encodeIdentify,
  encodePowerCommand,
  isLighthouseName,
  targetStateFor,
  type DeviceInformationField,
  type LighthouseDetails,
  type LighthouseStatus,
  type PowerCommand,
  type PowerState,
} from './protocol/lighthouse-v2';
import { createSerialQueue, type SerialQueue } from './queue';
import type { BleAdapterState, BleTransport } from './transport/ble-transport';

const logger = createLogger('ble:client');

export type DiscoveredLighthouse = {
  readonly id: string;
  readonly name: string;
  readonly rssi: number;
};

export type ScanOptions = {
  readonly signal: AbortSignal;
  readonly onFound: (lighthouse: DiscoveredLighthouse) => void;
  readonly durationMs?: number;
};

export type SetPowerOptions = {
  readonly onUpdate?: (state: PowerState) => void;
  readonly signal?: AbortSignal;
  readonly pollIntervalMs?: number;
  readonly pollTimeoutMs?: number;
};

export type LighthouseClient = {
  readonly transportKind: BleTransport['kind'];
  scan(options: ScanOptions): Promise<void>;
  readPowerState(deviceId: string): Promise<PowerState>;
  readStatus(deviceId: string): Promise<LighthouseStatus>;
  setPower(deviceId: string, command: PowerCommand, options?: SetPowerOptions): Promise<PowerState>;
  writePower(deviceId: string, command: PowerCommand): Promise<void>;
  identify(deviceId: string): Promise<void>;
  readDetails(deviceId: string): Promise<LighthouseDetails>;
};

const DEVICE_INFORMATION_FIELDS = Object.keys(DEVICE_INFORMATION_CHARACTERISTICS) as DeviceInformationField[];

const ADAPTER_ERRORS = {
  poweredOff: 'poweredOff',
  unauthorized: 'unauthorized',
  unsupported: 'unsupported',
} as const;

const isSettled = (state: BleAdapterState) => state !== 'unknown' && state !== 'resetting';

export function createLighthouseClient(
  transport: BleTransport,
  queue: SerialQueue = createSerialQueue(),
): LighthouseClient {
  const settledAdapterState = (signal: AbortSignal) =>
    new Promise<BleAdapterState>((resolve) => {
      const current = transport.getAdapterState();
      if (isSettled(current) || signal.aborted) {
        resolve(current);
        return;
      }
      const finish = () => {
        clearTimeout(timer);
        unsubscribe();
        signal.removeEventListener('abort', finish);
        resolve(transport.getAdapterState());
      };
      const timer = setTimeout(finish, TIMING.adapterReadyTimeoutMs);
      const unsubscribe = transport.onAdapterStateChange((state) => {
        if (isSettled(state)) finish();
      });
      signal.addEventListener('abort', finish, { once: true });
    });

  const assertAdapterReady = async (signal: AbortSignal) => {
    const state = await settledAdapterState(signal);
    if (signal.aborted) return;
    if (state in ADAPTER_ERRORS) {
      throw new BleError(ADAPTER_ERRORS[state as keyof typeof ADAPTER_ERRORS], `Bluetooth adapter is ${state}`);
    }
    if (!isSettled(state)) throw new BleError('unknown', `Bluetooth adapter is still ${state}`);
  };

  const withConnection = <T>(deviceId: string, session: () => Promise<T>): Promise<T> =>
    queue.run(async () => {
      try {
        await withTimeout(transport.connect(deviceId), TIMING.connectTimeoutMs, `connect ${deviceId}`);
        return await session();
      } catch (error) {
        throw toBleError(error, 'operationFailed');
      } finally {
        await withTimeout(transport.disconnect(deviceId), TIMING.operationTimeoutMs, `disconnect ${deviceId}`).catch(
          (error: unknown) => logger.warn(`disconnect ${deviceId} failed`, error),
        );
      }
    });

  const readPower = async (deviceId: string) => {
    const bytes = await withTimeout(
      transport.read(deviceId, LIGHTHOUSE_V2_SERVICE, LIGHTHOUSE_V2_CHARACTERISTICS.power),
      TIMING.operationTimeoutMs,
      'read power',
    );
    const state = decodePowerState(bytes);
    const raw = bytes.map((byte) => `0x${byte.toString(16).padStart(2, '0')}`).join(' ');
    if (state === 'unknown') logger.warn(`${deviceId}: unknown power byte ${raw}`);
    else logger.debug(`${deviceId}: power ${raw} → ${state}`);
    return state;
  };

  const readOptional = async (deviceId: string, service: string, characteristic: string, label: string) => {
    try {
      return await withTimeout(
        transport.read(deviceId, service, characteristic),
        TIMING.operationTimeoutMs,
        `read ${label}`,
      );
    } catch (error) {
      if (error instanceof TimeoutError) throw error;
      logger.debug(`${deviceId}: ${label} unavailable`, error);
      return null;
    }
  };

  const readDetails = async (deviceId: string): Promise<LighthouseDetails> => {
    const channel = await readOptional(
      deviceId,
      LIGHTHOUSE_V2_SERVICE,
      LIGHTHOUSE_V2_CHARACTERISTICS.channel,
      'channel',
    );
    const information: Partial<Record<DeviceInformationField, string | null>> = {};
    for (const field of DEVICE_INFORMATION_FIELDS) {
      const bytes = await readOptional(
        deviceId,
        DEVICE_INFORMATION_SERVICE,
        DEVICE_INFORMATION_CHARACTERISTICS[field],
        field,
      );
      information[field] = bytes ? decodeText(bytes) : null;
    }
    const details: LighthouseDetails = {
      channel: channel ? decodeChannel(channel) : null,
      model: information.model ?? null,
      serial: information.serial ?? null,
      firmware: information.firmware ?? null,
      hardware: information.hardware ?? null,
      manufacturer: information.manufacturer ?? null,
    };
    if (Object.values(details).every((value) => value === null)) {
      throw new BleError('operationFailed', `${deviceId}: no detail could be read`);
    }
    logger.debug(`${deviceId}: details`, details);
    return details;
  };

  return {
    transportKind: transport.kind,

    async scan({ signal, onFound, durationMs = TIMING.scanDurationMs }) {
      await assertAdapterReady(signal);
      if (signal.aborted) return;

      const stop = new AbortController();
      const onAbort = () => stop.abort();
      signal.addEventListener('abort', onAbort, { once: true });
      const errors: BleError[] = [];

      transport.startScan({
        onDevice: (device) => {
          if (isLighthouseName(device.name)) onFound({ id: device.id, name: device.name, rssi: device.rssi });
        },
        onError: (error) => {
          errors.push(error);
          stop.abort();
        },
      });

      try {
        await wait(durationMs, stop.signal);
      } catch {
      } finally {
        signal.removeEventListener('abort', onAbort);
        transport.stopScan();
      }
      const [firstError] = errors;
      if (firstError) throw firstError;
    },

    readPowerState: (deviceId) => withConnection(deviceId, () => readPower(deviceId)),

    readStatus: (deviceId) =>
      withConnection(deviceId, async () => {
        const power = await readPower(deviceId);
        const channel = await readOptional(
          deviceId,
          LIGHTHOUSE_V2_SERVICE,
          LIGHTHOUSE_V2_CHARACTERISTICS.channel,
          'channel',
        ).catch((error: unknown) => {
          logger.debug(`${deviceId}: channel read gave up`, error);
          return null;
        });
        return { power, channel: channel ? decodeChannel(channel) : null };
      }),

    setPower: (deviceId, command, options = {}) =>
      withConnection(deviceId, async () => {
        const {
          onUpdate,
          signal,
          pollIntervalMs = TIMING.pollIntervalMs,
          pollTimeoutMs = TIMING.pollTimeoutMs,
        } = options;
        const target = targetStateFor(command);

        await withTimeout(
          transport.write(
            deviceId,
            LIGHTHOUSE_V2_SERVICE,
            LIGHTHOUSE_V2_CHARACTERISTICS.power,
            encodePowerCommand(command),
          ),
          TIMING.operationTimeoutMs,
          'write power',
        );

        const deadline = Date.now() + pollTimeoutMs;
        let state = await readPower(deviceId);
        onUpdate?.(state);
        while (state !== target && Date.now() < deadline) {
          await wait(pollIntervalMs, signal);
          state = await readPower(deviceId);
          onUpdate?.(state);
        }
        if (state !== target) logger.warn(`${deviceId} did not reach ${target} (last: ${state})`);
        return state;
      }),

    writePower: (deviceId, command) =>
      withConnection(deviceId, () =>
        withTimeout(
          transport.write(
            deviceId,
            LIGHTHOUSE_V2_SERVICE,
            LIGHTHOUSE_V2_CHARACTERISTICS.power,
            encodePowerCommand(command),
          ),
          TIMING.operationTimeoutMs,
          'write power',
        ),
      ),

    identify: (deviceId) =>
      withConnection(deviceId, () =>
        withTimeout(
          transport.write(deviceId, LIGHTHOUSE_V2_SERVICE, LIGHTHOUSE_V2_CHARACTERISTICS.identify, encodeIdentify()),
          TIMING.operationTimeoutMs,
          'identify',
        ),
      ),

    readDetails: (deviceId) => withConnection(deviceId, () => readDetails(deviceId)),
  };
}
