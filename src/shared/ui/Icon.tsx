import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useUnistyles } from 'react-native-unistyles';

import type { TextTone } from './Text';

/** SF Symbol on iOS, Material Symbol on Android. */
export type IconName = { readonly ios: SFSymbol; readonly android: AndroidSymbol };

type Props = {
  readonly name: IconName;
  readonly size?: number;
  readonly tone?: TextTone;
  /** Overrides `tone`, e.g. for lighthouse state colours. */
  readonly color?: string;
};

const TONE_COLOR = {
  primary: 'text',
  muted: 'textMuted',
  accent: 'accent',
  danger: 'danger',
  onAccent: 'onAccent',
  onDanger: 'onDanger',
} as const;

/** Leaf component: `useUnistyles` is fine here (tintColor is not a style prop). */
export function Icon({ name, size = 20, tone = 'primary', color }: Props) {
  const { theme } = useUnistyles();
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color ?? theme.colors[TONE_COLOR[tone]]}
      // Decorative: never announce the symbol name ("gearshape.fill") to screen readers.
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility='no-hide-descendants'
    />
  );
}
