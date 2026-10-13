import { useState } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { color } from "../theme/tokens";

/**
 * MOTION.md R4 clip-path reveal: the receipt is uncovered top to bottom, as if it
 * were being printed. A paper-coloured cover slides down off the content (~500ms).
 */
export function PrintReveal({ children, cover = color.paper }: { children: React.ReactNode; cover?: string }) {
  const reduced = useReducedMotion();
  const [h, setH] = useState(0);
  const p = useSharedValue(reduced ? 1 : 0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: p.value * (h + 8) }] }));
  return (
    <View
      style={{ overflow: "hidden" }}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.height;
        if (h === 0 && next > 0 && !reduced) p.value = withDelay(80, withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }));
        setH(next);
      }}
    >
      {children}
      {reduced ? null : <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: cover }, style]} />}
    </View>
  );
}
