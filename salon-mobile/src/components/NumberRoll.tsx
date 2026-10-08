import { useEffect, useRef, useState } from "react";
import { type TextStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { inr } from "../format";
import { T } from "./T";

/** Counts from the previous value to the new one (ease-out-expo, 700ms). Money only. */
export function NumberRoll({ value, style, c, rupees = true, duration = 700 }: { value: number; style?: TextStyle; c?: string; rupees?: boolean; duration?: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const from = useRef(reduced ? value : 0);
  useEffect(() => {
    if (reduced) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = from.current;
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const v = Math.round(start + (value - start) * eased);
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced, duration]);
  return (
    <T v="amount" c={c} style={[{ fontVariant: ["tabular-nums"] }, style]} accessibilityLabel={rupees ? inr(value) : String(value)}>
      {rupees ? inr(shown) : shown.toLocaleString("en-IN")}
    </T>
  );
}
