import { ACCENT_NAMES, ACCENTS, applyAccent } from '../accents';
import { mix, SUBTLE_SHIFT } from '../color';
import { darkTheme, lightTheme } from '../themes';

function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

const AA = 4.5;

describe('accent presets', () => {
  it.each(ACCENT_NAMES)('%s meets AA contrast in both themes', (name) => {
    const light = applyAccent(lightTheme, 'light', name);
    const dark = applyAccent(darkTheme, 'dark', name);

    expect(contrast(light.colors.onAccent, light.colors.accent)).toBeGreaterThanOrEqual(AA);
    expect(contrast(light.colors.accent, light.colors.background)).toBeGreaterThanOrEqual(AA);
    expect(contrast(dark.colors.onAccent, dark.colors.accent)).toBeGreaterThanOrEqual(AA);
    expect(contrast(dark.colors.accent, dark.colors.surface)).toBeGreaterThanOrEqual(AA);
    for (const mode of ['light', 'dark'] as const) {
      const [from, to] = ACCENTS[name][mode].hero;
      expect(contrast(light.hero.text, from)).toBeGreaterThanOrEqual(AA);
      expect(contrast(light.hero.text, to)).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(ACCENT_NAMES)('%s stays AA across its subtle gradient', (name) => {
    const light = applyAccent(lightTheme, 'light', name);
    const dark = applyAccent(darkTheme, 'dark', name);

    for (const theme of [light, dark]) {
      const { accent, onAccent } = theme.colors;
      expect(contrast(onAccent, mix(accent, '#FFFFFF', SUBTLE_SHIFT))).toBeGreaterThanOrEqual(AA);
      expect(contrast(onAccent, mix(accent, '#000000', SUBTLE_SHIFT))).toBeGreaterThanOrEqual(AA);
    }
  });

  it('uses a distinct, deeper hero palette in dark mode', () => {
    const light = applyAccent(lightTheme, 'light', 'blue');
    const dark = applyAccent(darkTheme, 'dark', 'blue');

    expect(dark.gradients.hero).not.toBe(light.gradients.hero);
    expect(dark.colors.accent).not.toBe(light.colors.accent);
  });

  it('recolours the accent-driven tokens only', () => {
    const themed = applyAccent(lightTheme, 'light', 'violet');

    expect(themed.colors.accent).toBe(ACCENTS.violet.light.accent);
    expect(themed.gradients.hero).toContain(ACCENTS.violet.light.hero[0]);
    expect(themed.lighthouseState).toBe(lightTheme.lighthouseState);
    expect(themed.badge).toEqual({ ...lightTheme.badge, accent: ACCENTS.violet.light.accent });
  });

  it('tints the page wash with the accent and fades it into the background', () => {
    for (const [theme, mode] of [
      [lightTheme, 'light'],
      [darkTheme, 'dark'],
    ] as const) {
      const pink = applyAccent(theme, mode, 'pink').gradients.sky;

      expect(pink).not.toBe(applyAccent(theme, mode, 'green').gradients.sky);
      expect(pink).toContain(
        `${mix(theme.colors.background, ACCENTS.pink.dark.accent, mode === 'light' ? 0.2 : 0.15)} 0%`,
      );
      expect(pink).toContain(`${theme.colors.background} 62%`);
      expect(applyAccent(theme, mode, 'cyan').gradients.sky).toBe(theme.gradients.sky);
    }
  });
});
