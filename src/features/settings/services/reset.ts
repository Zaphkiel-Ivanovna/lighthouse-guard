import { setAppIcon } from '@/core/app-icon';
import { setTransportMode } from '@/core/ble';
import { resetPreferences } from '@/core/preferences';
import { resetLighthouseData } from '@/features/lighthouses';
import { DEFAULT_ACCENT, setAccent, setThemePreference } from '@/theme';

export function resetEverything(): void {
  resetLighthouseData();
  resetPreferences();
  setThemePreference('system');
  setAccent(DEFAULT_ACCENT);
  setTransportMode('native');
  void setAppIcon('graphite').catch(() => undefined);
}
