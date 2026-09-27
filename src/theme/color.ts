export function withAlpha(hex: string, alpha: number): string {
  'worklet';
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mix(from: string, to: string, amount: number): string {
  const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
  const blended = [0, 1, 2].map((index) =>
    Math.round(channel(from, index) * (1 - amount) + channel(to, index) * amount)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${blended.join('')}`;
}

export const SUBTLE_SHIFT = 0.08;

export function subtleGradient(hex: string): string {
  return `linear-gradient(135deg, ${mix(hex, '#FFFFFF', SUBTLE_SHIFT)} 0%, ${hex} 50%, ${mix(hex, '#000000', SUBTLE_SHIFT)} 100%)`;
}

export function skyGradient(background: string, tint: string, mode: 'light' | 'dark'): string {
  const [top, middle] = mode === 'light' ? [0.2, 0.07] : [0.15, 0.05];
  return `linear-gradient(180deg, ${mix(background, tint, top)} 0%, ${mix(background, tint, middle)} 34%, ${background} 62%)`;
}

export function washGradient(hex: string, from = 0.24, to = 0.1): string {
  return `linear-gradient(135deg, ${withAlpha(hex, from)} 0%, ${withAlpha(hex, to)} 100%)`;
}
