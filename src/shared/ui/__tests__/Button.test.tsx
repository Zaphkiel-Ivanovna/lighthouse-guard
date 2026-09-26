import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label='Scan' onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Scan' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled and busy while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label='Scan' onPress={onPress} loading />);

    const button = screen.getByRole('button', { name: 'Scan' });
    expect(button).toBeDisabled();
    expect(button).toBeBusy();

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
