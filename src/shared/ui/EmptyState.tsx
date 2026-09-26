import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = {
  readonly icon: IconName;
  readonly title: string;
  readonly body?: string;
  readonly children?: ReactNode;
  readonly testID?: string;
};

export function EmptyState({ icon, title, body, children, testID }: Props) {
  return (
    <View testID={testID} style={styles.container}>
      <Icon name={icon} size={44} tone='muted' />
      <Text variant='headline' style={styles.centered}>
        {title}
      </Text>
      {body && (
        <Text tone='muted' style={styles.centered}>
          {body}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    gap: theme.space(3),
    paddingVertical: theme.space(12),
    paddingHorizontal: theme.space(6),
  },
  centered: {
    textAlign: 'center',
  },
}));
