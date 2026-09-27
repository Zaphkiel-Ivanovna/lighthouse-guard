import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

type DeviceNamesState = {
  readonly names: Readonly<Record<string, string>>;
  readonly factoryNames: Readonly<Record<string, string>>;
};

export const useDeviceNamesStore = create<DeviceNamesState>()(
  persist((): DeviceNamesState => ({ names: {}, factoryNames: {} }), {
    name: 'lighthouse-names',
    version: 2,
    storage: createJSONStorage(() => mmkvStateStorage),
    migrate: (persisted) => ({
      names: (persisted as Partial<DeviceNamesState> | undefined)?.names ?? {},
      factoryNames: {},
    }),
  }),
);

export const MIN_NAME_LENGTH = 2;

export function renameLighthouse(id: string, name: string, factoryName?: string): void {
  const trimmed = name.trim();
  if (trimmed.length < MIN_NAME_LENGTH) return;
  useDeviceNamesStore.setState((s) => ({
    names: { ...s.names, [id]: trimmed },
    factoryNames: factoryName ? { ...s.factoryNames, [id]: factoryName } : s.factoryNames,
  }));
}

export function resetLighthouseName(id: string): void {
  useDeviceNamesStore.setState((s) => {
    const { [id]: _name, ...names } = s.names;
    const { [id]: _factoryName, ...factoryNames } = s.factoryNames;
    return { names, factoryNames };
  });
}

export function clearLighthouseNames(): void {
  useDeviceNamesStore.setState({ names: {}, factoryNames: {} });
}
