import { BleManager, Device } from 'react-native-ble-plx';
import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import {
  LighthouseService,
  PollingState,
} from '../services/lighthouse.service';
import { MockLighthouseService } from '../services/mock-lighthouse.service';
import {
  DeviceCommandStates,
  LighthouseDevice,
  LighthousePowerCommand,
  LighthouseState,
  LighthouseMetadata,
} from '../types/lighthouse.types';
import { Logger } from '../utils/logger';
import { requestBLEPermissions } from '../utils/permissions';
import { useSettingsStore } from './settings.store';
import { transformLighthouse } from 'transformers/lighthouse.transformers';
import { Platform } from 'react-native';

const logger = new Logger('LighthouseStore');

const storage = createMMKV();
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

interface LighthouseStoreState {
  bleManager: BleManager;
  lighthouseService: LighthouseService;
  mockLighthouseService: MockLighthouseService;
  devices: Record<string, LighthouseDevice>;
  isScanning: boolean;
  scanTimeoutId: number | null;
  error: string | null;
  commandStates: DeviceCommandStates;
  pollingStates: Record<string, PollingState>;
  processingDevices: Set<string>;

  customDeviceNames: Record<string, string>;

  getDeviceById: (deviceId: string) => LighthouseDevice | undefined;
  getDeviceDisplayName: (deviceId: string) => string;
  setCustomDeviceName: (deviceId: string, customName: string) => void;
  clearCustomDeviceName: (deviceId: string) => void;
  setError: (error: string | null) => void;
  setCommandLoading: (
    deviceId: string,
    isLoading: boolean,
    error?: string
  ) => void;
  addOrUpdateDevice: (device: Device) => Promise<void>;
  updateDeviceInfos: (
    deviceId: string,
    state: LighthouseState,
    metadata?: LighthouseMetadata
  ) => void;
  clearDevices: () => void;
  startScan: () => void;
  stopScan: () => void;
  sendPowerCommand: (
    deviceId: string,
    command: LighthousePowerCommand
  ) => Promise<void>;
  identifyDevice: (deviceId: string) => Promise<void>;
  startPolling: (deviceId: string, targetState?: LighthouseState) => void;
  stopPolling: (deviceId: string) => void;
  stopAllPolling: () => void;
  requestPermissions: () => Promise<boolean>;
  addFakeDevice: (customName?: string) => Promise<void>;
}

export const useLighthouseStore = create<LighthouseStoreState>()(
  persist(
    (set, get) => {
      const bleManager = new BleManager();
      const lighthouseService = new LighthouseService(bleManager);
      const mockLighthouseService = new MockLighthouseService();

      return {
        bleManager,
        lighthouseService,
        mockLighthouseService,
        devices: {},
        isScanning: false,
        scanTimeoutId: null,
        error: null,
        commandStates: {},
        pollingStates: {},
        processingDevices: new Set<string>(),
        customDeviceNames: {},

        getDeviceById: (deviceId: string) => {
          return get().devices[deviceId];
        },

        getDeviceDisplayName: (deviceId: string) => {
          const customName = get().customDeviceNames[deviceId];
          if (customName) {
            return customName;
          }
          const device = get().devices[deviceId];
          return device?.name || device?.localName || 'Unknown Device';
        },

        setCustomDeviceName: (deviceId: string, customName: string) => {
          set((state) => ({
            customDeviceNames: {
              ...state.customDeviceNames,
              [deviceId]: customName,
            },
          }));
        },

        clearCustomDeviceName: (deviceId: string) => {
          set((state) => {
            const newCustomNames = { ...state.customDeviceNames };
            delete newCustomNames[deviceId];
            return { customDeviceNames: newCustomNames };
          });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        setCommandLoading: (
          deviceId: string,
          isLoading: boolean,
          error?: string
        ) => {
          set((state) => ({
            commandStates: {
              ...state.commandStates,
              [deviceId]: { isLoading, error },
            },
          }));
        },

        addOrUpdateDevice: async (device: Device) => {
          const {
            devices,
            processingDevices,
            lighthouseService,
            mockLighthouseService,
          } = get();
          const isDebugMode = useSettingsStore.getState().isDebugMode;
          const service = !isDebugMode
            ? lighthouseService
            : mockLighthouseService;

          if (processingDevices.has(device.id)) return;

          const existingDevice = devices[device.id];
          if (!existingDevice) {
            const lighthouseDevice = Object.assign(device, {
              state: LighthouseState.UNKNOWN,
              canControl: false,
            }) as LighthouseDevice;

            set((state) => ({
              devices: {
                ...state.devices,
                [device.id]: lighthouseDevice,
              },
            }));
          }

          processingDevices.add(device.id);

          try {
            const { state, metadata } = await service.processDevice(device);
            get().updateDeviceInfos(device.id, state, metadata);
          } catch (error) {
            logger.error('Failed to get lighthouse status:', error);
          } finally {
            processingDevices.delete(device.id);
          }
        },

        updateDeviceInfos: (
          deviceId: string,
          state: LighthouseState,
          metadata?: LighthouseMetadata
        ) => {
          set((currentState) => {
            const device = currentState.devices[deviceId];
            if (!device) return {};

            return {
              devices: {
                ...currentState.devices,
                [deviceId]: transformLighthouse(
                  device,
                  state,
                  metadata ?? {
                    firmwareRevision: device.firmwareRevision,
                    modelNumber: device.modelNumber,
                    manufacturerName: device.manufacturerName,
                    serialNumber: device.serialNumber,
                  }
                ),
              },
            };
          });
        },

        clearDevices: () => {
          set({ devices: {} });
        },

        startScan: () => {
          logger.debug('Starting scan');

          if (Platform.OS === 'android') {
            const granted = requestBLEPermissions();
            if (!granted) {
              logger.error('BLE permissions not granted');
              return;
            }
          }

          const {
            lighthouseService,
            mockLighthouseService,
            addOrUpdateDevice,
            stopScan,
            scanTimeoutId,
            processingDevices,
          } = get();

          const isDebugMode = useSettingsStore.getState().isDebugMode;
          const service = isDebugMode
            ? mockLighthouseService
            : lighthouseService;

          if (scanTimeoutId) {
            clearTimeout(scanTimeoutId);
          }

          processingDevices.clear();
          set({ devices: {}, isScanning: true, error: null });

          const existingDeviceIds = new Set(Object.keys(get().devices));

          service.startDeviceScan(
            addOrUpdateDevice,
            (errorMsg) => set({ error: errorMsg }),
            () => set({ isScanning: false, scanTimeoutId: null }),
            processingDevices,
            existingDeviceIds
          );

          const timeoutId = setTimeout(stopScan, service.getScanTimeout());
          set({ scanTimeoutId: timeoutId });
        },

        stopScan: () => {
          const { lighthouseService, mockLighthouseService, scanTimeoutId } =
            get();
          const isDebugMode = useSettingsStore.getState().isDebugMode;
          const service = isDebugMode
            ? mockLighthouseService
            : lighthouseService;

          if (scanTimeoutId) {
            clearTimeout(scanTimeoutId);
          }

          service.stopDeviceScan();
          set({ isScanning: false, scanTimeoutId: null });
        },

        sendPowerCommand: async (
          deviceId: string,
          command: LighthousePowerCommand
        ) => {
          const {
            lighthouseService,
            mockLighthouseService,
            setCommandLoading,
            startPolling,
          } = get();
          const isDebugMode = useSettingsStore.getState().isDebugMode;
          const service = isDebugMode
            ? mockLighthouseService
            : lighthouseService;

          setCommandLoading(deviceId, true);

          try {
            const targetState = await service.sendPowerCommand(
              deviceId,
              command
            );
            startPolling(deviceId, targetState);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error sending power command:', error);
            setCommandLoading(deviceId, false, errorMessage);
            throw error;
          }
        },

        identifyDevice: async (deviceId: string) => {
          const {
            lighthouseService,
            mockLighthouseService,
            setCommandLoading,
          } = get();
          const isDebugMode = useSettingsStore.getState().isDebugMode;
          const service = isDebugMode
            ? mockLighthouseService
            : lighthouseService;

          setCommandLoading(deviceId, true);

          try {
            await service.identifyDevice(deviceId);
            setCommandLoading(deviceId, false);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error sending identify command:', error);
            setCommandLoading(deviceId, false, errorMessage);
            throw error;
          }
        },

        startPolling: (deviceId: string, targetState?: LighthouseState) => {
          const {
            stopPolling,
            lighthouseService,
            mockLighthouseService,
            updateDeviceInfos,
          } = get();
          const isDebugMode = useSettingsStore.getState().isDebugMode;
          const service = isDebugMode
            ? mockLighthouseService
            : lighthouseService;

          stopPolling(deviceId);

          const pollStatus = async () => {
            const { pollingStates } = get();
            const pollingState = pollingStates[deviceId];

            if (!pollingState) {
              return;
            }

            if (service.hasPollingTimedOut(pollingState.startTime)) {
              logger.warn(`Polling timeout for device ${deviceId}`);
              stopPolling(deviceId);
              return;
            }

            try {
              const newState = await service.pollDeviceStatus(
                deviceId,
                targetState
              );
              updateDeviceInfos(deviceId, newState, undefined);

              if (targetState && newState === targetState) {
                stopPolling(deviceId);
              }
            } catch (error) {
              logger.error(`Error polling device ${deviceId}:`, error);
            }
          };

          pollStatus();

          const intervalId = setInterval(
            pollStatus,
            service.getPollingInterval()
          );

          set((state) => ({
            pollingStates: {
              ...state.pollingStates,
              [deviceId]: {
                intervalId,
                targetState,
                startTime: Date.now(),
              },
            },
          }));
        },

        stopPolling: async (deviceId: string) => {
          const { pollingStates, lighthouseService, mockLighthouseService } =
            get();
          const isDebugMode = useSettingsStore.getState().isDebugMode;
          const service = isDebugMode
            ? mockLighthouseService
            : lighthouseService;
          const pollingState = pollingStates[deviceId];

          if (!pollingState) {
            return;
          }

          clearInterval(pollingState.intervalId);

          set((state) => {
            const newPollingStates = { ...state.pollingStates };
            delete newPollingStates[deviceId];

            const newCommandStates = { ...state.commandStates };
            if (newCommandStates[deviceId]) {
              newCommandStates[deviceId] = { isLoading: false };
            }

            return {
              pollingStates: newPollingStates,
              commandStates: newCommandStates,
            };
          });

          await service.disconnectDevice(deviceId);

          logger.debug(`Stopped polling for device ${deviceId}`);
        },

        stopAllPolling: () => {
          const { pollingStates, commandStates } = get();

          Object.values(pollingStates).forEach((state) => {
            clearInterval(state.intervalId);
          });

          const newCommandStates = { ...commandStates };
          Object.keys(pollingStates).forEach((deviceId) => {
            if (newCommandStates[deviceId]) {
              newCommandStates[deviceId] = { isLoading: false };
            }
          });

          set({
            pollingStates: {},
            commandStates: newCommandStates,
          });

          logger.debug('Stopped all polling');
        },

        addFakeDevice: async (customName?: string) => {
          const { mockLighthouseService, addOrUpdateDevice } = get();
          const isDebugMode = useSettingsStore.getState().isDebugMode;

          if (!isDebugMode) {
            logger.warn('Cannot add fake device when debug mode is disabled');
            return;
          }

          const fakeDevice = mockLighthouseService.createFakeDevice(customName);
          await addOrUpdateDevice(fakeDevice);
          logger.info(`Added fake device: ${fakeDevice.name}`);
        },

        requestPermissions: requestBLEPermissions,
      };
    },
    {
      name: 'lighthouse-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state: LighthouseStoreState) => ({
        customDeviceNames: state.customDeviceNames,
      }),
    }
  )
);
