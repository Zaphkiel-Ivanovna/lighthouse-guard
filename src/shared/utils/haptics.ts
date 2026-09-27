import * as Haptics from 'expo-haptics';

import { getPreference } from '@/core/preferences';

const ignore = () => undefined;

const play = (feedback: () => Promise<void>) => {
  if (getPreference('haptics')) void feedback().catch(ignore);
};

export const haptics = {
  selection: () => play(() => Haptics.selectionAsync()),
  impact: () => play(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => play(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => play(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
