import { Text as NativeText, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type TextVariant = 'display' | 'title' | 'headline' | 'body' | 'callout' | 'caption' | 'label';
export type TextTone = 'primary' | 'muted' | 'accent' | 'danger' | 'onAccent' | 'onDanger';

type Props = TextProps & {
  readonly variant?: TextVariant;
  readonly tone?: TextTone;
  readonly tabular?: boolean;
};

export function Text({ variant = 'body', tone = 'primary', tabular = false, style, ...rest }: Props) {
  styles.useVariants({ variant, tone, tabular });
  return <NativeText {...rest} style={[styles.text, style]} />;
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      variant: {
        display: theme.typography.display,
        title: theme.typography.title,
        headline: theme.typography.headline,
        body: theme.typography.body,
        callout: theme.typography.callout,
        caption: theme.typography.caption,
        label: { ...theme.typography.label, textTransform: 'uppercase' },
      },
      tone: {
        primary: { color: theme.colors.text },
        muted: { color: theme.colors.textMuted },
        accent: { color: theme.colors.accent },
        danger: { color: theme.colors.danger },
        onAccent: { color: theme.colors.onAccent },
        onDanger: { color: theme.colors.onDanger },
      },
      tabular: {
        true: { fontVariant: ['tabular-nums'] },
        false: {},
      },
    },
  },
}));
