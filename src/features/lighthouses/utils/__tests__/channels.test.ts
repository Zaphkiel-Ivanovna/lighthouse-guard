import type { Lighthouse } from '../../types';
import { findChannelConflicts } from '../channels';

const lighthouse = (id: string, channel: number | null): Lighthouse => ({
  id,
  name: id,
  state: 'on',
  rssi: -60,
  channel,
});

describe('findChannelConflicts', () => {
  it('reports channels shared by several stations', () => {
    const conflicts = findChannelConflicts([
      lighthouse('a', 3),
      lighthouse('b', 1),
      lighthouse('c', 3),
      lighthouse('d', null),
    ]);

    expect(conflicts).toEqual([{ channel: 3, lighthouses: [lighthouse('a', 3), lighthouse('c', 3)] }]);
  });

  it('ignores stations whose channel is unknown', () => {
    expect(findChannelConflicts([lighthouse('a', null), lighthouse('b', null)])).toEqual([]);
  });
});
