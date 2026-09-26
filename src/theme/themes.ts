import { palette, radius, space, typography } from './tokens';

export type AppTheme = {
  readonly colors: {
    readonly background: string;
    readonly surface: string;
    readonly surfaceMuted: string;
    readonly border: string;
    readonly text: string;
    readonly textMuted: string;
    readonly accent: string;
    readonly onAccent: string;
    readonly danger: string;
    readonly onDanger: string;
  };
  /** Status colours per lighthouse `PowerState`. */
  readonly lighthouseState: {
    readonly on: string;
    readonly standby: string;
    readonly sleep: string;
    readonly booting: string;
    readonly unknown: string;
  };
  readonly radius: typeof radius;
  readonly typography: typeof typography;
  readonly space: typeof space;
};

export const lightTheme = {
  colors: {
    background: palette.slate50,
    surface: palette.white,
    surfaceMuted: palette.slate100,
    border: palette.slate200,
    text: palette.ink900,
    textMuted: palette.slate500,
    accent: palette.cyan600,
    onAccent: palette.white,
    danger: palette.red600,
    onDanger: palette.white,
  },
  lighthouseState: {
    on: palette.green600,
    standby: palette.amber600,
    sleep: palette.blue600,
    booting: palette.orange600,
    unknown: palette.slate400,
  },
  radius,
  typography,
  space,
} as const satisfies AppTheme;

export const darkTheme = {
  colors: {
    background: palette.ink950,
    surface: palette.ink850,
    surfaceMuted: palette.ink800,
    border: palette.ink700,
    text: palette.slate100,
    textMuted: palette.slate300,
    accent: palette.cyan400,
    onAccent: palette.cyan950,
    danger: palette.red400,
    onDanger: palette.ink950,
  },
  lighthouseState: {
    on: palette.green400,
    standby: palette.amber400,
    sleep: palette.blue400,
    booting: palette.orange400,
    unknown: palette.slate400,
  },
  radius,
  typography,
  space,
} as const satisfies AppTheme;
