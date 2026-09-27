import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useUnistyles } from 'react-native-unistyles';

import type { TextTone } from './Text';

export type IconName = { readonly ios: SFSymbol; readonly android: AndroidSymbol };

type Props = {
  readonly name: IconName;
  readonly size?: number;
  readonly tone?: TextTone | 'onBadge';
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

export function Icon({ name, size = 20, tone = 'primary', color }: Props) {
  const { theme } = useUnistyles();
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color ?? (tone === 'onBadge' ? theme.badge.glyph : theme.colors[TONE_COLOR[tone]])}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility='no-hide-descendants'
    />
  );
}
