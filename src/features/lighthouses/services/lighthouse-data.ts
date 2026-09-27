import { getPreference, hideLighthouse, showLighthouse } from '@/core/preferences';

import { useDeviceNamesStore } from '../store/device-names.store';
import { initialGroupsState, uniqueMembers, useGroupsStore } from '../store/groups.store';
import { useLighthousesStore } from '../store/lighthouses.store';
import { useListLayoutStore, type ListLayout } from '../store/list-layout.store';
import type { LighthouseGroup } from '../types';

export type LighthouseData = {
  readonly names: Readonly<Record<string, string>>;
  readonly groups: readonly LighthouseGroup[];
  readonly startupGroupId: string | null;
  readonly stations: Readonly<Record<string, string>>;
  readonly layout: ListLayout;
};

export function knownStations(): Record<string, string> {
  const { devices } = useLighthousesStore.getState();
  return Object.fromEntries(Object.values(devices).map((device) => [device.id, device.name]));
}

export function snapshotLighthouseData(): LighthouseData {
  const { groups, startupGroupId } = useGroupsStore.getState();
  const members = groups.flatMap((group) => group.members.map((member) => [member.id, member.name] as const));
  const { names, factoryNames } = useDeviceNamesStore.getState();
  return {
    names,
    groups,
    startupGroupId,
    stations: {
      ...getPreference('hiddenLighthouses'),
      ...factoryNames,
      ...Object.fromEntries(members),
      ...knownStations(),
    },
    layout: useListLayoutStore.getState().layout,
  };
}

export function restoreLighthouseData(data: LighthouseData): void {
  const factoryNames = Object.fromEntries(
    Object.keys(data.names).flatMap((id) => (data.stations[id] ? [[id, data.stations[id]]] : [])),
  );
  useDeviceNamesStore.setState({ names: { ...data.names }, factoryNames });
  useGroupsStore.setState({
    groups: data.groups.map((group) => ({ ...group, members: uniqueMembers(group.members) })),
    startupGroupId: data.startupGroupId,
    activeGroupId: data.startupGroupId,
  });
  useListLayoutStore.setState({ layout: data.layout });
}

export function adoptStation(id: string, factoryName: string): void {
  const isStale = (otherId: string, name: string | undefined) => otherId !== id && name === factoryName;

  const { names, factoryNames } = useDeviceNamesStore.getState();
  if (names[id] !== undefined && factoryNames[id] === undefined) {
    useDeviceNamesStore.setState({ factoryNames: { ...factoryNames, [id]: factoryName } });
  }
  const staleNameId = Object.keys(factoryNames).find((other) => isStale(other, factoryNames[other]));
  if (staleNameId && names[id] === undefined) {
    const { [staleNameId]: name, ...otherNames } = names;
    const { [staleNameId]: _factoryName, ...otherFactoryNames } = factoryNames;
    useDeviceNamesStore.setState({
      names: name ? { ...otherNames, [id]: name } : otherNames,
      factoryNames: { ...otherFactoryNames, [id]: factoryName },
    });
  }

  const { groups } = useGroupsStore.getState();
  if (groups.some((group) => group.members.some((member) => isStale(member.id, member.name)))) {
    useGroupsStore.setState({
      groups: groups.map((group) => ({
        ...group,
        members: uniqueMembers(
          group.members.map((member) => (isStale(member.id, member.name) ? { ...member, id } : member)),
        ),
      })),
    });
  }

  const hidden = getPreference('hiddenLighthouses');
  const staleHiddenId = Object.keys(hidden).find((other) => isStale(other, hidden[other]));
  if (staleHiddenId) {
    showLighthouse(staleHiddenId);
    hideLighthouse(id, factoryName);
  }
}

export function resetLighthouseData(): void {
  useDeviceNamesStore.setState({ names: {}, factoryNames: {} });
  useGroupsStore.setState(initialGroupsState);
  useListLayoutStore.setState({ layout: 'list' });
}
