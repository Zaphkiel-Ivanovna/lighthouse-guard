import { useDeviceNamesStore } from '../store/device-names.store';
import { IDLE_COMMAND, useLighthousesStore } from '../store/lighthouses.store';
import type { CommandStatus, DetailsStatus, FleetCommand, Lighthouse, ScanStatus } from '../types';

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

export function useLighthouseDetails(id: string): DetailsStatus | undefined {
  return useLighthousesStore((s) => s.details[id]);
}

export function useFleetCommand(): FleetCommand {
  return useLighthousesStore((s) => s.fleet);
}

export function useScanStatus(): ScanStatus {
  return useLighthousesStore((s) => s.scan);
}

export function useDisplayNames(): Readonly<Record<string, string>> {
  return useDeviceNamesStore((s) => s.names);
}

export function useDisplayName(lighthouse: Pick<Lighthouse, 'id' | 'name'>): string {
  const customName = useDeviceNamesStore((s) => s.names[lighthouse.id]);
  return customName ?? lighthouse.name;
}
