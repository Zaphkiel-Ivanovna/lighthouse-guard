import { TextInput, View, type TextInputProps } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { Text } from './Text';

const ThemedInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.textMuted,
  selectionColor: theme.colors.accent,
}));

type Props = Omit<TextInputProps, 'style'> & {
  readonly hint?: string;
  readonly error?: string | null;
};

export function TextField({ hint, error, ...inputProps }: Props) {
  styles.useVariants({ invalid: Boolean(error) });
  return (
    <View style={styles.container}>
      <ThemedInput {...inputProps} style={styles.input} />
      {(error ?? hint) && (
        <Text variant='caption' tone={error ? 'danger' : 'muted'}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.space(1.5),
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: theme.space(4),
    minHeight: 48,
    variants: {
      invalid: {
        true: { borderColor: theme.colors.danger },
        false: { borderColor: theme.colors.border },
      },
    },
  },
}));
