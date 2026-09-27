import { create } from 'zustand';

import type { DiscoveredLighthouse, PowerState } from '@/core/ble';

import type { CommandStatus, DetailsStatus, FleetCommand, Lighthouse, ScanStatus } from '../types';

type LighthousesState = {
  readonly devices: Readonly<Record<string, Lighthouse>>;
  readonly scan: ScanStatus;
  readonly commands: Readonly<Record<string, CommandStatus>>;
  readonly fleet: FleetCommand;
  readonly details: Readonly<Record<string, DetailsStatus>>;
};

export const IDLE_COMMAND: CommandStatus = { status: 'idle', error: null };

export const IDLE_FLEET: FleetCommand = { status: 'idle', command: null, scopeIds: [] };

export const initialLighthousesState: LighthousesState = {
  devices: {},
  scan: { status: 'idle', error: null },
  commands: {},
  fleet: IDLE_FLEET,
  details: {},
};

export const useLighthousesStore = create<LighthousesState>()(() => initialLighthousesState);

const { setState } = useLighthousesStore;

export function upsertLighthouse({ id, name, rssi }: DiscoveredLighthouse): void {
  setState((s) => ({
    devices: {
      ...s.devices,
      [id]: { id, name, rssi, state: s.devices[id]?.state ?? 'unknown', channel: s.devices[id]?.channel ?? null },
    },
  }));
}

export function setLighthouseState(id: string, state: PowerState): void {
  setState((s) => {
    const device = s.devices[id];
    if (!device || device.state === state) return s;
    return { devices: { ...s.devices, [id]: { ...device, state } } };
  });
}

export function setLighthouseChannel(id: string, channel: number | null): void {
  setState((s) => {
    const device = s.devices[id];
    if (!device || channel === null || device.channel === channel) return s;
    return { devices: { ...s.devices, [id]: { ...device, channel } } };
  });
}

export function setScanStatus(scan: ScanStatus): void {
  setState({ scan });
}

export function setCommandStatus(id: string, command: CommandStatus): void {
  setState((s) => (s.devices[id] ? { commands: { ...s.commands, [id]: command } } : s));
}

export function setFleetCommand(fleet: FleetCommand): void {
  setState({ fleet });
}

export function setDetails(id: string, details: DetailsStatus): void {
  setState((s) => ({ details: { ...s.details, [id]: details } }));
}

export function clearLighthouses(): void {
  setState({ devices: {}, commands: {}, details: {}, fleet: IDLE_FLEET });
}
