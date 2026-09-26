import { createLogger } from '@/core/logger';
import { wait, withTimeout } from '@/core/utils/async';

import { BleError, toBleError } from './errors';
import { LIGHTHOUSE_V2_CHARACTERISTICS, LIGHTHOUSE_V2_SERVICE, TIMING } from './protocol/constants';
import {
  decodePowerState,
  encodeIdentify,
  encodePowerCommand,
  isLighthouseName,
  targetStateFor,
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
  /** Called with every state read while waiting for the target state. */
  readonly onUpdate?: (state: PowerState) => void;
  readonly signal?: AbortSignal;
  readonly pollIntervalMs?: number;
  readonly pollTimeoutMs?: number;
};

export type LighthouseClient = {
  readonly transportKind: BleTransport['kind'];
  /** Scans until `durationMs` elapses or `signal` aborts. Rejects with `BleError` if the adapter is unusable. */
  scan(options: ScanOptions): Promise<void>;
  readPowerState(deviceId: string): Promise<PowerState>;
  /** Writes the command, then polls on the same connection until the target state or timeout. Resolves with the last state read. */
  setPower(deviceId: string, command: PowerCommand, options?: SetPowerOptions): Promise<PowerState>;
  /** Blinks the lighthouse LED. */
  identify(deviceId: string): Promise<void>;
};

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
  /**
   * Right after (lazy) init the adapter reports `unknown` until CoreBluetooth / the
   * permission prompt settles; scanning in that window is silently ignored by iOS.
   */
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
        await transport
          .disconnect(deviceId)
          .catch((error: unknown) => logger.warn(`disconnect ${deviceId} failed`, error));
      }
    });

  const readPower = async (deviceId: string) =>
    decodePowerState(
      await withTimeout(
        transport.read(deviceId, LIGHTHOUSE_V2_SERVICE, LIGHTHOUSE_V2_CHARACTERISTICS.power),
        TIMING.operationTimeoutMs,
        'read power',
      ),
    );

  return {
    transportKind: transport.kind,

    async scan({ signal, onFound, durationMs = TIMING.scanDurationMs }) {
      await assertAdapterReady(signal);
      if (signal.aborted) return;

      // Stops the wait early on user abort or on a native scan error.
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
        // Aborted: either the user stopped the scan (not an error) or `errors` has the cause.
      } finally {
        signal.removeEventListener('abort', onAbort);
        transport.stopScan();
      }
      const [firstError] = errors;
      if (firstError) throw firstError;
    },

    readPowerState: (deviceId) => withConnection(deviceId, () => readPower(deviceId)),

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

    identify: (deviceId) =>
      withConnection(deviceId, () =>
        withTimeout(
          transport.write(deviceId, LIGHTHOUSE_V2_SERVICE, LIGHTHOUSE_V2_CHARACTERISTICS.identify, encodeIdentify()),
          TIMING.operationTimeoutMs,
          'identify',
        ),
      ),
  };
}
