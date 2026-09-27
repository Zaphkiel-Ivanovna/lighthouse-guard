import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';

import { Icon, PressableScale } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { toggleListLayout, useListLayout } from '../store/list-layout.store';

const GRID_ICON = { ios: 'square.grid.2x2', android: 'grid_view' } as const;
const LIST_ICON = { ios: 'list.bullet', android: 'view_list' } as const;
const SIZE = 40;

export function LayoutToggle() {
  const { t } = useTranslation();
  const layout = useListLayout();
  const isList = layout === 'list';

  return (
    <PressableScale
      testID='layout-toggle'
      onPress={() => {
        haptics.selection();
        toggleListLayout();
      }}
      scaleTo={0.9}
      hitSlop={4}
      accessibilityRole='button'
      accessibilityLabel={isList ? t('lighthouses.list.showGrid') : t('lighthouses.list.showList')}
      style={styles.button}
    >
      <Icon name={isList ? GRID_ICON : LIST_ICON} size={17} tone='primary' />
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    boxShadow: `0 4px 14px ${theme.colors.shadow}`,
  },
}));
