import {
  ensureBlePermissions,
  getLighthouseClient,
  toBleError,
  useTransportModeStore,
  type PowerCommand,
} from '@/core/ble';
import { createLogger } from '@/core/logger';

import {
  clearLighthouses,
  IDLE_COMMAND,
  setCommandStatus,
  setLighthouseState,
  setScanStatus,
  upsertLighthouse,
  useLighthousesStore,
} from '../store/lighthouses.store';

const logger = createLogger('lighthouses');

let scanController: AbortController | null = null;

/** Scans for lighthouses and reads the power state of each new one. */
export async function startScan(): Promise<void> {
  stopScan();
  const controller = new AbortController();
  scanController = controller;
  const isCurrent = () => scanController === controller;

  setScanStatus({ status: 'scanning', error: null });
  try {
    await ensureBlePermissions();
    await getLighthouseClient().scan({
      signal: controller.signal,
      onFound: (found) => {
        const isNew = !useLighthousesStore.getState().devices[found.id];
        upsertLighthouse(found);
        if (isNew) void refreshPowerState(found.id);
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

export async function refreshPowerState(id: string): Promise<void> {
  try {
    setLighthouseState(id, await getLighthouseClient().readPowerState(id));
  } catch (error) {
    logger.warn(`could not read power state of ${id}`, error);
  }
}

/** Runs a device command while tracking its pending/error status. Ignores re-entrant calls. */
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

export function identify(id: string): Promise<void> {
  return runCommand(id, () => getLighthouseClient().identify(id));
}

// Switching between real and simulated lighthouses invalidates everything we know.
useTransportModeStore.subscribe((state, previous) => {
  if (state.mode === previous.mode) return;
  stopScan();
  clearLighthouses();
});
