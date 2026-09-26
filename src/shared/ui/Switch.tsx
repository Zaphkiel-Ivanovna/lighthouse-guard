import { Switch as NativeSwitch } from 'react-native';
import { withUnistyles } from 'react-native-unistyles';

import { haptics } from '@/shared/utils/haptics';

const ThemedSwitch = withUnistyles(NativeSwitch, (theme) => ({
  trackColor: { true: theme.colors.accent, false: theme.colors.border },
  ios_backgroundColor: theme.colors.border,
}));

type Props = {
  readonly value: boolean;
  readonly onValueChange: (value: boolean) => void;
  readonly accessibilityLabel: string;
  readonly testID?: string;
};

export function Switch({ value, onValueChange, accessibilityLabel, testID }: Props) {
  const handleChange = (next: boolean) => {
    haptics.selection();
    onValueChange(next);
  };

  return (
    <ThemedSwitch testID={testID} value={value} onValueChange={handleChange} accessibilityLabel={accessibilityLabel} />
  );
}
