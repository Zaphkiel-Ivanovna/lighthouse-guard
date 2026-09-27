import { storage } from '@/core/storage';

import {
  DEFAULT_PREFERENCES,
  getPreference,
  hideLighthouse,
  replacePreferences,
  resetPreferences,
  setPreference,
  showLighthouse,
  usePreferencesStore,
} from '../preferences.store';

describe('preferences store', () => {
  beforeEach(() => {
    storage.clearAll();
    usePreferencesStore.setState(DEFAULT_PREFERENCES, true);
  });

  it('starts from the defaults', () => {
    expect(usePreferencesStore.getState()).toEqual(DEFAULT_PREFERENCES);
  });

  it('updates one preference at a time', () => {
    setPreference('offMode', 'standby');
    setPreference('scanDurationSeconds', 20);

    expect(getPreference('offMode')).toBe('standby');
    expect(getPreference('scanDurationSeconds')).toBe(20);
    expect(getPreference('haptics')).toBe(true);
  });

  it('hides then shows a lighthouse', () => {
    hideLighthouse('lh-1', 'LHB-1A2B3C4D');
    expect(getPreference('hiddenLighthouses')).toEqual({ 'lh-1': 'LHB-1A2B3C4D' });

    showLighthouse('lh-1');
    expect(getPreference('hiddenLighthouses')).toEqual({});
  });

  it('replaces everything from a backup, filling missing keys with defaults', () => {
    setPreference('haptics', false);
    replacePreferences({ sortOrder: 'signal' });

    expect(usePreferencesStore.getState()).toEqual({ ...DEFAULT_PREFERENCES, sortOrder: 'signal' });
  });

  it('resets to the defaults', () => {
    setPreference('language', 'fr');
    resetPreferences();

    expect(usePreferencesStore.getState()).toEqual(DEFAULT_PREFERENCES);
  });

  it('keeps defaults for keys added after the data was saved', async () => {
    storage.set('preferences', JSON.stringify({ state: { haptics: false }, version: 1 }));
    await usePreferencesStore.persist.rehydrate();

    expect(usePreferencesStore.getState()).toEqual({ ...DEFAULT_PREFERENCES, haptics: false });
  });
});
