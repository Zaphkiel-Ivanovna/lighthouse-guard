import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { PowerCommand } from '@/core/ble';
import { Button } from '@/shared/ui';

import { useCommandStatus } from '../hooks/useLighthouses';
import { setPower } from '../services/lighthouse-controller';
import type { Lighthouse } from '../types';

const MODES: readonly PowerCommand[] = ['on', 'standby', 'sleep'];

type Props = {
  readonly lighthouse: Lighthouse;
};

export function PowerModeSelector({ lighthouse }: Props) {
  const { t } = useTranslation();
  const { status } = useCommandStatus(lighthouse.id);
  const isBusy = status === 'pending' || lighthouse.state === 'booting';

  return (
    <View style={styles.row} accessibilityRole='radiogroup'>
      {MODES.map((mode) => {
        // The current mode stays fully opaque (selected, not disabled); pressing it is a no-op.
        const isCurrent = lighthouse.state === mode;
        return (
          <View key={mode} style={styles.item}>
            <Button
              testID={`power-mode-${mode}`}
              label={t(`lighthouses.state.${mode}`)}
              variant={isCurrent ? 'primary' : 'secondary'}
              selected={isCurrent}
              disabled={isBusy}
              onPress={() => {
                if (!isCurrent) void setPower(lighthouse.id, mode);
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    gap: theme.space(2),
  },
  item: {
    flex: 1,
  },
}));
