import { BleNitro, BLEState } from 'react-native-ble-nitro';

import { NitroBleTransport } from '../nitro-transport';

function createFakeManager() {
  let connected = false;
  let resolveConnect: () => void = () => undefined;
  const manager = {
    connect: jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveConnect = () => {
            connected = true;
            resolve('LHB');
          };
        }),
    ),
    getServicesWithCharacteristics: jest.fn(() => Promise.resolve([])),
    disconnect: jest.fn(() => {
      if (!connected) return Promise.reject(new Error('Device not connected'));
      connected = false;
      return Promise.resolve('LHB');
    }),
    isConnected: jest.fn(() => connected),
    stateListener: null as ((state: BLEState) => void) | null,
    unsubscribeFromStateChange: jest.fn(() => {
      manager.stateListener = null;
    }),
    subscribeToStateChange: jest.fn((listener: (state: BLEState) => void) => {
      manager.stateListener = listener;
      return { remove: () => manager.unsubscribeFromStateChange() };
    }),
  };
  return { manager, finishConnect: () => resolveConnect(), isConnected: () => connected };
}

describe('NitroBleTransport', () => {
  it('refuses a second connection while the first one is still pending natively', async () => {
    const fake = createFakeManager();
    jest.mocked(BleNitro.instance).mockReturnValue(fake.manager as never);
    const transport = new NitroBleTransport();

    const first = transport.connect('LHB');
    await expect(transport.connect('LHB')).rejects.toMatchObject({ code: 'connectionFailed' });

    fake.finishConnect();
    await expect(first).resolves.toBeUndefined();
    expect(fake.manager.connect).toHaveBeenCalledTimes(1);
  });

  it('cancels a connection still pending natively when the session is torn down', async () => {
    const fake = createFakeManager();
    jest.mocked(BleNitro.instance).mockReturnValue(fake.manager as never);
    const transport = new NitroBleTransport();

    const connecting = transport.connect('LHB');
    connecting.catch(() => undefined);
    await transport.disconnect('LHB');

    expect(fake.manager.disconnect).toHaveBeenCalledWith('LHB');
  });

  it('does not ask the native side to disconnect when there is no link and no pending connection', async () => {
    const fake = createFakeManager();
    jest.mocked(BleNitro.instance).mockReturnValue(fake.manager as never);
    const transport = new NitroBleTransport();

    await expect(transport.disconnect('LHB')).resolves.toBeUndefined();
    expect(fake.manager.disconnect).not.toHaveBeenCalled();
  });

  it('only disconnects again after an abandoned connection that actually succeeded', async () => {
    const fake = createFakeManager();
    fake.manager.connect.mockImplementationOnce(() => Promise.reject(new Error('Connection cancelled')));
    jest.mocked(BleNitro.instance).mockReturnValue(fake.manager as never);
    const transport = new NitroBleTransport();

    const connecting = transport.connect('LHB');
    await transport.disconnect('LHB');
    await expect(connecting).rejects.toMatchObject({ code: 'connectionFailed' });

    expect(fake.manager.disconnect).toHaveBeenCalledTimes(1);
  });

  it('drops a connection that completes after the attempt was abandoned', async () => {
    const fake = createFakeManager();
    jest.mocked(BleNitro.instance).mockReturnValue(fake.manager as never);
    const transport = new NitroBleTransport();

    const connecting = transport.connect('LHB');
    await transport.disconnect('LHB');
    fake.finishConnect();

    await expect(connecting).rejects.toMatchObject({ code: 'aborted' });
    expect(fake.isConnected()).toBe(false);
    expect(fake.manager.getServicesWithCharacteristics).not.toHaveBeenCalled();
  });

  it('discovers services and characteristics on a normal connect', async () => {
    const fake = createFakeManager();
    jest.mocked(BleNitro.instance).mockReturnValue(fake.manager as never);
    const transport = new NitroBleTransport();

    const connecting = transport.connect('LHB');
    fake.finishConnect();

    await expect(connecting).resolves.toBeUndefined();
    expect(fake.manager.getServicesWithCharacteristics).toHaveBeenCalledWith('LHB');
    expect(fake.isConnected()).toBe(true);
  });

  it('keeps every adapter listener alive until the last one unsubscribes', () => {
    const fake = createFakeManager();
    jest.mocked(BleNitro.instance).mockReturnValue(fake.manager as never);
    const transport = new NitroBleTransport();
    const first = jest.fn();
    const second = jest.fn();

    const stopFirst = transport.onAdapterStateChange(first);
    const stopSecond = transport.onAdapterStateChange(second);
    stopFirst();
    stopFirst();
    fake.manager.stateListener?.(BLEState.PoweredOn);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('poweredOn');
    expect(fake.manager.subscribeToStateChange).toHaveBeenCalledTimes(1);
    expect(fake.manager.unsubscribeFromStateChange).not.toHaveBeenCalled();

    stopSecond();
    expect(fake.manager.unsubscribeFromStateChange).toHaveBeenCalledTimes(1);
  });
});
