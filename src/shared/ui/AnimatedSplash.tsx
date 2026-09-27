import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { APP_ICON_PALETTES, getAppIcon } from '@/core/app-icon';
import { getPreference } from '@/core/preferences';
import { easing, SPLASH, withAlpha } from '@/theme';

import { LOGO_GEOMETRY as LOGO } from './logo-geometry';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = SPLASH.logoSize;
const toPoints = (units: number) => (units / LOGO.viewBox.size) * SIZE;
const LED_SIZE = toPoints(LOGO.led.diameter);
const LED_LEFT = toPoints(LOGO.led.cx - LOGO.viewBox.x) - LED_SIZE / 2;
const LED_TOP = toPoints(LOGO.led.cy - LOGO.viewBox.y) - LED_SIZE / 2;
const VIEW_BOX = `${LOGO.viewBox.x} ${LOGO.viewBox.y} ${LOGO.viewBox.size} ${LOGO.viewBox.size}`;
const READY_FALLBACK_MS = 300;

const TIMELINE = {
  arc: { delay: 0, duration: 560 },
  outline: { delay: 120, duration: 720 },
  bar: { delay: 300, duration: 320 },
  hole: { delay: 700, duration: 260 },
  fill: { delay: 820, duration: 320 },
  led: { delay: 1100, duration: 200 },
  ping: { delay: 1100, duration: 560 },
  exit: { delay: 1450, duration: 380 },
  veil: { delay: 1510, duration: 360 },
} as const;
const TOTAL_MS = TIMELINE.veil.delay + TIMELINE.veil.duration;

type Step = keyof typeof TIMELINE;

const play = (value: SharedValue<number>, step: Step, target = 1) => {
  const { delay, duration } = TIMELINE[step];
  const curve = step === 'exit' || step === 'veil' ? easing.inOut : easing.out;
  value.set(withDelay(delay, withTiming(target, { duration, easing: curve, reduceMotion: ReduceMotion.System })));
};

const drawn = (progress: number, length: number, opacity = 1) => {
  'worklet';
  return { strokeDashoffset: length * (1 - progress), strokeOpacity: progress > 0 ? opacity : 0 };
};

export function AnimatedSplash() {
  const { rt } = useUnistyles();
  const [palette] = useState(() => APP_ICON_PALETTES[getAppIcon()]);
  const [isAnimated] = useState(() => getPreference('launchAnimation'));
  const [isReady, setIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const colors = rt.themeName === 'dark' ? palette.glyphDark : palette.glyph;

  const arc = useSharedValue(0);
  const outline = useSharedValue(0);
  const bar = useSharedValue(0);
  const hole = useSharedValue(0);
  const fill = useSharedValue(0);
  const led = useSharedValue(0);
  const ping = useSharedValue(0);
  const exit = useSharedValue(0);
  const veil = useSharedValue(1);

  useEffect(() => {
    if (!isAnimated) {
      SplashScreen.hide();
      return;
    }
    const fallback = setTimeout(() => setIsReady(true), READY_FALLBACK_MS);
    return () => clearTimeout(fallback);
  }, [isAnimated]);

  useEffect(() => {
    if (!isReady) return;
    SplashScreen.hide();
    play(arc, 'arc');
    play(outline, 'outline');
    play(bar, 'bar');
    play(hole, 'hole');
    play(fill, 'fill');
    play(led, 'led');
    play(ping, 'ping');
    play(exit, 'exit');
    play(veil, 'veil', 0);
    const timer = setTimeout(() => setIsDone(true), TOTAL_MS);
    return () => clearTimeout(timer);
  }, [isReady, arc, outline, bar, hole, fill, led, ping, exit, veil]);

  const arcProps = useAnimatedProps(() => drawn(arc.get(), LOGO.lengths.arc));
  const barProps = useAnimatedProps(() => drawn(bar.get(), LOGO.lengths.bar));
  const outlineProps = useAnimatedProps(() => drawn(outline.get(), LOGO.lengths.bodyOutline, 1 - fill.get()));
  const holeProps = useAnimatedProps(() => drawn(hole.get(), LOGO.lengths.ledHole, 1 - fill.get()));
  const fillProps = useAnimatedProps(() => ({ fillOpacity: fill.get() }));

  const veilStyle = useAnimatedStyle(() => ({ opacity: veil.get() }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.get(),
    transform: [{ scale: 1 + exit.get() * 0.12 }],
  }));
  const ledStyle = useAnimatedStyle(() => ({
    opacity: led.get(),
    transform: [{ scale: 0.6 + led.get() * 0.4 }],
  }));
  const pingStyle = useAnimatedStyle(() => ({
    opacity: ping.get() === 0 ? 0 : 0.7 * (1 - ping.get()),
    transform: [{ scale: 1 + ping.get() * 4 }],
  }));

  if (isDone || !isAnimated) return null;

  return (
    <Animated.View testID='animated-splash' pointerEvents='none' style={[styles.veil, veilStyle]}>
      <Animated.View style={[styles.logo, logoStyle]}>
        <View onLayout={() => setIsReady(true)}>
          <Svg width={SIZE} height={SIZE} viewBox={VIEW_BOX}>
            <Defs>
              <LinearGradient id='splash-glyph' gradientUnits='userSpaceOnUse' {...LOGO.gradient}>
                <Stop offset='0' stopColor={colors.from} />
                <Stop offset='1' stopColor={colors.to} />
              </LinearGradient>
            </Defs>
            <AnimatedPath d={LOGO.body} fill='url(#splash-glyph)' animatedProps={fillProps} />
            <AnimatedPath
              d={LOGO.bodyOutline}
              fill='none'
              stroke='url(#splash-glyph)'
              strokeWidth={LOGO.outlineWidth}
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeDasharray={[LOGO.lengths.bodyOutline, LOGO.lengths.bodyOutline]}
              animatedProps={outlineProps}
            />
            <AnimatedPath
              d={LOGO.ledHole}
              fill='none'
              stroke='url(#splash-glyph)'
              strokeWidth={LOGO.outlineWidth}
              strokeLinecap='round'
              strokeDasharray={[LOGO.lengths.ledHole, LOGO.lengths.ledHole]}
              animatedProps={holeProps}
            />
            <AnimatedPath
              d={LOGO.bar}
              fill='none'
              stroke='url(#splash-glyph)'
              strokeWidth={LOGO.strokeWidth}
              strokeLinecap='round'
              strokeDasharray={[LOGO.lengths.bar, LOGO.lengths.bar]}
              animatedProps={barProps}
            />
            <AnimatedPath
              d={LOGO.arc}
              fill='none'
              stroke='url(#splash-glyph)'
              strokeWidth={LOGO.strokeWidth}
              strokeLinecap='round'
              strokeDasharray={[LOGO.lengths.arc, LOGO.lengths.arc]}
              animatedProps={arcProps}
            />
          </Svg>
        </View>
        <Animated.View style={[styles.led, styles.ping, pingStyle]} />
        <Animated.View style={[styles.led, styles.ledLight, ledStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  veil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: rt.themeName === 'dark' ? SPLASH.background.dark : SPLASH.background.light,
  },
  logo: {
    width: SIZE,
    height: SIZE,
  },
  led: {
    position: 'absolute',
    left: LED_LEFT,
    top: LED_TOP,
    width: LED_SIZE,
    height: LED_SIZE,
    borderRadius: LED_SIZE / 2,
  },
  ledLight: {
    backgroundColor: theme.lighthouseState.on,
    boxShadow: `0 0 8px 2px ${withAlpha(theme.lighthouseState.on, 0.7)}`,
  },
  ping: {
    borderWidth: 1.5,
    borderColor: theme.lighthouseState.on,
  },
}));
