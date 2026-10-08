import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { color } from "../theme/tokens";
import { Seal } from "./Seal";

/**
 * The receipt's wax seal pressed onto the paper: it drops in large and tilted,
 * lands with a short weighted settle, and the press is felt as a haptic.
 * A faint ink ring spreads from the impact. Reduce Motion shows it already set.
 */
export function Stamp({ amount }: { amount: number }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    const land = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    p.value = withDelay(
      260,
      withSpring(1, { duration: 520, dampingRatio: 0.62 }, (done) => {
        "worklet";
        if (done) runOnJS(land)();
      }),
    );
    ring.value = withDelay(400, withSequence(withTiming(1, { duration: 520, easing: Easing.out(Easing.exp) }), withTiming(2, { duration: 0 })));
  }, [p, ring, reduced]);

  const seal = useAnimatedStyle(() => ({
    opacity: Math.min(1, p.value * 4),
    transform: [{ scale: 1.55 - 0.55 * p.value }, { rotate: `${-18 + 10 * p.value}deg` }],
  }));
  const ink = useAnimatedStyle(() => ({
    opacity: ring.value > 1 ? 0 : 0.35 * (1 - ring.value),
    transform: [{ scale: 0.9 + ring.value * 0.45 }],
  }));

  return (
    <View style={{ width: 136, height: 104, alignItems: "center", justifyContent: "center" }}>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", width: 136, height: 98, borderRadius: 68, borderWidth: 2, borderColor: color.seal }, ink]} />
      <Animated.View style={seal}>
        <Seal amount={amount} caption="PAID" width={132} />
      </Animated.View>
    </View>
  );
}
