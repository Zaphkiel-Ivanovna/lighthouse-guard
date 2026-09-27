import { skyGradient } from './color';
import { palette, radius, space, typography } from './tokens';

export type AppTheme = {
  readonly colors: {
    readonly background: string;
    readonly surface: string;
    readonly surfaceMuted: string;
    readonly surfaceRaised: string;
    readonly shadow: string;
    readonly border: string;
    readonly text: string;
    readonly textMuted: string;
    readonly accent: string;
    readonly onAccent: string;
    readonly danger: string;
    readonly onDanger: string;
    readonly inverse: string;
    readonly onInverse: string;
  };
  readonly lighthouseState: {
    readonly on: string;
    readonly standby: string;
    readonly sleep: string;
    readonly booting: string;
    readonly unknown: string;
  };
  readonly lighthouseStateText: {
    readonly on: string;
    readonly standby: string;
    readonly sleep: string;
    readonly booting: string;
    readonly unknown: string;
  };
  readonly gradients: {
    readonly sky: string;
    readonly hero: string;
  };
  readonly hero: {
    readonly text: string;
    readonly textMuted: string;
    readonly action: string;
    readonly onAction: string;
    readonly ghost: string;
  };
  readonly badge: {
    readonly style: 'solid' | 'tinted';
    readonly accent: string;
    readonly indigo: string;
    readonly orange: string;
    readonly red: string;
    readonly green: string;
    readonly gray: string;
    readonly glyph: string;
  };
  readonly radius: typeof radius;
  readonly typography: typeof typography;
  readonly space: typeof space;
};

const shared = {
  hero: {
    text: palette.white,
    textMuted: 'rgba(255, 255, 255, 0.82)',
    action: palette.white,
    onAction: palette.blue700,
    ghost: 'rgba(0, 0, 0, 0.18)',
  },
  radius,
  typography,
  space,
} as const;

export const lightTheme = {
  colors: {
    background: palette.mist50,
    surface: palette.white,
    surfaceMuted: palette.mist100,
    surfaceRaised: palette.white,
    shadow: 'rgba(17, 20, 24, 0.07)',
    border: palette.mist200,
    text: palette.ink900,
    textMuted: palette.slate600,
    accent: palette.cyan700,
    onAccent: palette.white,
    danger: palette.red600,
    onDanger: palette.white,
    inverse: palette.ink900,
    onInverse: palette.white,
  },
  badge: {
    style: 'solid',
    accent: palette.cyan500,
    indigo: palette.indigo500,
    orange: palette.orange500,
    red: palette.red500,
    green: palette.green500,
    gray: palette.slate400,
    glyph: palette.white,
  },
  lighthouseState: {
    on: palette.green600,
    standby: palette.amber600,
    sleep: palette.indigo500,
    booting: palette.orange600,
    unknown: palette.slate400,
  },
  lighthouseStateText: {
    on: palette.green700,
    standby: palette.amber700,
    sleep: palette.indigo600,
    booting: palette.orange700,
    unknown: palette.slate600,
  },
  gradients: {
    sky: skyGradient(palette.mist50, palette.cyan400, 'light'),
    hero: `linear-gradient(135deg, ${palette.blue600} 0%, ${palette.blue500} 100%)`,
  },
  ...shared,
} as const satisfies AppTheme;

export const darkTheme = {
  colors: {
    background: palette.night950,
    surface: palette.night900,
    surfaceMuted: palette.night800,
    surfaceRaised: palette.night600,
    shadow: 'rgba(0, 0, 0, 0.4)',
    border: palette.night700,
    text: palette.fog100,
    textMuted: palette.fog300,
    accent: palette.cyan400,
    onAccent: palette.cyan950,
    danger: palette.red400,
    onDanger: palette.night950,
    inverse: palette.fog100,
    onInverse: palette.night950,
  },
  badge: {
    style: 'tinted',
    accent: palette.cyan400,
    indigo: palette.indigo400,
    orange: palette.orange400,
    red: palette.red400,
    green: palette.green400,
    gray: palette.fog300,
    glyph: palette.white,
  },
  lighthouseState: {
    on: palette.green400,
    standby: palette.amber400,
    sleep: palette.indigo400,
    booting: palette.orange400,
    unknown: palette.slate400,
  },
  lighthouseStateText: {
    on: palette.green400,
    standby: palette.amber400,
    sleep: palette.indigo400,
    booting: palette.orange400,
    unknown: palette.fog300,
  },
  gradients: {
    sky: skyGradient(palette.night950, palette.cyan400, 'dark'),
    hero: `linear-gradient(135deg, ${palette.blue600} 0%, ${palette.blue500} 100%)`,
  },
  ...shared,
} as const satisfies AppTheme;
