export const DEFAULT_APP_ICON = 'graphite';

export const ALTERNATE_APP_ICONS = [
  'sky',
  'cyan',
  'blue',
  'indigo',
  'violet',
  'rose',
  'sunset',
  'mint',
  'aquaViolet',
] as const;

export const APP_ICONS = [DEFAULT_APP_ICON, ...ALTERNATE_APP_ICONS] as const;

export type AppIconName = (typeof APP_ICONS)[number];

export const nativeIconName = (name: AppIconName) => name.charAt(0).toUpperCase() + name.slice(1);

export const iconAssetFolder = (name: AppIconName) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
