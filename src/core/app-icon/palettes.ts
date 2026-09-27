import palettes from '@/assets/brand/app-icon-palettes.json';

import type { AppIconName } from './app-icon-names';

type Gradient = { readonly from: string; readonly to: string };

export type AppIconPalette = {
  readonly background: Gradient;
  readonly glyph: Gradient;
  readonly glyphDark: Gradient;
  readonly shadow: string;
};

export const APP_ICON_PALETTES: Readonly<Record<AppIconName, AppIconPalette>> = palettes;
