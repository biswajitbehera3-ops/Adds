import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { Icon, type IconName } from "./Icon";
import { Press } from "./Press";

/**
 * MOTION.md R3 icon swap: the first icon shrinks away as the second grows in
 * (opacity + scale, 250ms), then swaps back after a moment. Used for "copied" / "sent".
 */
export function IconSwap({ from, to, tint, toTint, onPress, label, size = 22 }: { from: IconName; to: IconName; tint: string; toTint?: string; onPress: () => void | Promise<void>; label: string; size?: number }) {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const p = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  useEffect(() => {
    p.value = reduced ? (done ? 1 : 0) : withTiming(done ? 1 : 0, { duration: 250 });
  }, [done, p, reduced]);
  const a = useAnimatedStyle(() => ({ opacity: 1 - p.value, transform: [{ scale: 1 - 0.75 * p.value }] }));
  const b = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.25 + 0.75 * p.value }] }));
  return (
    <Press
      accessibilityLabel={label}
      hitSlop={8}
      onPress={async () => {
        await onPress();
        setDone(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setDone(false), 1600);
      }}
      style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}
    >
      <View style={{ width: size, height: size }}>
        <Animated.View style={[{ position: "absolute" }, a]}>
          <Icon name={from} color={tint} size={size} />
        </Animated.View>
        <Animated.View style={[{ position: "absolute" }, b]}>
          <Icon name={to} color={toTint ?? tint} size={size} strokeWidth={2.25} />
        </Animated.View>
      </View>
    </Press>
  );
}
