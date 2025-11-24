import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import { StyleSheet } from 'react-native';
import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const GradientBackground: FC<Props> = ({ children }) => {
  const colors = ['#0f0f0f', '#000000'] as const;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
