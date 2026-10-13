import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Defs, Pattern, Rect, Polygon } from "react-native-svg";
import { color } from "../theme/tokens";

/**
 * MOTION.md 08 barber-pole progress: red, cream and blue stripes fill the bar and
 * travel only while work is actually running (export, backup).
 */
export function BarberPole({ progress, running }: { progress: number; running: boolean }) {
  const reduced = useReducedMotion();
  const shift = useSharedValue(0);
  useEffect(() => {
    if (running && !reduced) shift.value = withRepeat(withTiming(-24, { duration: 600, easing: Easing.linear }), -1, false);
    else {
      cancelAnimation(shift);
      shift.value = 0;
    }
  }, [running, reduced, shift]);
  const stripes = useAnimatedStyle(() => ({ transform: [{ translateX: shift.value }] }));
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height: 16, borderRadius: 999, borderWidth: 1.5, borderColor: color.choc, overflow: "hidden", backgroundColor: color.paperLight }}>
      <View style={{ width: `${pct * 100}%`, height: "100%", overflow: "hidden" }}>
        <Animated.View style={[{ width: 2000, height: "100%" }, stripes]}>
          <Svg width={2000} height={16}>
            <Defs>
              <Pattern id="pole" width={24} height={16} patternUnits="userSpaceOnUse">
                <Rect width={24} height={16} fill={color.paperLight} />
                <Polygon points="0,16 6,0 12,0 6,16" fill={color.seal} />
                <Polygon points="12,16 18,0 24,0 18,16" fill="#2F4A7A" />
              </Pattern>
            </Defs>
            <Rect width={2000} height={16} fill="url(#pole)" />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}
