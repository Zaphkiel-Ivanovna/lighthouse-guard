import { act, render, screen } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';

import { DEFAULT_PREFERENCES, setPreference, usePreferencesStore } from '@/core/preferences';

import { AnimatedSplash } from '../AnimatedSplash';

jest.mock('expo-alternate-app-icons', () => ({
  supportsAlternateIcons: true,
  getAppIconName: jest.fn(() => 'Sunset'),
  setAlternateAppIcon: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  hide: jest.fn(),
  preventAutoHideAsync: jest.fn(async () => true),
  setOptions: jest.fn(),
}));

describe('AnimatedSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(SplashScreen.hide).mockClear();
    usePreferencesStore.setState(DEFAULT_PREFERENCES, true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps the native splash until the logo is laid out, then hands over and removes itself', async () => {
    await render(<AnimatedSplash />);
    expect(SplashScreen.hide).not.toHaveBeenCalled();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });
    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('animated-splash')).toBeOnTheScreen();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1900);
    });
    expect(screen.queryByTestId('animated-splash')).not.toBeOnTheScreen();
  });

  it('hands over straight away when the launch animation is turned off', async () => {
    setPreference('launchAnimation', false);
    await render(<AnimatedSplash />);

    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('animated-splash')).not.toBeOnTheScreen();
  });
});
