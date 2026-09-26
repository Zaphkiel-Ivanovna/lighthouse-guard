/** Source of truth for UI copy. Every key must also exist in fr.ts (enforced by `Translations`). */
export const en = {
  common: {
    actions: {
      cancel: 'Cancel',
      save: 'Save',
      reset: 'Reset',
      retry: 'Retry',
    },
  },
  tabs: {
    lighthouses: 'Lighthouses',
    settings: 'Settings',
    faq: 'FAQ',
  },
  lighthouses: {
    list: {
      title: 'Lighthouses',
      scan: 'Scan',
      stopScan: 'Stop',
      scanning: 'Scanning…',
      emptyTitle: 'No lighthouse yet',
      emptyBody: 'Power your SteamVR 2.0 base stations, stay close to them, then start a scan.',
      mockBanner: 'Debug mode: simulated lighthouses',
    },
    state: {
      on: 'On',
      standby: 'Standby',
      sleep: 'Sleep',
      booting: 'Booting',
      unknown: 'Unknown',
    },
    card: {
      a11yLabel: '{{name}}, {{state}}',
      togglePower: 'Toggle power of {{name}}',
    },
    detail: {
      power: 'Power',
      actions: 'Actions',
      identify: 'Identify',
      identifyHint: 'Blinks the LED of this base station',
      rename: 'Rename',
      info: 'Information',
      identifier: 'Identifier',
      signal: 'Signal',
      signalValue: '{{rssi}} dBm',
      notFound: 'This lighthouse is not in the list anymore. Run a new scan.',
    },
    rename: {
      title: 'Rename',
      placeholder: 'Living room – left',
      hint: 'Stored on this phone only.',
      tooShort: 'At least 2 characters.',
    },
  },
  settings: {
    title: 'Settings',
    appearance: {
      title: 'Appearance',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
    },
    debug: {
      title: 'Developer',
      mockMode: 'Simulated lighthouses',
      mockModeHint: 'Replaces Bluetooth with fake base stations. Handy without hardware.',
    },
    data: {
      title: 'Data',
      clearNames: 'Forget custom names',
      clearNamesConfirmTitle: 'Forget all custom names?',
      clearNamesConfirmBody: 'Lighthouses will show their factory name again.',
    },
    about: {
      title: 'About',
      version: 'Version',
    },
  },
  faq: {
    title: 'FAQ',
    items: {
      standbyVsSleep: {
        question: 'What is the difference between Standby and Sleep?',
        answer:
          'Sleep turns off both the rotor and the lasers. Standby only turns off the lasers and keeps the rotor spinning: it wakes up faster, at the cost of a faint background noise.',
      },
      notDetected: {
        question: 'My lighthouse is not detected, what can I do?',
        answer:
          'Power-cycle the base station: unplug it, wait until it is fully off, plug it back in, then scan again once it has restarted.',
      },
      oneConnection: {
        question: 'Why does a command sometimes fail?',
        answer:
          'A base station accepts a single Bluetooth connection. Close SteamVR power management or other apps that may be talking to it, then retry.',
      },
    },
  },
  ble: {
    errors: {
      poweredOff: 'Bluetooth is turned off. Turn it on to reach your lighthouses.',
      unauthorized: 'Bluetooth access is not allowed. Enable it in the system settings.',
      unsupported: 'This device does not support Bluetooth Low Energy.',
      permissionDenied: 'Bluetooth permissions are required to scan for lighthouses.',
      timeout: 'The lighthouse did not answer in time. Move closer and retry.',
      connectionFailed: 'Could not connect to the lighthouse.',
      operationFailed: 'The lighthouse rejected the command.',
      deviceNotFound: 'Lighthouse not found. Run a new scan.',
      aborted: 'Operation cancelled.',
      unknown: 'Unexpected Bluetooth error.',
    },
  },
} as const;

type DeepStrings<T> = { readonly [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

export type Translations = DeepStrings<typeof en>;
