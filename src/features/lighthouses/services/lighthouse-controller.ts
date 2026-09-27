import {
  ensureBlePermissions,
  getLighthouseClient,
  TIMING,
  toBleError,
  useTransportModeStore,
  type PowerCommand,
  type PowerState,
} from '@/core/ble';
import { createLogger } from '@/core/logger';
import { getPreference, showLighthouse } from '@/core/preferences';
import { wait } from '@/core/utils/async';

import { adoptStation } from './lighthouse-data';
import {
  clearLighthouses,
  IDLE_COMMAND,
  IDLE_FLEET,
  setCommandStatus,
  setDetails,
  setFleetCommand,
  setLighthouseChannel,
  setLighthouseState,
  setScanStatus,
  upsertLighthouse,
  useLighthousesStore,
} from '../store/lighthouses.store';

const logger = createLogger('lighthouses');

let scanController: AbortController | null = null;

export async function startScan(): Promise<void> {
  stopScan();
  const controller = new AbortController();
  scanController = controller;
  const isCurrent = () => scanController === controller;

  setScanStatus({ status: 'scanning', error: null });
  const refreshed = new Set<string>();
  try {
    await ensureBlePermissions();
    await getLighthouseClient().scan({
      signal: controller.signal,
      durationMs: getPreference('scanDurationSeconds') * 1_000,
      onFound: (found) => {
        upsertLighthouse(found);
        adoptStation(found.id, found.name);
        if (refreshed.has(found.id) || found.id in getPreference('hiddenLighthouses')) return;
        refreshed.add(found.id);
        void refreshPowerState(found.id);
      },
    });
    if (isCurrent()) setScanStatus({ status: 'idle', error: null });
  } catch (error) {
    if (isCurrent()) setScanStatus({ status: 'idle', error: toBleError(error).code });
  } finally {
    if (isCurrent()) scanController = null;
  }
}

export function stopScan(): void {
  scanController?.abort();
}

const pendingReads = new Map<string, Promise<void>>();

export function refreshPowerState(id: string): Promise<void> {
  const inFlight = pendingReads.get(id);
  if (inFlight) return inFlight;
  if (useLighthousesStore.getState().commands[id]?.status === 'pending') return Promise.resolve();

  const read = (async () => {
    try {
      const { power, channel } = await getLighthouseClient().readStatus(id);
      setLighthouseState(id, power);
      setLighthouseChannel(id, channel);
    } catch (error) {
      logger.warn(`could not read power state of ${id}`, error);
    } finally {
      pendingReads.delete(id);
    }
  })();
  pendingReads.set(id, read);
  return read;
}

async function runCommand(id: string, command: () => Promise<void>): Promise<void> {
  if (useLighthousesStore.getState().commands[id]?.status === 'pending') return;
  setCommandStatus(id, { status: 'pending', error: null });
  try {
    await command();
    setCommandStatus(id, IDLE_COMMAND);
  } catch (error) {
    setCommandStatus(id, { status: 'error', error: toBleError(error).code });
  }
}

export function setPower(id: string, command: PowerCommand): Promise<void> {
  return runCommand(id, async () => {
    const finalState = await getLighthouseClient().setPower(id, command, {
      onUpdate: (state) => setLighthouseState(id, state),
    });
    setLighthouseState(id, finalState);
  });
}

let fleetController: AbortController | null = null;

export async function setPowerAll(command: PowerCommand, scope?: readonly string[]): Promise<void> {
  const { devices, commands, fleet } = useLighthousesStore.getState();
  if (fleet.status === 'pending') return;
  const scopeIds = (scope ?? Object.keys(devices)).filter((id) => devices[id]);
  const ids = scopeIds.filter((id) => devices[id]?.state !== command && commands[id]?.status !== 'pending');
  if (ids.length === 0) return;

  const controller = new AbortController();
  fleetController = controller;
  const client = getLighthouseClient();
  setFleetCommand({ status: 'pending', command, scopeIds });
  try {
    const written: string[] = [];
    ids.forEach((id) => setCommandStatus(id, { status: 'pending', error: null }));
    for (const id of ids) {
      if (controller.signal.aborted) return;
      try {
        await client.writePower(id, command);
        written.push(id);
      } catch (error) {
        setCommandStatus(id, { status: 'error', error: toBleError(error).code });
      }
    }
    await Promise.all(written.map((id) => settle(client, id, command, controller.signal)));
  } finally {
    if (fleetController === controller) {
      fleetController = null;
      setFleetCommand(IDLE_FLEET);
    }
  }
}

async function settle(
  client: ReturnType<typeof getLighthouseClient>,
  id: string,
  target: PowerState,
  signal: AbortSignal,
): Promise<void> {
  let lastError: unknown = null;
  let lastState: PowerState | null = null;
  for (let read = 0; read < TIMING.settleReads && !signal.aborted; read += 1) {
    try {
      lastState = await client.readPowerState(id);
      setLighthouseState(id, lastState);
      lastError = null;
      if (lastState === target) break;
    } catch (error) {
      lastError = error;
    }
    await wait(TIMING.pollIntervalMs, signal).catch(() => undefined);
  }
  if (signal.aborted) return;
  setCommandStatus(id, lastError ? { status: 'error', error: toBleError(lastError).code } : IDLE_COMMAND);
  if (lastState === 'booting') setTimeout(() => void refreshPowerState(id), TIMING.settleFollowUpMs);
}

export function showHiddenLighthouse(id: string): void {
  showLighthouse(id);
  if (useLighthousesStore.getState().devices[id]) void refreshPowerState(id);
}

export function refreshReachable(): void {
  if (useLighthousesStore.getState().scan.status === 'scanning') return;
  void startScan();
}

export async function loadDetails(id: string, { force = false } = {}): Promise<void> {
  const current = useLighthousesStore.getState().details[id];
  if (current?.status === 'loading' || (current?.status === 'ready' && !force)) return;
  const previous = current?.data ?? null;
  setDetails(id, { status: 'loading', data: previous });
  try {
    const data = await getLighthouseClient().readDetails(id);
    setLighthouseChannel(id, data.channel);
    setDetails(id, { status: 'ready', data });
  } catch (error) {
    logger.warn(`could not read details of ${id}`, error);
    setDetails(id, { status: 'error', data: previous });
  }
}

export function identify(id: string): Promise<void> {
  return runCommand(id, () => getLighthouseClient().identify(id));
}

useTransportModeStore.subscribe((state, previous) => {
  if (state.mode === previous.mode) return;
  stopScan();
  fleetController?.abort();
  fleetController = null;
  clearLighthouses();
});
