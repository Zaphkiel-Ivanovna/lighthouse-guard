import { useTranslation } from 'react-i18next';

import type { BleErrorCode } from '@/core/ble';
import { Banner } from '@/shared/ui';

type Props = {
  readonly code: BleErrorCode | null;
  readonly testID?: string;
};

export function BleErrorBanner({ code, testID }: Props) {
  const { t } = useTranslation();
  if (!code || code === 'aborted') return null;
  return <Banner tone='danger' testID={testID} message={t(`ble.errors.${code}`)} />;
}
