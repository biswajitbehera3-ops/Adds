/**
 * Stack navigation with container-transform morphs: a screen opens by growing
 * out of the element that was tapped (a hub label, a customer row) and closes by
 * shrinking back into it. Without an origin it rises in on a short shared axis.
 *
 * Motion: spring, no bounce, 460ms open / 380ms close (production polish);
 * content fades in over the last half so the shell leads. Reduce Motion turns
 * every transition into a 160ms crossfade. Back works from the header button,
 * Android's Back, Escape on the web, and an edge swipe from the left.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { color, radius } from "../theme/tokens";

export type Route =
  | { name: "home" }
  | { name: "counter" }
  | { name: "customers" }
  | { name: "profile"; id: string }
  | { name: "reminders" }
  | { name: "refer"; id?: string }
  | { name: "dashboard" };

type Rect = { x: number; y: number; w: number; h: number };
type Entry = { key: string; route: Route; origin: Rect | null; fromColor: string; toColor: string };

type Nav = {
  push: (route: Route, opts?: { from?: RefObject<View | null>; fromColor?: string; toColor?: string }) => void;
  pop: () => void;
  depth: number;
  top: Route;
};

const NavCtx = createContext<Nav | null>(null);
const ProgressCtx = createContext<SharedValue<number> | null>(null);

export function useNav(): Nav {
  const n = useContext(NavCtx);
  if (!n) throw new Error("useNav outside Navigator");
  return n;
}

/** The current screen's transition progress (0 closed → 1 open), for screens that choreograph with it. */
export function useScreenProgress() {
  return useContext(ProgressCtx);
}

const OPEN = { duration: 460, dampingRatio: 1 } as const;
const CLOSE = { duration: 380, dampingRatio: 1 } as const;

export function Navigator({ render }: { render: (route: Route) => React.ReactNode }) {
  const [stack, setStack] = useState<Entry[]>([{ key: "root", route: { name: "home" }, origin: null, fromColor: color.choc, toColor: color.choc }]);
  const [closing, setClosing] = useState<string | null>(null);
  const rootRef = useRef<View>(null);
  const rootOffset = useRef({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const busy = useRef(false);

  const push: Nav["push"] = useCallback((route, opts) => {
    if (busy.current) return;
    busy.current = true;
    const add = (origin: Rect | null) => {
      setStack((s) => [
        ...s,
        { key: `${route.name}-${Date.now()}`, route, origin, fromColor: opts?.fromColor ?? color.paper, toColor: opts?.toColor ?? color.paper },
      ]);
      setTimeout(() => (busy.current = false), 300);
    };
    const node = opts?.from?.current;
    if (!node) return add(null);
    rootRef.current?.measureInWindow((rx, ry) => {
      rootOffset.current = { x: rx, y: ry };
      node.measureInWindow((x, y, w, h) => add(w > 0 ? { x: x - rx, y: y - ry, w, h } : null));
    });
  }, []);

  const pop = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) return s;
      setClosing(s[s.length - 1].key);
      return s;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setStack((s) => s.filter((e) => e.key !== key));
    setClosing(null);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (stack.length > 1) {
        pop();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, pop]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") pop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pop]);

  const top = stack[stack.length - 1].route;
  const nav = useMemo(() => ({ push, pop, depth: stack.length, top }), [push, pop, stack.length, top]);

  return (
    <NavCtx.Provider value={nav}>
      <View
        ref={rootRef}
        style={StyleSheet.absoluteFill}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        {stack.map((entry, i) =>
          i === 0 ? (
            <View key={entry.key} style={StyleSheet.absoluteFill} pointerEvents={stack.length > 1 ? "none" : "auto"}>
              {render(entry.route)}
            </View>
          ) : (
            <MorphScreen
              key={entry.key}
              entry={entry}
              size={size}
              closing={closing === entry.key}
              interactive={i === stack.length - 1}
              onClosed={() => remove(entry.key)}
              onSwipeBack={pop}
            >
              {render(entry.route)}
            </MorphScreen>
          ),
        )}
      </View>
    </NavCtx.Provider>
  );
}

function MorphScreen({
  entry,
  size,
  closing,
  interactive,
  onClosed,
  onSwipeBack,
  children,
}: {
  entry: Entry;
  size: { w: number; h: number };
  closing: boolean;
  interactive: boolean;
  onClosed: () => void;
  onSwipeBack: () => void;
  children: React.ReactNode;
}) {
  const p = useSharedValue(0);
  const reduced = useReducedMotion();
  const { origin } = entry;

  useEffect(() => {
    p.value = reduced ? withTiming(1, { duration: 160 }) : withSpring(1, OPEN);
  }, [p, reduced]);

  useEffect(() => {
    if (!closing) return;
    const done = (finished?: boolean) => {
      "worklet";
      if (finished) runOnJS(onClosed)();
    };
    p.value = reduced ? withTiming(0, { duration: 140 }, done) : withSpring(0, CLOSE, done);
  }, [closing, p, reduced, onClosed]);

  const W = size.w || 1;
  const H = size.h || 1;

  const scrim = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0, 1], [0, 0.45], Extrapolation.CLAMP) }));

  const shell = useAnimatedStyle(() => {
    if (reduced) return { opacity: p.value, backgroundColor: entry.toColor };
    if (!origin) {
      return {
        opacity: interpolate(p.value, [0, 0.6], [0, 1], Extrapolation.CLAMP),
        transform: [{ translateY: interpolate(p.value, [0, 1], [36, 0]) }],
        backgroundColor: entry.toColor,
      };
    }
    const sx = interpolate(p.value, [0, 1], [origin.w / W, 1]);
    const sy = interpolate(p.value, [0, 1], [origin.h / H, 1]);
    const tx = interpolate(p.value, [0, 1], [origin.x + origin.w / 2 - W / 2, 0]);
    const ty = interpolate(p.value, [0, 1], [origin.y + origin.h / 2 - H / 2, 0]);
    // Keep the corner looking like a label's corner while the shell is scaled down.
    const r = interpolate(p.value, [0, 1], [radius.label / ((origin.w / W + origin.h / H) / 2), 0]);
    return {
      borderRadius: r,
      backgroundColor: interpolateColor(p.value, [0, 0.5], [entry.fromColor, entry.toColor]),
      transform: [{ translateX: tx }, { translateY: ty }, { scaleX: sx }, { scaleY: sy }],
    };
  });

  // The content is counter-scaled so it is never squashed: it sits at full size
  // behind the growing shell, which reveals it like a window opening.
  const content = useAnimatedStyle(() => {
    if (reduced) return { opacity: p.value };
    if (!origin) {
      return { opacity: interpolate(p.value, [0.2, 1], [0, 1], Extrapolation.CLAMP) };
    }
    const sx = interpolate(p.value, [0, 1], [origin.w / W, 1]);
    const sy = interpolate(p.value, [0, 1], [origin.h / H, 1]);
    return {
      opacity: interpolate(p.value, [0.3, 0.85], [0, 1], Extrapolation.CLAMP),
      transform: [{ scaleX: 1 / sx }, { scaleY: 1 / sy }, { translateY: interpolate(p.value, [0.3, 1], [14, 0], Extrapolation.CLAMP) }],
    };
  });

  // Interactive edge swipe: drags the screen back toward its origin.
  const pan = Gesture.Pan()
    .enabled(interactive && !reduced)
    .activeOffsetX(12)
    .failOffsetY([-16, 16])
    .onUpdate((e) => {
      p.value = Math.max(0, 1 - Math.max(0, e.translationX) / (W * 1.4));
    })
    .onEnd((e) => {
      if (e.translationX > W * 0.28 || e.velocityX > 900) runOnJS(onSwipeBack)();
      else p.value = withSpring(1, OPEN);
    });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={interactive && !closing ? "box-none" : "none"}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color.choc950 }, scrim]} />
      <Animated.View style={[StyleSheet.absoluteFill, { overflow: "hidden" }, shell]}>
        <Animated.View style={[StyleSheet.absoluteFill, content]}>
          <ProgressCtx.Provider value={p}>{children}</ProgressCtx.Provider>
        </Animated.View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <View style={{ position: "absolute", left: 0, top: 80, bottom: 0, width: 22 }} />
      </GestureDetector>
    </View>
  );
}
