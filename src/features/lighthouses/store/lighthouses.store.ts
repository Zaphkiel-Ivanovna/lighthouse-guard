import { create } from 'zustand';

import type { DiscoveredLighthouse, PowerState } from '@/core/ble';

import type { CommandStatus, Lighthouse, ScanStatus } from '../types';

type LighthousesState = {
  readonly devices: Readonly<Record<string, Lighthouse>>;
  readonly scan: ScanStatus;
  readonly commands: Readonly<Record<string, CommandStatus>>;
};

export const IDLE_COMMAND: CommandStatus = { status: 'idle', error: null };

export const initialLighthousesState: LighthousesState = {
  devices: {},
  scan: { status: 'idle', error: null },
  commands: {},
};

/** Transient, session-only state (not persisted). Mutated through the setters below. */
export const useLighthousesStore = create<LighthousesState>()(() => initialLighthousesState);

const { setState } = useLighthousesStore;

export function upsertLighthouse({ id, name, rssi }: DiscoveredLighthouse): void {
  setState((s) => ({
    devices: { ...s.devices, [id]: { id, name, rssi, state: s.devices[id]?.state ?? 'unknown' } },
  }));
}

export function setLighthouseState(id: string, state: PowerState): void {
  setState((s) => {
    const device = s.devices[id];
    if (!device || device.state === state) return s;
    return { devices: { ...s.devices, [id]: { ...device, state } } };
  });
}

export function setScanStatus(scan: ScanStatus): void {
  setState({ scan });
}

export function setCommandStatus(id: string, command: CommandStatus): void {
  setState((s) => ({ commands: { ...s.commands, [id]: command } }));
}

export function clearLighthouses(): void {
  setState({ devices: {}, commands: {} });
}
