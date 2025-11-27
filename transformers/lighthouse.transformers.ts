import { Device } from 'react-native-ble-plx';
import {
  LighthouseCapabilitiesAccess,
  LighthouseCapabilityError,
  LighthouseCharacteristicCapabilities,
  LighthouseDevice,
} from '@/types/lighthouse.types';
import { LighthouseState } from '@/types/lighthouse.types';
import { LighthouseMetadata } from '@/types/lighthouse.types';

export function transformLighthouse(
  device: Device,
  state: LighthouseState,
  metadata: LighthouseMetadata
): LighthouseDevice {
  return {
    ...device,
    ...metadata,
    state,
    canControl: ![LighthouseState.ERROR, LighthouseState.BOOTING].includes(
      state
    ),
  } as LighthouseDevice;
}

export const transformLighthouseCapabilities = (
  capabilities: LighthouseCharacteristicCapabilities
): LighthouseCapabilityError[] => {
  const errors: LighthouseCapabilityError[] = [];

  // LIGHTHOUSE_V2_POWER_CHARACTERISTIC - Requires READ and WRITE (critical)
  const powerMissing: LighthouseCapabilitiesAccess[] = [];
  if (capabilities.power.canRead)
    powerMissing.push(LighthouseCapabilitiesAccess.READ);
  if (!capabilities.power.canWrite)
    powerMissing.push(LighthouseCapabilitiesAccess.WRITE);
  if (powerMissing.length > 0) {
    errors.push({
      characteristic: 'Power Control',
      missingCapabilities: powerMissing,
      severity: 'critical',
    });
  }

  // LIGHTHOUSE_V2_IDENTIFY_CHARACTERISTIC - Requires WRITE (warning)
  if (!capabilities.identify.canWrite) {
    errors.push({
      characteristic: 'Identify (LED Blink)',
      missingCapabilities: [LighthouseCapabilitiesAccess.WRITE],
      severity: 'warning',
    });
  }

  // Device Info Service characteristics - Require READ (warning)
  if (!capabilities.firmwareRevision.canRead) {
    errors.push({
      characteristic: 'Firmware Revision',
      missingCapabilities: [LighthouseCapabilitiesAccess.READ],
      severity: 'warning',
    });
  }

  if (!capabilities.modelNumber.canRead) {
    errors.push({
      characteristic: 'Model Number',
      missingCapabilities: [LighthouseCapabilitiesAccess.READ],
      severity: 'warning',
    });
  }

  if (!capabilities.manufacturerName.canRead) {
    errors.push({
      characteristic: 'Manufacturer Name',
      missingCapabilities: [LighthouseCapabilitiesAccess.READ],
      severity: 'warning',
    });
  }

  if (!capabilities.serialNumber.canRead) {
    errors.push({
      characteristic: 'Serial Number',
      missingCapabilities: [LighthouseCapabilitiesAccess.READ],
      severity: 'warning',
    });
  }

  return errors;
};
