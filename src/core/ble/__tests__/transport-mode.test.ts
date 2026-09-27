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

  it('builds a new client when switching modes', () => {
    setTransportMode('mock');
    const mock = getLighthouseClient();

    setTransportMode('native');

    expect(useTransportModeStore.getState().mode).toBe('native');
    expect(getLighthouseClient()).not.toBe(mock);
  });
});
