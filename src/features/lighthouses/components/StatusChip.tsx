import { useTranslation } from 'react-i18next';
import { useUnistyles } from 'react-native-unistyles';

import type { PowerState } from '@/core/ble';
import { Chip } from '@/shared/ui';

type Props = {
  readonly state: PowerState;
  readonly testID?: string;
};

export function StatusChip({ state, testID }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return <Chip testID={testID} label={t(`lighthouses.state.${state}`)} color={theme.lighthouseState[state]} />;
}
