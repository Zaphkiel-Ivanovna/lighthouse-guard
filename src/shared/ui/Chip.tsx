import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from './Text';

type Props = {
  readonly label: string;
  /** Colour of the leading dot. */
  readonly color: string;
  readonly testID?: string;
};

export function Chip({ label, color, testID }: Props) {
  return (
    <View testID={testID} style={styles.chip}>
      <View style={styles.dot(color)} />
      <Text variant='caption'>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.space(1.5),
    paddingHorizontal: theme.space(2.5),
    paddingVertical: theme.space(1),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  dot: (color: string) => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color,
  }),
}));
