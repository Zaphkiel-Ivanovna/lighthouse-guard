import type { PowerState } from '../index';
import { createLighthouseClient, type LighthouseClient } from '../lighthouse-client';
import { POWER_STATE_BYTE } from '../protocol/constants';
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
        { name: 'LHB-00000001', powerByte: POWER_STATE_BYTE.sleep },
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
});
