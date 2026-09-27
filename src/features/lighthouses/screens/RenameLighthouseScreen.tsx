import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Text, TextField } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';

import { useDisplayName, useLighthouse } from '../hooks/useLighthouses';
import { MIN_NAME_LENGTH, renameLighthouse, resetLighthouseName } from '../store/device-names.store';

export function RenameLighthouseScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lighthouse = useLighthouse(id);
  const currentName = useDisplayName({ id, name: lighthouse?.name ?? id });
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (name.trim().length < MIN_NAME_LENGTH) {
      haptics.error();
      setError(t('lighthouses.rename.tooShort'));
      return;
    }
    renameLighthouse(id, name, lighthouse?.name);
    haptics.success();
    router.back();
  };

  const reset = () => {
    resetLighthouseName(id);
    router.back();
  };

  const handleChange = (value: string) => {
    setName(value);
    setError(null);
  };

  return (
    <View style={styles.container} testID='rename-sheet'>
      <Text variant='headline' accessibilityRole='header'>
        {t('lighthouses.rename.title')}
      </Text>
      <TextField
        testID='rename-input'
        value={name}
        onChangeText={handleChange}
        onSubmitEditing={save}
        placeholder={t('lighthouses.rename.placeholder')}
        hint={t('lighthouses.rename.hint')}
        error={error}
        autoFocus
        returnKeyType='done'
        maxLength={40}
      />
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button variant='secondary' label={t('common.actions.reset')} onPress={reset} />
        </View>
        <View style={styles.action}>
          <Button testID='rename-save' label={t('common.actions.save')} onPress={save} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.space(4),
    padding: theme.space(5),
    backgroundColor: theme.colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.space(3),
  },
  action: {
    flex: 1,
  },
}));
