import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from './Text';

type Props = {
  readonly title?: string;
  readonly footer?: string;
  readonly children: ReactNode;
};

export function ListSection({ title, footer, children }: Props) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.section}>
      {title && (
        <Text variant='label' tone='muted' style={styles.title} accessibilityRole='header'>
          {title}
        </Text>
      )}
      <View style={styles.group}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={styles.separator} />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer && (
        <Text variant='caption' tone='muted' style={styles.footer}>
          {footer}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.space(2),
  },
  title: {
    paddingHorizontal: theme.space(4),
  },
  group: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.space(4),
    backgroundColor: theme.colors.border,
  },
  footer: {
    paddingHorizontal: theme.space(4),
  },
}));
