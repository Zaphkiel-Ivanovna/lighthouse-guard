// Unistyles: the Babel plugin is disabled under NODE_ENV=test; the mocks resolve theme functions.
import 'react-native-unistyles/mocks';
import './src/theme/unistyles';
import './src/core/i18n';

// Native BLE is never exercised in Jest: tests use MockBleTransport.
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
