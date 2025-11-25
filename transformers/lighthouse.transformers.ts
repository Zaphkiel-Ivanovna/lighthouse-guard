import { Device } from 'react-native-ble-plx';
import { LighthouseDevice } from '../types/lighthouse.types';
import { LighthouseState } from '../types/lighthouse.types';
import { LighthouseMetadata } from '../types/lighthouse.types';

export function transformLighthouse(
  device: Device,
  state: LighthouseState,
  metadata: LighthouseMetadata
): LighthouseDevice {
  return {
    ...device,
    ...metadata,
    state,
    canControl: ![
      LighthouseState.UNKNOWN,
      LighthouseState.ERROR,
      LighthouseState.BOOTING,
    ].includes(state),
  } as LighthouseDevice;
}
