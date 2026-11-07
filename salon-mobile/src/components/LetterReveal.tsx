import { useEffect } from "react";
import { View, type TextStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

/**
 * MOTION.md #9 letter-by-letter headline: each letter rises 20px and turns up
 * from -40°, 600ms ease-out-expo, 15ms apart. For one headline on launch only.
 */
export function LetterReveal({ text, style, enabled = true, delay = 100 }: { text: string; style: TextStyle; enabled?: boolean; delay?: number }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  let i = 0;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }} accessible accessibilityRole="header" accessibilityLabel={text}>
      {words.map((w, wi) => (
        <View key={wi} style={{ flexDirection: "row" }}>
          {[...(wi < words.length - 1 ? w + " " : w)].map((ch) => (
            <Letter key={i} ch={ch} index={i++} style={style} animate={enabled && !reduced} delay={delay} />
          ))}
        </View>
      ))}
    </View>
  );
}

function Letter({ ch, index, style, animate, delay }: { ch: string; index: number; style: TextStyle; animate: boolean; delay: number }) {
  const p = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) p.value = withDelay(delay + index * 15, withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) }));
  }, [animate, index, p, delay]);
  const s = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ perspective: 400 }, { translateY: (1 - p.value) * 20 }, { rotateX: `${(1 - p.value) * -40}deg` }],
  }));
  return <Animated.Text style={[style, s]}>{ch === " " ? " " : ch}</Animated.Text>;
}
