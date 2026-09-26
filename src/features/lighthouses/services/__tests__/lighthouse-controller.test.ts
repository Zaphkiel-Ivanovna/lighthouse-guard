import { setTransportMode } from '@/core/ble';

import { initialLighthousesState, useLighthousesStore } from '../../store/lighthouses.store';
import { setPower, startScan, stopScan } from '../lighthouse-controller';

const SLEEPING = 'MOCK-LHB-1A2B3C4D';

describe('lighthouse controller (debug mode)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setTransportMode('mock');
    useLighthousesStore.setState(initialLighthousesState, true);
  });

  afterEach(() => {
    stopScan();
    setTransportMode('native');
    jest.useRealTimers();
  });

  it('discovers the simulated lighthouses and reads their power state', async () => {
    const scan = startScan();
    expect(useLighthousesStore.getState().scan.status).toBe('scanning');

    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    const { devices, scan: status } = useLighthousesStore.getState();
    expect(status).toEqual({ status: 'idle', error: null });
    expect(Object.values(devices).map((d) => [d.name, d.state])).toEqual([
      ['LHB-1A2B3C4D', 'sleep'],
      ['LHB-5E6F7A8B', 'standby'],
      ['LHB-9C0D1E2F', 'on'],
    ]);
  });

  it('tracks a power command until the lighthouse is on', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    const command = setPower(SLEEPING, 'on');
    expect(useLighthousesStore.getState().commands[SLEEPING]?.status).toBe('pending');

    await jest.advanceTimersByTimeAsync(10_000);
    await command;

    const state = useLighthousesStore.getState();
    expect(state.devices[SLEEPING]?.state).toBe('on');
    expect(state.commands[SLEEPING]).toEqual({ status: 'idle', error: null });
  });
});
