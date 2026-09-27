import type { Lighthouse } from '../types';

export type ChannelConflict = {
  readonly channel: number;
  readonly lighthouses: readonly Lighthouse[];
};

export function findChannelConflicts(lighthouses: readonly Lighthouse[]): ChannelConflict[] {
  const byChannel = new Map<number, Lighthouse[]>();
  for (const lighthouse of lighthouses) {
    if (lighthouse.channel === null) continue;
    byChannel.set(lighthouse.channel, [...(byChannel.get(lighthouse.channel) ?? []), lighthouse]);
  }
  return [...byChannel.entries()]
    .filter(([, sharing]) => sharing.length > 1)
    .map(([channel, sharing]) => ({ channel, lighthouses: sharing }))
    .sort((a, b) => a.channel - b.channel);
}
