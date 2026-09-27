import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  readonly children: ReactNode;
  readonly style?: ViewProps['style'];
  readonly testID?: string;
};

export function Card({ children, style, testID }: Props) {
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: theme.space(4),
    gap: theme.space(3),
  },
}));
