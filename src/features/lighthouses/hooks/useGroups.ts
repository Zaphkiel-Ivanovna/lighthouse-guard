import { useGroupsStore } from '../store/groups.store';
import { useLighthousesStore } from '../store/lighthouses.store';
import type { LighthouseGroup } from '../types';

export function useGroups(): readonly LighthouseGroup[] {
  return useGroupsStore((s) => s.groups);
}

export function useGroup(id: string | undefined): LighthouseGroup | undefined {
  return useGroupsStore((s) => s.groups.find((group) => group.id === id));
}

export function useActiveGroup(): LighthouseGroup | null {
  return useGroupsStore((s) => s.groups.find((group) => group.id === s.activeGroupId) ?? null);
}

export function useStartupGroup(): LighthouseGroup | null {
  return useGroupsStore((s) => s.groups.find((group) => group.id === s.startupGroupId) ?? null);
}

export function useFleetProgress(): number {
  return useLighthousesStore(
    (s) => s.fleet.scopeIds.filter((id) => s.fleet.command && s.devices[id]?.state === s.fleet.command).length,
  );
}
