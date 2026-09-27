import {
  DEFAULT_PREFERENCES,
  LANGUAGE_PREFERENCES,
  OFF_MODES,
  replacePreferences,
  SCAN_DURATIONS,
  SORT_ORDERS,
  usePreferencesStore,
  type Preferences,
} from '@/core/preferences';
import {
  restoreLighthouseData,
  snapshotLighthouseData,
  type GroupMember,
  type LighthouseData,
  type LighthouseGroup,
  type ListLayout,
} from '@/features/lighthouses';
import {
  DEFAULT_ACCENT,
  getAppearance,
  isAccentName,
  isThemePreference,
  setAccent,
  setThemePreference,
  type AccentName,
  type ThemePreference,
} from '@/theme';

export const BACKUP_APP = 'lighthouse-guard';
export const BACKUP_VERSION = 1;

export type Backup = {
  readonly app: typeof BACKUP_APP;
  readonly version: typeof BACKUP_VERSION;
  readonly exportedAt: string;
  readonly lighthouses: LighthouseData;
  readonly preferences: Preferences;
  readonly appearance: { readonly theme: ThemePreference; readonly accent: AccentName };
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringRecord = (value: unknown): Record<string, string> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
      )
    : {};

const oneOf = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const member = (value: unknown): GroupMember | null =>
  isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string'
    ? { id: value.id, name: value.name }
    : null;

const group = (value: unknown): LighthouseGroup | null => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  const members = Array.isArray(value.members) ? value.members.map(member).filter((item) => item !== null) : [];
  return { id: value.id, name: value.name, members };
};

const lighthouseData = (value: UnknownRecord): LighthouseData => {
  const groups = Array.isArray(value.groups) ? value.groups.map(group).filter((item) => item !== null) : [];
  const startup = typeof value.startupGroupId === 'string' ? value.startupGroupId : null;
  return {
    names: stringRecord(value.names),
    groups,
    startupGroupId: groups.some((item) => item.id === startup) ? startup : null,
    stations: stringRecord(value.stations),
    layout: oneOf<ListLayout>(value.layout, ['list', 'grid'], 'list'),
  };
};

const preferences = (value: unknown): Preferences => {
  const source = isRecord(value) ? value : {};
  const flag = (key: keyof Preferences) =>
    typeof source[key] === 'boolean' ? (source[key] as boolean) : (DEFAULT_PREFERENCES[key] as boolean);
  return {
    offMode: oneOf(source.offMode, OFF_MODES, DEFAULT_PREFERENCES.offMode),
    confirmTurnOffAll: flag('confirmTurnOffAll'),
    haptics: flag('haptics'),
    autoScanOnLaunch: flag('autoScanOnLaunch'),
    refreshOnForeground: flag('refreshOnForeground'),
    scanDurationSeconds: oneOf(source.scanDurationSeconds, SCAN_DURATIONS, DEFAULT_PREFERENCES.scanDurationSeconds),
    hiddenLighthouses: stringRecord(source.hiddenLighthouses),
    sortOrder: oneOf(source.sortOrder, SORT_ORDERS, DEFAULT_PREFERENCES.sortOrder),
    showChannelOnCards: flag('showChannelOnCards'),
    showSignalOnCards: flag('showSignalOnCards'),
    language: oneOf(source.language, LANGUAGE_PREFERENCES, DEFAULT_PREFERENCES.language),
    launchAnimation: flag('launchAnimation'),
  };
};

export function createBackup(now: Date = new Date()): Backup {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    lighthouses: snapshotLighthouseData(),
    preferences: usePreferencesStore.getState(),
    appearance: getAppearance(),
  };
}

export function parseBackup(text: string): Backup | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(value) || value.app !== BACKUP_APP || value.version !== BACKUP_VERSION) return null;
  if (!isRecord(value.lighthouses)) return null;
  const appearance = isRecord(value.appearance) ? value.appearance : {};
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : '',
    lighthouses: lighthouseData(value.lighthouses),
    preferences: preferences(value.preferences),
    appearance: {
      theme: isThemePreference(appearance.theme) ? appearance.theme : 'system',
      accent: isAccentName(appearance.accent) ? appearance.accent : DEFAULT_ACCENT,
    },
  };
}

export function remapBackup(backup: Backup, currentStations: Readonly<Record<string, string>>): Backup {
  const currentIdByName = new Map(Object.entries(currentStations).map(([id, name]) => [name, id]));
  const remap = (id: string) => {
    const factoryName = backup.lighthouses.stations[id];
    return (factoryName && currentIdByName.get(factoryName)) ?? id;
  };
  const remapKeys = (record: Readonly<Record<string, string>>) =>
    Object.fromEntries(Object.entries(record).map(([id, value]) => [remap(id), value]));

  return {
    ...backup,
    lighthouses: {
      ...backup.lighthouses,
      names: remapKeys(backup.lighthouses.names),
      stations: remapKeys(backup.lighthouses.stations),
      groups: backup.lighthouses.groups.map((item) => ({
        ...item,
        members: item.members.map((entry) => ({ ...entry, id: remap(entry.id) })),
      })),
    },
    preferences: { ...backup.preferences, hiddenLighthouses: remapKeys(backup.preferences.hiddenLighthouses) },
  };
}

export function applyBackup(backup: Backup): void {
  restoreLighthouseData(backup.lighthouses);
  replacePreferences(backup.preferences);
  setThemePreference(backup.appearance.theme);
  setAccent(backup.appearance.accent);
}

export function backupFileName(backup: Backup): string {
  return `lighthouse-guard-${backup.exportedAt.slice(0, 10)}.json`;
}
