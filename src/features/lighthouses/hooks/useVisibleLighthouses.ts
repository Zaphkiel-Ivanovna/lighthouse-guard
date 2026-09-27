import { usePreference } from '@/core/preferences';

import { useDeviceNamesStore } from '../store/device-names.store';
import { useLighthousesStore } from '../store/lighthouses.store';
import type { Lighthouse } from '../types';
import { useActiveGroup } from './useGroups';
import { useLighthouseList } from './useLighthouses';
import { findChannelConflicts, type ChannelConflict } from '../utils/channels';
import { sortLighthouses } from '../utils/sort';

export function useShownLighthouses(): Lighthouse[] {
  const lighthouses = useLighthouseList();
  const hidden = usePreference('hiddenLighthouses');
  return lighthouses.filter((lighthouse) => !(lighthouse.id in hidden));
}

export function useVisibleLighthouses(): Lighthouse[] {
  const shown = useShownLighthouses();
  const group = useActiveGroup();
  const order = usePreference('sortOrder');
  const names = useDeviceNamesStore((s) => s.names);
  const memberIds = group ? new Set(group.members.map((member) => member.id)) : null;
  const inScope = memberIds ? shown.filter((lighthouse) => memberIds.has(lighthouse.id)) : shown;
  return sortLighthouses(inScope, order, (lighthouse) => names[lighthouse.id] ?? lighthouse.name);
}

export function useIsChannelShared(lighthouse: Lighthouse): boolean {
  const hidden = usePreference('hiddenLighthouses');
  return useLighthousesStore(
    (s) =>
      lighthouse.channel !== null &&
      Object.values(s.devices).some(
        (other) => other.id !== lighthouse.id && other.channel === lighthouse.channel && !(other.id in hidden),
      ),
  );
}

export function useChannelConflicts(): ChannelConflict[] {
  return findChannelConflicts(useShownLighthouses());
}
