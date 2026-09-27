import { getAppIconName, setAlternateAppIcon } from 'expo-alternate-app-icons';

import { getAppIcon, setAppIcon, useAppIconStore } from '../app-icon';
import { iconAssetFolder, nativeIconName } from '../app-icon-names';

describe('app icon', () => {
  beforeEach(() => {
    jest.mocked(setAlternateAppIcon).mockClear();
    useAppIconStore.setState({ icon: 'graphite' });
  });

  it('maps icon names to native names and asset folders', () => {
    expect(nativeIconName('aquaViolet')).toBe('AquaViolet');
    expect(iconAssetFolder('aquaViolet')).toBe('aqua-violet');
    expect(iconAssetFolder('sky')).toBe('sky');
  });

  it('reports graphite when the primary icon is active', () => {
    jest.mocked(getAppIconName).mockReturnValueOnce(null);
    expect(getAppIcon()).toBe('graphite');
  });

  it('reports the active alternate icon', () => {
    jest.mocked(getAppIconName).mockReturnValueOnce('Sunset');
    expect(getAppIcon()).toBe('sunset');
  });

  it('switches to an alternate icon, and back to the primary one for graphite', async () => {
    await setAppIcon('mint');
    await setAppIcon('graphite');

    expect(jest.mocked(setAlternateAppIcon).mock.calls).toEqual([['Mint'], [null]]);
  });

  it('keeps the current icon when the system refuses the change', async () => {
    jest.mocked(setAlternateAppIcon).mockRejectedValueOnce(new Error('denied'));

    await expect(setAppIcon('rose')).rejects.toThrow('denied');
    expect(useAppIconStore.getState().icon).toBe('graphite');
  });
});
