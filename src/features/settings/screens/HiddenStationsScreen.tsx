import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';

import { usePreference } from '@/core/preferences';
import { showHiddenLighthouse, useDisplayNames } from '@/features/lighthouses';
import { ListRow, ListSection, Screen, Text } from '@/shared/ui';

const SHOW_ICON = { ios: 'eye.fill', android: 'visibility' } as const;

export function HiddenStationsScreen() {
  const { t } = useTranslation();
  const hidden = Object.entries(usePreference('hiddenLighthouses'));
  const names = useDisplayNames();

  return (
    <Screen testID='hidden-stations-screen'>
      <Stack.Screen options={{ title: t('settings.scanning.hidden') }} />
      {hidden.length > 0 ? (
        <ListSection footer={t('settings.hidden.hint')}>
          {hidden.map(([id, name]) => (
            <ListRow
              key={id}
              testID={`hidden-${id}`}
              icon={SHOW_ICON}
              title={names[id] ?? name}
              subtitle={t('settings.hidden.show')}
              onPress={() => showHiddenLighthouse(id)}
            />
          ))}
        </ListSection>
      ) : (
        <Text tone='muted' style={styles.empty}>
          {t('settings.hidden.empty')}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  empty: {
    textAlign: 'center',
    paddingHorizontal: theme.space(6),
    paddingTop: theme.space(8),
  },
}));
