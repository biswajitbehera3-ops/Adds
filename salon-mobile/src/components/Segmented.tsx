import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { color, font, radius } from "../theme/tokens";
import { Press } from "./Press";
import { T } from "./T";

/** Tabs with a sliding ink pill (MOTION.md R5): 250ms ease-out between options. */
export function Segmented<K extends string>({ options, value, onChange, label }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; label: string }) {
  const [w, setW] = useState(0);
  const reduced = useReducedMotion();
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const x = useSharedValue(0);
  const seg = w > 0 ? (w - 6) / options.length : 0;
  useEffect(() => {
    x.value = reduced || seg === 0 ? index * seg : withTiming(index * seg, { duration: 250, easing: Easing.out(Easing.cubic) });
  }, [index, seg, reduced, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ flexDirection: "row", borderWidth: 1.25, borderColor: color.choc, borderRadius: radius.control, padding: 3, backgroundColor: color.paperLight }}
    >
      {seg > 0 ? (
        <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 3, bottom: 3, left: 3, width: seg, borderRadius: radius.control - 3, backgroundColor: color.choc }, pill]} />
      ) : null}
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Press
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, minHeight: 44, borderRadius: radius.control - 3, alignItems: "center", justifyContent: "center", backgroundColor: seg > 0 ? "transparent" : on ? color.choc : "transparent" }}
          >
            <T style={{ fontFamily: font.semibold, fontSize: 15 }} c={on ? color.paper : color.ink}>
              {o.label}
            </T>
          </Press>
        );
      })}
    </View>
  );
}
