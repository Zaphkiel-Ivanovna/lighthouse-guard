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

let nativeClient: LighthouseClient | null = null;
let mockClient: LighthouseClient | null = null;

export function getLighthouseClient(): LighthouseClient {
  if (useTransportModeStore.getState().mode === 'mock') {
    mockClient ??= createLighthouseClient(new MockBleTransport());
    return mockClient;
  }
  nativeClient ??= createLighthouseClient(new NitroBleTransport());
  return nativeClient;
}

export function setTransportMode(mode: TransportMode): void {
  if (useTransportModeStore.getState().mode === mode) return;
  mockClient = null;
  useTransportModeStore.setState({ mode });
}
