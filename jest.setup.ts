import 'react-native-unistyles/mocks';
import './src/theme/unistyles';
import './src/core/i18n';

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated/src/initializers', () => ({ initializeReanimatedModule: jest.fn() }));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('expo-alternate-app-icons', () => ({
  supportsAlternateIcons: true,
  getAppIconName: jest.fn(() => null),
  setAlternateAppIcon: jest.fn(async (name: string | null) => name),
  resetAppIcon: jest.fn(async () => undefined),
}));

jest.mock('react-native-ble-nitro', () => ({
  BleNitro: { instance: jest.fn(() => ({})) },
  BLEState: {
    Unknown: 'Unknown',
    Resetting: 'Resetting',
    Unsupported: 'Unsupported',
    Unauthorized: 'Unauthorized',
    PoweredOff: 'PoweredOff',
    PoweredOn: 'PoweredOn',
  },
}));
