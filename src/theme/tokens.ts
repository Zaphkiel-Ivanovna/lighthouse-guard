/** Raw design tokens. Components never read these directly: they go through `theme.*`. */

export const palette = {
  white: '#FFFFFF',
  ink950: '#0B0E13',
  ink900: '#0F1419',
  ink850: '#151A21',
  ink800: '#1E252E',
  ink700: '#262E38',
  slate500: '#5B6573',
  slate400: '#8A93A0',
  slate300: '#96A0AD',
  slate200: '#E1E4E9',
  slate100: '#EEF0F3',
  slate50: '#F5F6F8',
  cyan600: '#0E9FB5',
  cyan400: '#2CC7DD',
  cyan950: '#041317',
  red600: '#D93A3A',
  red400: '#FF6B6B',
  green600: '#1F9D55',
  green400: '#34D17A',
  amber600: '#D08A00',
  amber400: '#F2B43A',
  blue600: '#3B6FD8',
  blue400: '#6E9BFF',
  orange600: '#E0701B',
  orange400: '#FF9A4D',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  headline: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
} as const;

/** 4-pt spacing scale: `space(4)` → 16. */
export const space = (steps: number): number => steps * 4;
