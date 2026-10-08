import { useEffect } from "react";
import { type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

/**
 * Enter from an already-legible state: opacity .001→1 and 14px rise, ease-out-expo.
 * Used once per surface (hub on launch, receipt), never on every re-render.
 */
export function Reveal({ index = 0, children, style, enabled = true, step = 55 }: { index?: number; children: React.ReactNode; style?: ViewStyle; enabled?: boolean; step?: number }) {
  const reduced = useReducedMotion();
  const animate = enabled && !reduced;
  const p = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) p.value = withDelay(index * step, withTiming(1, { duration: 520, easing: Easing.out(Easing.exp) }));
  }, [animate, index, p, step]);
  const s = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * 14 }] }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}
