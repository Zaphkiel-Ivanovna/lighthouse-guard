import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

type DeviceNamesState = {
  /** Custom names keyed by device id. */
  readonly names: Readonly<Record<string, string>>;
};

export const useDeviceNamesStore = create<DeviceNamesState>()(
  persist(() => ({ names: {} as Record<string, string> }), {
    name: 'lighthouse-names',
    version: 1,
    storage: createJSONStorage(() => mmkvStateStorage),
  }),
);

export const MIN_NAME_LENGTH = 2;

export function renameLighthouse(id: string, name: string): void {
  const trimmed = name.trim();
  if (trimmed.length < MIN_NAME_LENGTH) return;
  useDeviceNamesStore.setState((s) => ({ names: { ...s.names, [id]: trimmed } }));
}

export function resetLighthouseName(id: string): void {
  useDeviceNamesStore.setState((s) => {
    const { [id]: _removed, ...names } = s.names;
    return { names };
  });
}

export function clearLighthouseNames(): void {
  useDeviceNamesStore.setState({ names: {} });
}
