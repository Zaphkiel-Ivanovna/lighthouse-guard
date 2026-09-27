import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { TabScreen } from '@/shared/ui';
import { transitions } from '@/theme';

import { FaqItem } from '../components/FaqItem';

const QUESTIONS = [
  { key: 'standbyVsSleep', icon: { ios: 'moon.zzz.fill', android: 'bedtime' } },
  { key: 'notDetected', icon: { ios: 'wifi.exclamationmark', android: 'bluetooth_disabled' } },
  { key: 'oneConnection', icon: { ios: 'link', android: 'link' } },
] as const;

export function FaqScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen testID='faq-screen' title={t('faq.title')}>
      <Animated.View style={styles.list} layout={transitions.layout()}>
        {QUESTIONS.map(({ key, icon }, index) => (
          <Animated.View key={key} entering={transitions.enterItem(index)} layout={transitions.layout()}>
            <FaqItem
              testID={`faq-${key}`}
              icon={icon}
              question={t(`faq.items.${key}.question`)}
              answer={t(`faq.items.${key}.answer`)}
            />
          </Animated.View>
        ))}
      </Animated.View>
    </TabScreen>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.space(3),
  },
}));
