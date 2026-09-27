import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { GradientLayer, Icon, PressableScale } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';
import { ACCENT_NAMES, ACCENTS, setAccent, subtleGradient, useAccent, type AccentName } from '@/theme';

const CHECK = { ios: 'checkmark', android: 'check' } as const;
const SWATCH = 34;

export function AccentPicker() {
  const { t } = useTranslation();
  const { rt } = useUnistyles();
  const current = useAccent();
  const mode = rt.themeName === 'dark' ? 'dark' : 'light';

  const choose = (name: AccentName) => {
    if (name === current) return;
    haptics.selection();
    setAccent(name);
  };

  return (
    <View style={styles.row} accessibilityRole='radiogroup' accessibilityLabel={t('settings.accent.title')}>
      {ACCENT_NAMES.map((name) => {
        const color = ACCENTS[name][mode].accent;
        const isSelected = name === current;
        return (
          <PressableScale
            key={name}
            testID={`accent-${name}`}
            onPress={() => choose(name)}
            scaleTo={0.88}
            hitSlop={6}
            accessibilityRole='radio'
            accessibilityLabel={t(`settings.accent.${name}`)}
            accessibilityState={{ checked: isSelected, selected: isSelected }}
            style={styles.ring(color, isSelected)}
          >
            <View style={styles.swatch(color)}>
              <GradientLayer image={subtleGradient(color)} />
              {isSelected && <Icon name={CHECK} size={14} tone='onBadge' />}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.space(3),
    padding: theme.space(4),
  },
  ring: (color: string, isSelected: boolean) => ({
    width: SWATCH + 10,
    height: SWATCH + 10,
    borderRadius: (SWATCH + 10) / 2,
    borderWidth: 2,
    borderColor: isSelected ? color : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  swatch: (color: string) => ({
    width: SWATCH,
    height: SWATCH,
    borderRadius: SWATCH / 2,
    backgroundColor: color,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }),
}));
