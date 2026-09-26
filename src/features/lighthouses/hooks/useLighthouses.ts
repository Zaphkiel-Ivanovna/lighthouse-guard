import { useTransportModeStore } from '@/core/ble';

import { useDeviceNamesStore } from '../store/device-names.store';
import { IDLE_COMMAND, useLighthousesStore } from '../store/lighthouses.store';
import type { CommandStatus, Lighthouse, ScanStatus } from '../types';

/** All discovered lighthouses, sorted by factory name for a stable order. */
export function useLighthouseList(): Lighthouse[] {
  const devices = useLighthousesStore((s) => s.devices);
  return Object.values(devices).sort((a, b) => a.name.localeCompare(b.name));
}

export function useLighthouse(id: string): Lighthouse | undefined {
  return useLighthousesStore((s) => s.devices[id]);
}

export function useCommandStatus(id: string): CommandStatus {
  return useLighthousesStore((s) => s.commands[id] ?? IDLE_COMMAND);
}

export function useScanStatus(): ScanStatus {
  return useLighthousesStore((s) => s.scan);
}

/** Custom name if the user set one, else the factory name. */
export function useDisplayName(lighthouse: Pick<Lighthouse, 'id' | 'name'>): string {
  const customName = useDeviceNamesStore((s) => s.names[lighthouse.id]);
  return customName ?? lighthouse.name;
}

export function useIsMockMode(): boolean {
  return useTransportModeStore((s) => s.mode === 'mock');
}
