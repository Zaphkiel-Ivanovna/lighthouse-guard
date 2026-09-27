import type { PowerState } from '@/core/ble';
import type { SortOrder } from '@/core/preferences';

import type { Lighthouse } from '../types';

const STATE_RANK: Record<PowerState, number> = { on: 0, booting: 1, standby: 2, sleep: 3, unknown: 4 };

export function sortLighthouses(
  lighthouses: readonly Lighthouse[],
  order: SortOrder,
  nameOf: (lighthouse: Lighthouse) => string,
): Lighthouse[] {
  const byName = (a: Lighthouse, b: Lighthouse) => nameOf(a).localeCompare(nameOf(b));
  const compare = {
    name: byName,
    state: (a: Lighthouse, b: Lighthouse) => STATE_RANK[a.state] - STATE_RANK[b.state] || byName(a, b),
    signal: (a: Lighthouse, b: Lighthouse) => b.rssi - a.rssi || byName(a, b),
  }[order];
  return [...lighthouses].sort(compare);
}
