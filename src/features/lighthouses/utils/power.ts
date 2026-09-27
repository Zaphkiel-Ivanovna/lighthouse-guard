import type { PowerCommand, PowerState } from '@/core/ble';
import type { OffMode } from '@/core/preferences';

export function toggleCommandFor(state: PowerState, offMode: OffMode = 'sleep'): PowerCommand {
  switch (state) {
    case 'on':
    case 'booting':
      return offMode;
    case 'standby':
    case 'sleep':
    case 'unknown':
      return 'on';
  }
}
