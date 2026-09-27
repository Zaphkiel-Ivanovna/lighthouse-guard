import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { withAlpha } from '@/theme';

import { GradientLayer } from './GradientLayer';

type Props = {
  readonly children: ReactNode;
  readonly tint?: string;
  readonly testID?: string;
};

export function Screen({ children, tint, testID }: Props) {
  return (
    <View style={styles.root}>
      {tint && (
        <GradientLayer
          key={tint}
          fadeIn
          image={`linear-gradient(180deg, ${withAlpha(tint, 0.24)} 0%, ${withAlpha(tint, 0.08)} 30%, ${withAlpha(tint, 0)} 58%)`}
        />
      )}
      <ScrollView
        testID={testID}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior='automatic'
        keyboardShouldPersistTaps='handled'
      >
        {children}
      </ScrollView>
    </View>
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
