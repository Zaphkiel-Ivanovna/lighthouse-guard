import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

import { createLighthouseClient, type LighthouseClient } from './lighthouse-client';
import { MockBleTransport } from './transport/mock-transport';
import { NitroBleTransport } from './transport/nitro-transport';

export type TransportMode = 'native' | 'mock';

type TransportModeState = { readonly mode: TransportMode };

export const useTransportModeStore = create<TransportModeState>()(
  persist(() => ({ mode: 'native' as TransportMode }), {
    name: 'ble-transport-mode',
    version: 1,
    storage: createJSONStorage(() => mmkvStateStorage),
  }),
);

let cached: { mode: TransportMode; client: LighthouseClient } | null = null;

export function getLighthouseClient(): LighthouseClient {
  const { mode } = useTransportModeStore.getState();
  if (cached && cached.mode === mode) return cached.client;

  const transport = mode === 'mock' ? new MockBleTransport() : new NitroBleTransport();
  cached = { mode, client: createLighthouseClient(transport) };
  return cached.client;
}

export function setTransportMode(mode: TransportMode): void {
  if (useTransportModeStore.getState().mode === mode) return;
  cached = null;
  useTransportModeStore.setState({ mode });
}
