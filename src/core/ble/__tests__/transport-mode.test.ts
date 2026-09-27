import { getLighthouseClient, setTransportMode, useTransportModeStore } from '../transport-mode';

describe('transport mode', () => {
  afterEach(() => {
    setTransportMode('native');
  });

  it('keeps the same client, and so the same serial queue, when the mode does not change', () => {
    setTransportMode('mock');
    const client = getLighthouseClient();

    setTransportMode('mock');

    expect(getLighthouseClient()).toBe(client);
  });

  it('keeps a single native client, and so a single native queue, across mode switches', () => {
    const native = getLighthouseClient();

    setTransportMode('mock');
    expect(getLighthouseClient().transportKind).toBe('mock');
    setTransportMode('native');

    expect(useTransportModeStore.getState().mode).toBe('native');
    expect(getLighthouseClient()).toBe(native);
  });

  it('starts the simulated stations afresh each time the simulation is turned on', () => {
    setTransportMode('mock');
    const first = getLighthouseClient();

    setTransportMode('native');
    setTransportMode('mock');

    expect(getLighthouseClient()).not.toBe(first);
  });
});
