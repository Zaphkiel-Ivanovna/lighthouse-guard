import { DEFAULT_PREFERENCES, setPreference, usePreferencesStore } from '@/core/preferences';
import { restoreLighthouseData, snapshotLighthouseData } from '@/features/lighthouses';

import { applyBackup, BACKUP_APP, createBackup, parseBackup, remapBackup, type Backup } from '../backup';

const DATA = {
  names: { 'old-left': 'Living room left' },
  groups: [{ id: 'g1', name: 'Living room', members: [{ id: 'old-left', name: 'LHB-1A2B3C4D' }] }],
  startupGroupId: 'g1',
  stations: { 'old-left': 'LHB-1A2B3C4D', 'old-right': 'LHB-5E6F7A8B' },
  layout: 'grid' as const,
};

describe('backup', () => {
  beforeEach(() => {
    usePreferencesStore.setState(DEFAULT_PREFERENCES, true);
    restoreLighthouseData({ names: {}, groups: [], startupGroupId: null, stations: {}, layout: 'list' });
  });

  it('round-trips names, groups and preferences through JSON', () => {
    restoreLighthouseData(DATA);
    setPreference('offMode', 'standby');

    const parsed = parseBackup(JSON.stringify(createBackup(new Date('2026-09-27T10:00:00Z'))));

    expect(parsed?.exportedAt).toBe('2026-09-27T10:00:00.000Z');
    expect(parsed?.lighthouses).toMatchObject({ names: DATA.names, groups: DATA.groups, layout: 'grid' });
    expect(parsed?.preferences.offMode).toBe('standby');
  });

  it('rejects files that are not a Lighthouse Guard backup', () => {
    expect(parseBackup('not json')).toBeNull();
    expect(parseBackup(JSON.stringify({ app: 'other', version: 1 }))).toBeNull();
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: 99, lighthouses: {} }))).toBeNull();
  });

  it('drops invalid values instead of trusting the file', () => {
    const parsed = parseBackup(
      JSON.stringify({
        app: BACKUP_APP,
        version: 1,
        lighthouses: { names: { a: 'Left', b: 42 }, groups: [{ id: 'g', name: 'G', members: [{ id: 1 }] }] },
        preferences: { offMode: 'explode', scanDurationSeconds: 7, haptics: false },
        appearance: { theme: 'neon', accent: 'pink' },
      }),
    );

    expect(parsed?.lighthouses.names).toEqual({ a: 'Left' });
    expect(parsed?.lighthouses.groups).toEqual([{ id: 'g', name: 'G', members: [] }]);
    expect(parsed?.preferences).toEqual({ ...DEFAULT_PREFERENCES, haptics: false });
    expect(parsed?.appearance).toEqual({ theme: 'system', accent: 'pink' });
  });

  it('drops blank names and ids so no station or group ends up with an empty label', () => {
    const parsed = parseBackup(
      JSON.stringify({
        app: BACKUP_APP,
        version: 1,
        lighthouses: {
          names: { a: '', b: '   ', c: 'Left', '': 'Ghost' },
          stations: { a: '', c: 'LHB-1A2B3C4D' },
          groups: [
            { id: 'g', name: ' ', members: [] },
            { id: 'h', name: 'Desk', members: [{ id: 'c', name: '' }] },
          ],
        },
      }),
    );

    expect(parsed?.lighthouses.names).toEqual({ c: 'Left' });
    expect(parsed?.lighthouses.stations).toEqual({ c: 'LHB-1A2B3C4D' });
    expect(parsed?.lighthouses.groups).toEqual([{ id: 'h', name: 'Desk', members: [] }]);
  });

  it('keeps the original id when a station has no known factory name', () => {
    const backup: Backup = {
      app: BACKUP_APP,
      version: 1,
      exportedAt: '',
      lighthouses: { ...DATA, names: { unknown: 'Attic' }, stations: {} },
      preferences: DEFAULT_PREFERENCES,
      appearance: { theme: 'system', accent: 'cyan' },
    };

    expect(remapBackup(backup, { '': 'LHB-1A2B3C4D' }).lighthouses.names).toEqual({ unknown: 'Attic' });
  });

  it('matches stations by factory name when the Bluetooth ids changed', () => {
    const backup: Backup = {
      app: BACKUP_APP,
      version: 1,
      exportedAt: '',
      lighthouses: DATA,
      preferences: { ...DEFAULT_PREFERENCES, hiddenLighthouses: { 'old-right': 'LHB-5E6F7A8B' } },
      appearance: { theme: 'dark', accent: 'green' },
    };

    const remapped = remapBackup(backup, { 'new-left': 'LHB-1A2B3C4D', 'new-right': 'LHB-5E6F7A8B' });

    expect(remapped.lighthouses.names).toEqual({ 'new-left': 'Living room left' });
    expect(remapped.lighthouses.groups[0]?.members).toEqual([{ id: 'new-left', name: 'LHB-1A2B3C4D' }]);
    expect(remapped.preferences.hiddenLighthouses).toEqual({ 'new-right': 'LHB-5E6F7A8B' });
  });

  it('restores everything from a backup', () => {
    const backup = parseBackup(
      JSON.stringify({ app: BACKUP_APP, version: 1, lighthouses: DATA, preferences: { sortOrder: 'signal' } }),
    );
    if (!backup) throw new Error('backup should parse');

    applyBackup(backup);

    expect(snapshotLighthouseData()).toMatchObject({ names: DATA.names, startupGroupId: 'g1', layout: 'grid' });
    expect(usePreferencesStore.getState().sortOrder).toBe('signal');
  });
});
