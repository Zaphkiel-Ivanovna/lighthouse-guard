import { fireEvent, render, screen } from '@testing-library/react-native';

import { SegmentedControl } from '../SegmentedControl';

const OPTIONS = [
  { value: 'on', label: 'On' },
  { value: 'standby', label: 'Standby' },
  { value: 'sleep', label: 'Sleep' },
] as const;

describe('SegmentedControl', () => {
  it('marks the current option as checked and reports a new choice', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={OPTIONS} value='standby' onChange={onChange} accessibilityLabel='Power' />);

    expect(screen.getByRole('radio', { name: 'Standby' })).toBeChecked();

    await fireEvent.press(screen.getByRole('radio', { name: 'On' }));
    expect(onChange).toHaveBeenCalledWith('on');
  });

  it('ignores presses on the already selected option', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={OPTIONS} value='sleep' onChange={onChange} accessibilityLabel='Power' />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Sleep' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks every option while disabled', async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl options={OPTIONS} value={null} onChange={onChange} accessibilityLabel='Power' disabled />,
    );

    await fireEvent.press(screen.getByRole('radio', { name: 'On' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
