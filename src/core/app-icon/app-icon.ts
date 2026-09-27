import { getAppIconName, setAlternateAppIcon, supportsAlternateIcons } from 'expo-alternate-app-icons';
import { create } from 'zustand';

import { ALTERNATE_APP_ICONS, DEFAULT_APP_ICON, nativeIconName, type AppIconName } from './app-icon-names';

export const canChangeAppIcon = supportsAlternateIcons;

export function getAppIcon(): AppIconName {
  const current = getAppIconName();
  return ALTERNATE_APP_ICONS.find((name) => nativeIconName(name) === current) ?? DEFAULT_APP_ICON;
}

export const useAppIconStore = create<{ readonly icon: AppIconName }>(() => ({ icon: getAppIcon() }));

export const useAppIcon = () => useAppIconStore((state) => state.icon);

export async function setAppIcon(name: AppIconName): Promise<void> {
  const previous = useAppIconStore.getState().icon;
  if (name === previous) return;
  useAppIconStore.setState({ icon: name });
  try {
    await setAlternateAppIcon(name === DEFAULT_APP_ICON ? null : nativeIconName(name));
  } catch (error) {
    useAppIconStore.setState({ icon: previous });
    throw error;
  }
}
