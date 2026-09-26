import * as Haptics from 'expo-haptics';

const ignore = () => undefined;

/** Fire-and-forget haptic feedback. Never throws, never awaited by UI code. */
export const haptics = {
  selection: () => void Haptics.selectionAsync().catch(ignore),
  impact: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(ignore),
  success: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore),
  error: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore),
};
