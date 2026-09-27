import { toggleCommandFor } from '../power';

describe('toggleCommandFor', () => {
  it('puts a running lighthouse to sleep', () => {
    expect(toggleCommandFor('on')).toBe('sleep');
  });

  it.each(['standby', 'sleep', 'unknown'] as const)('turns a %s lighthouse on', (state) => {
    expect(toggleCommandFor(state)).toBe('on');
  });

  it('can put a booting lighthouse back to sleep instead of locking the control', () => {
    expect(toggleCommandFor('booting')).toBe('sleep');
  });

  it('turns a running lighthouse off with the preferred mode', () => {
    expect(toggleCommandFor('on', 'standby')).toBe('standby');
    expect(toggleCommandFor('standby', 'standby')).toBe('on');
  });
});
