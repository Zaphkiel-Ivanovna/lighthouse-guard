import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  readonly children: ReactNode;
  readonly testID?: string;
};

/** Scrollable screen body. Works with large titles and native tabs through automatic content insets. */
export function Screen({ children, testID }: Props) {
  return (
    <ScrollView
      testID={testID}
      style={styles.root}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior='automatic'
      keyboardShouldPersistTaps='handled'
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.space(4),
    paddingBottom: rt.insets.bottom + theme.space(6),
    gap: theme.space(6),
  },
}));
