import type { PowerState } from '../index';
import { createLighthouseClient, type LighthouseClient } from '../lighthouse-client';
import { LIGHTHOUSE_V2_CHARACTERISTICS, POWER_STATE_BYTE } from '../protocol/constants';
import { MockBleTransport } from '../transport/mock-transport';

const SLEEPING = 'MOCK-LHB-00000001';
const STANDBY = 'MOCK-LHB-00000002';

describe('LighthouseClient (against MockBleTransport)', () => {
  let transport: MockBleTransport;
  let client: LighthouseClient;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    transport = new MockBleTransport({
      latencyMs: 10,
      bootMs: 3_000,
      devices: [
        {
          name: 'LHB-00000001',
          powerByte: POWER_STATE_BYTE.sleep,
          channel: 7,
          information: { firmware: '1.2.3', serial: '00000001', manufacturer: 'Valve' },
        },
        { name: 'LHB-00000002', powerByte: POWER_STATE_BYTE.standby },
      ],
    });
    client = createLighthouseClient(transport);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('reads the power state and disconnects afterwards', async () => {
    const state = client.readPowerState(SLEEPING);
    await jest.advanceTimersByTimeAsync(100);

    await expect(state).resolves.toBe('sleep');
    expect(transport.isConnected(SLEEPING)).toBe(false);
  });

  it('reads the power state and the channel in one session', async () => {
    const status = client.readStatus(SLEEPING);
    await jest.advanceTimersByTimeAsync(100);

    await expect(status).resolves.toEqual({ power: 'sleep', channel: 7 });
    expect(transport.isConnected(SLEEPING)).toBe(false);
  });

  it('reads the channel and the device information in one session', async () => {
    const details = client.readDetails(SLEEPING);
    await jest.advanceTimersByTimeAsync(200);

    await expect(details).resolves.toEqual({
      channel: 7,
      firmware: '1.2.3',
      serial: '00000001',
      manufacturer: 'Valve',
      model: null,
      hardware: null,
    });
    expect(transport.isConnected(SLEEPING)).toBe(false);
  });

  it('reports missing device information as null instead of failing', async () => {
    const details = client.readDetails(STANDBY);
    await jest.advanceTimersByTimeAsync(200);

    await expect(details).resolves.toEqual({
      channel: 1,
      firmware: null,
      serial: null,
      manufacturer: null,
      model: null,
      hardware: null,
    });
  });

  it('fails instead of reporting empty details when nothing can be read', async () => {
    const silent = new MockBleTransport({
      latencyMs: 10,
      devices: [{ name: 'LHB-00000003', powerByte: POWER_STATE_BYTE.sleep, unreadable: true }],
    });
    const details = createLighthouseClient(silent).readDetails('MOCK-LHB-00000003');
    details.catch(() => undefined);
    await jest.advanceTimersByTimeAsync(200);

    await expect(details).rejects.toMatchObject({ code: 'operationFailed' });
    expect(silent.isConnected('MOCK-LHB-00000003')).toBe(false);
  });

  it('turns a sleeping lighthouse on and reports every intermediate state', async () => {
    const updates: PowerState[] = [];
    const result = client.setPower(SLEEPING, 'on', { onUpdate: (state) => updates.push(state) });

    await jest.advanceTimersByTimeAsync(5_000);

    await expect(result).resolves.toBe('on');
    expect(updates[0]).toBe('booting');
    expect(updates.at(-1)).toBe('on');
    expect(transport.isConnected(SLEEPING)).toBe(false);
  });

  it('resolves with the last state read when the target is not reached in time', async () => {
    const result = client.setPower(SLEEPING, 'on', { pollTimeoutMs: 1_000 });

    await jest.advanceTimersByTimeAsync(2_000);

    await expect(result).resolves.toBe('booting');
  });

  it('writes a power command without waiting for the target state', async () => {
    const write = client.writePower(SLEEPING, 'on');
    await jest.advanceTimersByTimeAsync(100);
    await expect(write).resolves.toBeUndefined();
    expect(transport.isConnected(SLEEPING)).toBe(false);

    const state = client.readPowerState(SLEEPING);
    await jest.advanceTimersByTimeAsync(100);
    await expect(state).resolves.toBe('booting');
  });

  it('switches standby → sleep without booting', async () => {
    const result = client.setPower(STANDBY, 'sleep');
    await jest.advanceTimersByTimeAsync(200);

    await expect(result).resolves.toBe('sleep');
  });

  it('rejects with a BleError for an unknown device', async () => {
    const assertion = expect(client.identify('MOCK-NOPE')).rejects.toMatchObject({ code: 'deviceNotFound' });
    await jest.advanceTimersByTimeAsync(100);
    await assertion;
  });

  it('only reports lighthouses while scanning, until aborted', async () => {
    transport.addDevice({ name: 'Headphones', powerByte: 0 });
    const found: string[] = [];
    const controller = new AbortController();

    const scan = client.scan({ signal: controller.signal, onFound: (lighthouse) => found.push(lighthouse.name) });
    await jest.advanceTimersByTimeAsync(100);
    controller.abort();

    await expect(scan).resolves.toBeUndefined();
    expect(found).toEqual(['LHB-00000001', 'LHB-00000002']);
  });

  it('waits for the adapter to power on before scanning', async () => {
    transport.setAdapterState('unknown');
    const found: string[] = [];
    const controller = new AbortController();

    const scan = client.scan({ signal: controller.signal, onFound: (lighthouse) => found.push(lighthouse.name) });
    await jest.advanceTimersByTimeAsync(500);
    expect(found).toEqual([]);

    transport.setAdapterState('poweredOn');
    await jest.advanceTimersByTimeAsync(100);
    controller.abort();

    await expect(scan).resolves.toBeUndefined();
    expect(found).toHaveLength(2);
  });

  it('stops quietly when the scan is cancelled while the adapter is still starting', async () => {
    transport.setAdapterState('unknown');
    const controller = new AbortController();

    const scan = client.scan({ signal: controller.signal, onFound: () => undefined });
    await jest.advanceTimersByTimeAsync(500);
    controller.abort();

    await expect(scan).resolves.toBeUndefined();
  });

  it('keeps the power state it read when the channel read stalls', async () => {
    const read = transport.read.bind(transport);
    jest
      .spyOn(transport, 'read')
      .mockImplementation((id, service, characteristic) =>
        characteristic === LIGHTHOUSE_V2_CHARACTERISTICS.channel
          ? new Promise(() => undefined)
          : read(id, service, characteristic),
      );

    const status = client.readStatus(SLEEPING);
    await jest.advanceTimersByTimeAsync(6_000);

    await expect(status).resolves.toEqual({ power: 'sleep', channel: null });
    expect(transport.isConnected(SLEEPING)).toBe(false);
  });

  it('rejects when the user denies Bluetooth while the scan waits for the adapter', async () => {
    transport.setAdapterState('unknown');
    const assertion = expect(
      client.scan({ signal: new AbortController().signal, onFound: jest.fn() }),
    ).rejects.toMatchObject({
      code: 'unauthorized',
    });

    transport.setAdapterState('unauthorized');
    await jest.advanceTimersByTimeAsync(10);
    await assertion;
  });

  it('refuses to scan when Bluetooth is off', async () => {
    transport.setAdapterState('poweredOff');

    await expect(client.scan({ signal: new AbortController().signal, onFound: jest.fn() })).rejects.toMatchObject({
      code: 'poweredOff',
    });
  });

  it('reports Bluetooth being off instead of timing out when a command needs a connection', async () => {
    transport.setAdapterState('poweredOff');
    const connect = jest.spyOn(transport, 'connect');

    await expect(client.setPower(SLEEPING, 'on')).rejects.toMatchObject({ code: 'poweredOff' });
    await expect(client.identify(SLEEPING)).rejects.toMatchObject({ code: 'poweredOff' });
    expect(connect).not.toHaveBeenCalled();
  });

  it('fails instead of returning partial details when the link drops during the reads', async () => {
    const read = transport.read.bind(transport);
    jest.spyOn(transport, 'read').mockImplementation(async (id, service, characteristic) => {
      const bytes = await read(id, service, characteristic);
      if (characteristic === LIGHTHOUSE_V2_CHARACTERISTICS.channel) transport.dropConnection(id);
      return bytes;
    });

    const details = client.readDetails(SLEEPING);
    details.catch(() => undefined);
    await jest.advanceTimersByTimeAsync(200);

    await expect(details).rejects.toMatchObject({ code: 'operationFailed' });
  });

  it('stops the scan and reports a BleError when the native scan fails to start', async () => {
    jest.spyOn(transport, 'startScan').mockImplementation(() => {
      throw new Error('scan refused');
    });
    const stopScan = jest.spyOn(transport, 'stopScan');
    const controller = new AbortController();
    const removeListener = jest.spyOn(controller.signal, 'removeEventListener');

    await expect(client.scan({ signal: controller.signal, onFound: jest.fn() })).rejects.toMatchObject({
      code: 'operationFailed',
    });
    expect(stopScan).toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function));
  });

  it('stops polling and disconnects when a power command is aborted', async () => {
    const controller = new AbortController();
    const result = client.setPower(SLEEPING, 'on', { signal: controller.signal });
    result.catch(() => undefined);
    await jest.advanceTimersByTimeAsync(100);

    controller.abort();
    await jest.advanceTimersByTimeAsync(100);

    await expect(result).rejects.toMatchObject({ code: 'aborted' });
    expect(transport.isConnected(SLEEPING)).toBe(false);
  });

  it('reports Bluetooth turned off in the middle of a command', async () => {
    const result = client.setPower(SLEEPING, 'on');
    result.catch(() => undefined);
    await jest.advanceTimersByTimeAsync(100);

    transport.setAdapterState('poweredOff');
    await jest.advanceTimersByTimeAsync(2_000);

    await expect(result).rejects.toMatchObject({ code: 'poweredOff' });
    expect(transport.isConnected(SLEEPING)).toBe(false);
  });

  it('waits for a resetting adapter before connecting', async () => {
    transport.setAdapterState('resetting');
    const state = client.readPowerState(SLEEPING);
    await jest.advanceTimersByTimeAsync(500);

    transport.setAdapterState('poweredOn');
    await jest.advanceTimersByTimeAsync(100);

    await expect(state).resolves.toBe('sleep');
  });

  it('gives up without connecting when the adapter never settles', async () => {
    transport.setAdapterState('unknown');
    const connect = jest.spyOn(transport, 'connect');
    const state = client.readPowerState(SLEEPING);
    state.catch(() => undefined);

    await jest.advanceTimersByTimeAsync(10_000);

    await expect(state).rejects.toMatchObject({ code: 'unknown' });
    expect(connect).not.toHaveBeenCalled();
  });
});
