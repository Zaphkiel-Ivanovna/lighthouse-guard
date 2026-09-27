import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { APP_ICONS, setAppIcon, useAppIcon, type AppIconName } from '@/core/app-icon';
import { PressableScale, Text } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { THUMBNAILS } from './app-icon-thumbnails';

const ICON = 52;
const ICON_RADIUS = Math.round(ICON * 0.2237);
const RING_GAP = 3;

export function AppIconPicker() {
  const { t } = useTranslation();
  const current = useAppIcon();

  const choose = (name: AppIconName) => {
    if (name === current) return;
    haptics.selection();
    setAppIcon(name).catch(() => haptics.error());
  };

  return (
    <View style={styles.grid} accessibilityRole='radiogroup' accessibilityLabel={t('settings.appIcon.title')}>
      {APP_ICONS.map((name) => {
        const isSelected = name === current;
        const label = t(`settings.appIcon.names.${name}`);
        return (
          <PressableScale
            key={name}
            testID={`app-icon-${name}`}
            onPress={() => choose(name)}
            scaleTo={0.92}
            accessibilityRole='radio'
            accessibilityLabel={label}
            accessibilityState={{ checked: isSelected, selected: isSelected }}
            containerStyle={styles.cell}
            style={styles.option}
          >
            <View style={styles.ring(isSelected)}>
              <Image source={THUMBNAILS[name]} style={styles.icon} contentFit='cover' accessible={false} />
            </View>
            <Text
              variant='caption'
              tone={isSelected ? 'primary' : 'muted'}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.label(isSelected)}
            >
              {label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.space(3),
    paddingVertical: theme.space(4),
    paddingHorizontal: theme.space(2),
  },
  cell: {
    width: '20%',
  },
  option: {
    alignItems: 'center',
    gap: theme.space(1.5),
  },
  ring: (isSelected: boolean) => ({
    padding: RING_GAP,
    borderWidth: 2,
    borderRadius: ICON_RADIUS + RING_GAP + 2,
    borderCurve: 'continuous',
    borderColor: isSelected ? theme.colors.accent : 'transparent',
  }),
  icon: {
    width: ICON,
    height: ICON,
    borderRadius: ICON_RADIUS,
  },
  label: (isSelected: boolean) => ({
    maxWidth: ICON + 14,
    fontWeight: isSelected ? '600' : '400',
  }),
}));
