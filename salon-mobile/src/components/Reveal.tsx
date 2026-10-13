import { useEffect } from "react";
import { type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

/**
 * Entrance presets from MOTION.md, always from an already-legible end state:
 * - "list" (#7 quick list stagger): y 8 → 0, 300ms, 30ms apart.
 * - "pop"  (#8 grid pop-in): scale .92, y 16 → in, 400ms back-out, 60ms apart.
 * - "rise" (R1 materialize): y 8 → 0 with fade, 450ms ease-out-expo.
 * Use on first appearance only, never on every re-render.
 */
export type RevealKind = "list" | "pop" | "rise";

const SPEC = {
  list: { y: 8, scale: 1, duration: 300, step: 30, easing: Easing.out(Easing.quad) },
  pop: { y: 16, scale: 0.92, duration: 400, step: 60, easing: Easing.out(Easing.back(1.4)) },
  rise: { y: 8, scale: 1, duration: 450, step: 50, easing: Easing.out(Easing.exp) },
} as const;

export function Reveal({ index = 0, children, style, enabled = true, kind = "rise", delay = 0 }: { index?: number; children: React.ReactNode; style?: ViewStyle; enabled?: boolean; kind?: RevealKind; delay?: number }) {
  const reduced = useReducedMotion();
  const animate = enabled && !reduced;
  const s = SPEC[kind];
  const p = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) p.value = withDelay(delay + Math.min(index, 12) * s.step, withTiming(1, { duration: s.duration, easing: s.easing }));
  }, [animate, index, p, s, delay]);
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(1, p.value * 1.6),
    transform: [{ translateY: (1 - p.value) * s.y }, { scale: s.scale + (1 - s.scale) * p.value }],
  }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}
