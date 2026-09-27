import { skyGradient } from './color';
import type { AppTheme } from './themes';
import { palette as tokens } from './tokens';

export const ACCENTS = {
  cyan: {
    light: { accent: '#077589', hero: ['#0A6D86', '#1D8FAD'] },
    dark: { accent: '#3DD5F3', hero: ['#074C5E', '#18758E'] },
  },
  blue: {
    light: { accent: '#2563EB', hero: ['#2F5CCB', '#4F7BDB'] },
    dark: { accent: '#60A5FA', hero: ['#21408E', '#4165B4'] },
  },
  indigo: {
    light: { accent: '#4F46E5', hero: ['#4338CA', '#5F5BE0'] },
    dark: { accent: '#8B8CFF', hero: ['#2F278D', '#4E4BB8'] },
  },
  violet: {
    light: { accent: '#7C3AED', hero: ['#6D28D9', '#8452E8'] },
    dark: { accent: '#B794F6', hero: ['#4C1C98', '#6C43BE'] },
  },
  pink: {
    light: { accent: '#C0266E', hero: ['#BE185D', '#D6336C'] },
    dark: { accent: '#F472B6', hero: ['#851141', '#AF2A59'] },
  },
  orange: {
    light: { accent: '#C2410C', hero: ['#B93B0B', '#D2560F'] },
    dark: { accent: '#FB923C', hero: ['#822908', '#AC470C'] },
  },
  green: {
    light: { accent: '#137537', hero: ['#14773A', '#1E9150'] },
    dark: { accent: '#4ADE80', hero: ['#0E5329', '#197742'] },
  },
} as const;

export type AccentName = keyof typeof ACCENTS;
export type ThemeMode = 'light' | 'dark';

export const DEFAULT_ACCENT: AccentName = 'cyan';
export const ACCENT_NAMES = Object.keys(ACCENTS) as AccentName[];

export const isAccentName = (value: unknown): value is AccentName =>
  typeof value === 'string' && Object.hasOwn(ACCENTS, value);

export function applyAccent(theme: AppTheme, mode: ThemeMode, name: AccentName): AppTheme {
  const palette = ACCENTS[name][mode];
  const [heroFrom, heroTo] = palette.hero;
  return {
    ...theme,
    colors: {
      ...theme.colors,
      accent: palette.accent,
      onAccent: mode === 'light' ? tokens.white : tokens.night950,
    },
    gradients: {
      ...theme.gradients,
      sky: skyGradient(theme.colors.background, ACCENTS[name].dark.accent, mode),
      hero: `linear-gradient(135deg, ${heroFrom} 0%, ${heroTo} 100%)`,
    },
    hero: {
      ...theme.hero,
      onAction: heroFrom,
    },
    badge: {
      ...theme.badge,
      accent: palette.accent,
    },
  };
}
