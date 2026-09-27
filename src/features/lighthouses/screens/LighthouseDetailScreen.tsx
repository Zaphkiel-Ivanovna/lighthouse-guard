import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EmptyState, Screen } from '@/shared/ui';

import { LighthouseDetail } from '../components/LighthouseDetail';
import { useLighthouse } from '../hooks/useLighthouses';

const MISSING_ICON = { ios: 'questionmark.circle', android: 'help' } as const;

export function LighthouseDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lighthouse = useLighthouse(id);

  if (!lighthouse) {
    return (
      <Screen>
        <EmptyState icon={MISSING_ICON} title={t('lighthouses.detail.notFound')} />
      </Screen>
    );
  }

  return <LighthouseDetail lighthouse={lighthouse} />;
}
