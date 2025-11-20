export const rssiToSignalStrength = (
  rssi: number | null | undefined
): number => {
  if (rssi == null) {
    return 0;
  }

  if (rssi >= -50) {
    return 5;
  } else if (rssi >= -60) {
    return 4;
  } else if (rssi >= -70) {
    return 3;
  } else if (rssi >= -80) {
    return 2;
  } else if (rssi >= -90) {
    return 1;
  } else {
    return 0;
  }
};

export const getSignalStrengthLabel = (signalLevel: number): string => {
  switch (signalLevel) {
    case 5:
      return 'Excellent';
    case 4:
      return 'Good';
    case 3:
      return 'Fair';
    case 2:
      return 'Weak';
    case 1:
      return 'Very Weak';
    case 0:
    default:
      return 'No Signal';
  }
};

export const getSignalInfo = (rssi: number | null | undefined) => {
  const level = rssiToSignalStrength(rssi);
  return {
    level,
    label: getSignalStrengthLabel(level),
    rssi: rssi ?? null,
  };
};
