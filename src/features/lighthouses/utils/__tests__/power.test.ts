import { toggleCommandFor } from '../power';

describe('toggleCommandFor', () => {
  it('puts a running lighthouse to sleep', () => {
    expect(toggleCommandFor('on')).toBe('sleep');
  });

  it.each(['standby', 'sleep', 'unknown'] as const)('turns a %s lighthouse on', (state) => {
    expect(toggleCommandFor(state)).toBe('on');
  });

  it('is disabled while booting', () => {
    expect(toggleCommandFor('booting')).toBeNull();
  });
});
