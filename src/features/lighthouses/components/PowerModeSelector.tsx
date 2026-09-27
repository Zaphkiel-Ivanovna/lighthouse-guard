import { useTranslation } from 'react-i18next';

import type { PowerCommand } from '@/core/ble';
import { SegmentedControl, type SegmentOption } from '@/shared/ui';

import { useCommandStatus } from '../hooks/useLighthouses';
import { setPower } from '../services/lighthouse-controller';
import type { Lighthouse } from '../types';

const MODES: readonly PowerCommand[] = ['on', 'standby', 'sleep'];

const isMode = (state: Lighthouse['state']): state is PowerCommand => MODES.some((mode) => mode === state);

type Props = {
  readonly lighthouse: Lighthouse;
};

export function PowerModeSelector({ lighthouse }: Props) {
  const { t } = useTranslation();
  const { status } = useCommandStatus(lighthouse.id);

  const options: SegmentOption<PowerCommand>[] = MODES.map((mode) => ({
    value: mode,
    label: t(`lighthouses.state.${mode}`),
    testID: `power-mode-${mode}`,
  }));

  return (
    <SegmentedControl
      tone='accent'
      options={options}
      value={isMode(lighthouse.state) ? lighthouse.state : null}
      onChange={(mode) => void setPower(lighthouse.id, mode)}
      disabled={status === 'pending'}
      accessibilityLabel={t('lighthouses.detail.power')}
    />
  );
}
