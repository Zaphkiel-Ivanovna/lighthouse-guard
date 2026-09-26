import type { PowerCommand, PowerState } from '@/core/ble';

/** Command sent by the quick toggle on a lighthouse card; `null` while the state is transitional. */
export function toggleCommandFor(state: PowerState): PowerCommand | null {
  switch (state) {
    case 'on':
      return 'sleep';
    case 'booting':
      return null;
    case 'standby':
    case 'sleep':
    case 'unknown':
      return 'on';
  }
}
