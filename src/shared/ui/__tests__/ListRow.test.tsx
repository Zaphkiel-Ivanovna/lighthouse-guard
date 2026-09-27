import { fireEvent, render, screen } from '@testing-library/react-native';

import { ListRow } from '../ListRow';

describe('ListRow', () => {
  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<ListRow title='Identify' onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Identify' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses and says so to assistive tech when disabled', async () => {
    const onPress = jest.fn();
    await render(<ListRow title='Identify' onPress={onPress} disabled />);

    const row = screen.getByRole('button', { name: 'Identify' });
    expect(row).toBeDisabled();

    await fireEvent.press(row);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is disabled and busy while loading', async () => {
    const onPress = jest.fn();
    await render(<ListRow title='Identify' onPress={onPress} loading />);

    const row = screen.getByRole('button', { name: 'Identify' });
    expect(row).toBeDisabled();
    expect(row).toBeBusy();
  });
});
