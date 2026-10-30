/**
 * The receipt's PAID stamp (motion P5), brown glass: a gold ring with "PAID" drops in large
 * and tilted, lands with a short weighted settle felt as a haptic, and a faint gold ring
 * spreads from the impact. Reduce Motion shows it already set.
 */
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { glass } from "../theme/tokens";
import { GT } from "./glass";

export function Stamp({ size = 92 }: { size?: number }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  const ring = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    const land = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    p.value = withDelay(
      320,
      withSpring(1, { duration: 520, dampingRatio: 0.62 }, (done) => {
        "worklet";
        if (done) runOnJS(land)();
      }),
    );
    ring.value = withDelay(460, withSequence(withTiming(1, { duration: 520, easing: Easing.out(Easing.exp) }), withTiming(2, { duration: 0 })));
  }, [p, ring, reduced]);
  const seal = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 4), transform: [{ scale: 1.6 - 0.6 * p.value }, { rotate: `${-26 + 10 * p.value}deg` }] }));
  const ink = useAnimatedStyle(() => ({ opacity: ring.value > 1 ? 0 : 0.4 * (1 - ring.value), transform: [{ scale: 0.9 + ring.value * 0.5 }] }));
  return (
    <View style={{ width: size + 20, height: size + 20, alignItems: "center", justifyContent: "center" }} accessible accessibilityLabel="Paid">
      <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: glass.gold }, ink]} />
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, borderWidth: size * 0.09, borderColor: glass.gold, alignItems: "center", justifyContent: "center" }, seal]}>
        <GT size={size * 0.22} w="heavy" c={glass.gold} style={{ letterSpacing: 3 }}>
          PAID
        </GT>
      </Animated.View>
    </View>
  );
}
