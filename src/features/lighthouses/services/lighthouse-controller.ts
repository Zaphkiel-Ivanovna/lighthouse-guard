import {
  BleError,
  ensureBlePermissions,
  getLighthouseClient,
  powerOutcome,
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

let session = new AbortController();
let pendingReads = new Map<string, Promise<void>>();
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
        if (controller.signal.aborted) return;
        upsertLighthouse(found);
        adoptStation(found.id, found.name);
        if (refreshed.has(found.id) || Object.hasOwn(getPreference('hiddenLighthouses'), found.id)) return;
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

export function refreshPowerState(id: string): Promise<void> {
  const inFlight = pendingReads.get(id);
  if (inFlight) return inFlight;
  if (useLighthousesStore.getState().commands[id]?.status === 'pending') return Promise.resolve();

  const { signal } = session;
  const reads = pendingReads;
  const read = (async () => {
    try {
      const { power, channel } = await getLighthouseClient().readStatus(id);
      if (signal.aborted) return;
      setLighthouseState(id, power);
      setLighthouseChannel(id, channel);
    } catch (error) {
      logger.warn(`could not read power state of ${id}`, error);
    } finally {
      reads.delete(id);
    }
  })();
  reads.set(id, read);
  return read;
}

async function runCommand(id: string, command: (signal: AbortSignal) => Promise<void>): Promise<void> {
  if (useLighthousesStore.getState().commands[id]?.status === 'pending') return;
  const { signal } = session;
  setCommandStatus(id, { status: 'pending', error: null });
  try {
    await command(signal);
    if (!signal.aborted) setCommandStatus(id, IDLE_COMMAND);
  } catch (error) {
    if (!signal.aborted) setCommandStatus(id, { status: 'error', error: toBleError(error).code });
  }
}

function refreshLater(id: string, signal: AbortSignal): void {
  setTimeout(() => {
    if (!signal.aborted) void refreshPowerState(id);
  }, TIMING.settleFollowUpMs);
}

export function setPower(id: string, command: PowerCommand): Promise<void> {
  return runCommand(id, async (signal) => {
    const finalState = await getLighthouseClient().setPower(id, command, {
      signal,
      onUpdate: (state) => {
        if (!signal.aborted) setLighthouseState(id, state);
      },
    });
    if (signal.aborted) return;
    setLighthouseState(id, finalState);
    const outcome = powerOutcome(command, finalState);
    if (outcome === 'missed') throw new BleError('notReached', `${id} stayed ${finalState} after ${command}`);
    if (outcome === 'progressing') refreshLater(id, signal);
  });
}

export async function setPowerAll(command: PowerCommand, scope?: readonly string[]): Promise<void> {
  const { devices, commands, fleet } = useLighthousesStore.getState();
  if (fleet.status === 'pending') return;
  const scopeIds = (scope ?? Object.keys(devices)).filter((id) => devices[id]);
  const ids = scopeIds.filter((id) => devices[id]?.state !== command && commands[id]?.status !== 'pending');
  if (ids.length === 0) return;

  const { signal } = session;
  const client = getLighthouseClient();
  setFleetCommand({ status: 'pending', command, scopeIds });
  try {
    const written: string[] = [];
    ids.forEach((id) => setCommandStatus(id, { status: 'pending', error: null }));
    for (const id of ids) {
      if (signal.aborted) return;
      try {
        await client.writePower(id, command);
        written.push(id);
      } catch (error) {
        if (!signal.aborted) setCommandStatus(id, { status: 'error', error: toBleError(error).code });
      }
    }
    await Promise.all(written.map((id) => settle(client, id, command, signal)));
  } finally {
    if (!signal.aborted) setFleetCommand(IDLE_FLEET);
  }
}

async function settle(
  client: ReturnType<typeof getLighthouseClient>,
  id: string,
  command: PowerCommand,
  signal: AbortSignal,
): Promise<void> {
  let lastError: unknown = null;
  let lastState: PowerState = 'unknown';
  for (let read = 0; read < TIMING.settleReads && !signal.aborted; read += 1) {
    try {
      lastState = await client.readPowerState(id);
      if (signal.aborted) return;
      setLighthouseState(id, lastState);
      lastError = null;
      if (powerOutcome(command, lastState) === 'reached') break;
    } catch (error) {
      lastError = error;
    }
    await wait(TIMING.pollIntervalMs, signal).catch(() => undefined);
  }
  if (signal.aborted) return;
  if (lastError) {
    setCommandStatus(id, { status: 'error', error: toBleError(lastError).code });
    return;
  }
  const outcome = powerOutcome(command, lastState);
  setCommandStatus(id, outcome === 'missed' ? { status: 'error', error: 'notReached' } : IDLE_COMMAND);
  if (outcome === 'progressing') refreshLater(id, signal);
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
  const { signal } = session;
  setDetails(id, { status: 'loading', data: previous });
  try {
    const data = await getLighthouseClient().readDetails(id);
    if (signal.aborted) return;
    setLighthouseChannel(id, data.channel);
    setDetails(id, { status: 'ready', data });
  } catch (error) {
    if (signal.aborted) return;
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
  session.abort();
  session = new AbortController();
  pendingReads = new Map();
  clearLighthouses();
});
