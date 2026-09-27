import { fireEvent, render, screen } from '@testing-library/react-native';
import { setAlternateAppIcon } from 'expo-alternate-app-icons';

import { useAppIconStore } from '@/core/app-icon/app-icon';

import { AppIconPicker } from '../AppIconPicker';

describe('AppIconPicker', () => {
  beforeEach(() => {
    jest.mocked(setAlternateAppIcon).mockClear();
    useAppIconStore.setState({ icon: 'graphite' });
  });

  it('marks graphite as the current icon by default', async () => {
    await render(<AppIconPicker />);

    expect(screen.getByTestId('app-icon-graphite')).toBeChecked();
    expect(screen.getByTestId('app-icon-sunset')).not.toBeChecked();
  });

  it('switches to the chosen icon', async () => {
    await render(<AppIconPicker />);

    await fireEvent.press(screen.getByTestId('app-icon-sunset'));

    expect(setAlternateAppIcon).toHaveBeenCalledWith('Sunset');
    expect(screen.getByTestId('app-icon-sunset')).toBeChecked();
  });

  it('keeps the previous icon when the system refuses the change', async () => {
    useAppIconStore.setState({ icon: 'mint' });
    jest.mocked(setAlternateAppIcon).mockRejectedValueOnce(new Error('denied'));
    await render(<AppIconPicker />);

    await fireEvent.press(screen.getByTestId('app-icon-rose'));

    expect(screen.getByTestId('app-icon-mint')).toBeChecked();
  });
});
