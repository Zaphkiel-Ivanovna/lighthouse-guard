import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Level = 'strong' | 'medium' | 'weak';

const BARS = [5, 8, 11] as const;
const FILLED: Record<Level, number> = { strong: 3, medium: 2, weak: 1 };

export function signalLevel(rssi: number): Level {
  if (rssi >= -65) return 'strong';
  if (rssi >= -80) return 'medium';
  return 'weak';
}

type Props = {
  readonly rssi: number;
};

export function SignalStrength({ rssi }: Props) {
  const { t } = useTranslation();
  const level = signalLevel(rssi);

  return (
    <View
      style={styles.bars}
      accessible
      accessibilityRole='image'
      accessibilityLabel={t(`lighthouses.signal.${level}`)}
    >
      {BARS.map((height, index) => (
        <View key={height} style={styles.bar(height, index < FILLED[level])} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: BARS[BARS.length - 1],
  },
  bar: (height: number, filled: boolean) => ({
    width: 3,
    height,
    borderRadius: 1.5,
    backgroundColor: filled ? theme.colors.textMuted : theme.colors.border,
  }),
}));
