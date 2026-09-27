import { DEFAULT_PREFERENCES, getPreference, hideLighthouse, usePreferencesStore } from '@/core/preferences';

import { renameLighthouse, useDeviceNamesStore } from '../../store/device-names.store';
import { initialGroupsState, useGroupsStore } from '../../store/groups.store';
import { adoptStation, restoreLighthouseData, snapshotLighthouseData } from '../lighthouse-data';

const OLD_ID = 'old-phone-id';
const NEW_ID = 'new-phone-id';
const FACTORY = 'LHB-1A2B3C4D';

describe('lighthouse data', () => {
  beforeEach(() => {
    usePreferencesStore.setState(DEFAULT_PREFERENCES, true);
    useDeviceNamesStore.setState({ names: {}, factoryNames: {} });
    useGroupsStore.setState(initialGroupsState, true);
  });

  it('moves names, group memberships and hidden flags to the id a station now advertises under', () => {
    renameLighthouse(OLD_ID, 'Living room left', FACTORY);
    useGroupsStore.setState({
      groups: [{ id: 'g', name: 'Living room', members: [{ id: OLD_ID, name: FACTORY }] }],
    });
    hideLighthouse(OLD_ID, FACTORY);

    adoptStation(NEW_ID, FACTORY);

    expect(useDeviceNamesStore.getState()).toEqual({
      names: { [NEW_ID]: 'Living room left' },
      factoryNames: { [NEW_ID]: FACTORY },
    });
    expect(useGroupsStore.getState().groups[0]?.members).toEqual([{ id: NEW_ID, name: FACTORY }]);
    expect(getPreference('hiddenLighthouses')).toEqual({ [NEW_ID]: FACTORY });
  });

  it('records the factory name of names set before it was tracked', () => {
    useDeviceNamesStore.setState({ names: { [OLD_ID]: 'Living room left' }, factoryNames: {} });

    adoptStation(OLD_ID, FACTORY);
    adoptStation(NEW_ID, FACTORY);

    expect(useDeviceNamesStore.getState().names).toEqual({ [NEW_ID]: 'Living room left' });
  });

  it('leaves everything untouched when the id did not change', () => {
    renameLighthouse(OLD_ID, 'Living room left', FACTORY);

    adoptStation(OLD_ID, FACTORY);

    expect(useDeviceNamesStore.getState().names).toEqual({ [OLD_ID]: 'Living room left' });
  });

  it('restores factory names with the custom names so they can be adopted later', () => {
    restoreLighthouseData({
      names: { [OLD_ID]: 'Living room left' },
      groups: [
        {
          id: 'g',
          name: 'Living room',
          members: [
            { id: OLD_ID, name: FACTORY },
            { id: OLD_ID, name: FACTORY },
          ],
        },
      ],
      startupGroupId: null,
      stations: { [OLD_ID]: FACTORY },
      layout: 'list',
    });

    expect(snapshotLighthouseData().groups[0]?.members).toHaveLength(1);
    adoptStation(NEW_ID, FACTORY);
    expect(useDeviceNamesStore.getState().names).toEqual({ [NEW_ID]: 'Living room left' });
  });
});
