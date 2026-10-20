/**
 * The owner's Live floor (BUILD-SPEC 6.2, 10.8, 10.10), the approved clay salon.
 * Everything on it comes from real records: a stylist stands at their chair once checked in,
 * a customer sits there from Start visit until payment. When a visit starts the customer walks
 * in from the door past the front desk to the chair; when it is paid they walk to the desk,
 * "₹ PAID" shows, and they walk out. Walk cycles are frames cut from video, picked from the
 * distance walked so the steps match the movement.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, type ImageSourcePropType, Pressable, ScrollView, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { easeOut, GhostButton, GlassCard, GlassSheet, GT } from "../../components/glass";
import { Icon } from "../../components/Icon";
import { NumberRoll } from "../../components/NumberRoll";
import { useToast } from "../../components/Toast";
import config from "../../config/salon";
import { shortDay } from "../../domain/calendar";
import { type Chair, liveFloor } from "../../domain/live";
import { clearAll, resetToDemo, setSession, useData } from "../../domain/store";
import { inr } from "../../format";
import { useNav } from "../../nav/Navigator";
import { OwnerDock } from "../../nav/OwnerTabs";
import { DOCK_SPACE } from "../../nav/StaffTabs";
import { glass } from "../../theme/tokens";
import { istTime } from "../Attendance";

// Plate coordinates are a 1000 × 565 space; people stand on their feet.
const PLATE = require("../../../assets/live/plate2.webp");
const STYLISTS = [require("../../../assets/live/s0.webp"), require("../../../assets/live/s1.webp"), require("../../../assets/live/s2.webp")];
const STYLIST_W = [64, 73, 65];
const SEATED = [require("../../../assets/live/s3.webp"), require("../../../assets/live/s4.webp"), require("../../../assets/live/s5.webp")];
const SEATED_W = [110, 107, 107];
type Sheet = { src: ImageSourcePropType; frames: number; fw: number; fh: number; stand: number };
const SHEETS: Sheet[] = [
  { src: require("../../../assets/live/walk-dev.png"), frames: 43, fw: 70, fh: 150, stand: 16 },
  { src: require("../../../assets/live/walk-rahul.png"), frames: 29, fw: 67, fh: 150, stand: 17 },
  { src: require("../../../assets/live/walk-neha.png"), frames: 42, fw: 57, fh: 150, stand: 22 },
];
const SEAT_H = 96;
const STAND_H = 122;
const WALK_H = 120;
/** Plate units one walk cycle covers (≈1.4 m); the pace keeps the clip at its natural 24 fps. */
const CYCLE = 96;

type Pt = [number, number];
const CHAIRS: Pt[] = [
  [518, 262],
  [632, 312],
  [752, 382],
];
const FRONT: Pt[] = [
  [474, 300],
  [588, 350],
  [708, 420],
];
const PILLS: Pt[] = [
  [470, 132],
  [612, 200],
  [760, 270],
];
const DOOR: Pt = [118, 356];
const DESK: Pt = [322, 364];
const IN: Pt[] = [DOOR, [178, 416], [304, 414], DESK];
const TO: Pt[][] = [
  [DESK, [420, 380], FRONT[0]],
  [DESK, [440, 392], [540, 384], FRONT[1]],
  [DESK, [430, 386], [600, 394], FRONT[2]],
];

/** A walking route with rounded corners, sampled into points with running distance. */
function route(pts: Pt[]) {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(cx - px, cy - py);
    const d2 = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(34, d1 / 2, d2 / 2);
    const a: Pt = [cx - ((cx - px) / d1) * r, cy - ((cy - py) / d1) * r];
    const b: Pt = [cx + ((nx - cx) / d2) * r, cy + ((ny - cy) / d2) * r];
    out.push(a);
    for (let k = 1; k < 8; k++) {
      const u = k / 8;
      out.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * cx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * cy + u * u * b[1]]);
    }
    out.push(b);
  }
  out.push(pts[pts.length - 1]);
  const cum = [0];
  for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { xs: out.map((p) => p[0]), ys: out.map((p) => p[1]), cum, length: cum[cum.length - 1] };
}

type Leg = { walk: Pt[] } | { stand: number; face?: -1 | 1; at?: () => void };
type Trip = { id: string; sheet: number; legs: Leg[]; onDone: () => void };

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function Live() {
  const data = useData();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const toast = useToast();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(t);
  }, []);
  const floor = useMemo(() => liveFloor(data, now), [data, now]);
  const onPlate = floor.chairs.slice(0, CHAIRS.length);

  const [w, setW] = useState(0);
  const k = w / 1000;
  const [trips, setTrips] = useState<Trip[]>([]);
  /** Visits still walking in: their customer isn't drawn in the chair yet. */
  const [walkingIn, setWalkingIn] = useState<Set<string>>(new Set());
  const [paidBubble, setPaidBubble] = useState<{ key: number; amount: number } | null>(null);
  const [desk, setDesk] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [demo, setDemo] = useState<null | { chair: number; name: string; service: string; amount: number; minutes: number; since: number; seated: boolean }>(null);

  const say = (text: string, ms = 2600) => {
    setDesk(text);
    setTimeout(() => setDesk((d) => (d === text ? null : d)), ms);
  };
  const addTrip = (t: Omit<Trip, "onDone">, done?: () => void) =>
    setTrips((all) => [
      ...all,
      {
        ...t,
        onDone: () => {
          setTrips((x) => x.filter((y) => y.id !== t.id));
          done?.();
        },
      },
    ]);

  const walkIn = (id: string, chair: number, name: string, seed: string, onSeated: () => void) => {
    if (reduced) return onSeated();
    addTrip({ id: `in-${id}`, sheet: hash(seed) % SHEETS.length, legs: [{ walk: IN }, { stand: 1.4, face: -1, at: () => say(`${name} checked in`) }, { walk: TO[chair] }, { stand: 0.4 }] }, onSeated);
  };
  const walkOut = (id: string, chair: number, name: string, amount: number, seed: string, method: string) => {
    const paidAt = () => {
      setPaidBubble({ key: Date.now(), amount });
      say(`${name} paid ${inr(amount)}${method ? ` · ${method}` : ""}`);
    };
    if (reduced) return paidAt();
    addTrip({ id: `out-${id}`, sheet: hash(seed) % SHEETS.length, legs: [{ walk: [...TO[chair]].reverse() }, { stand: 1.8, face: -1, at: paidAt }, { walk: [...IN].reverse() }] });
  };

  // Watch the real records: a visit that opens walks in, a visit that gets paid walks out.
  const prev = useRef<Map<string, string> | null>(null);
  useEffect(() => {
    const cur = new Map<string, string>();
    onPlate.forEach((c) => c.visit && cur.set(c.staff.id, c.visit.id));
    const before = prev.current;
    prev.current = cur;
    if (!before) return;
    onPlate.forEach((c, i) => {
      const was = before.get(c.staff.id);
      const is = cur.get(c.staff.id);
      if (was && was !== is) {
        const v = data.visits.find((x) => x.id === was);
        const name = data.customers.find((x) => x.id === v?.customerId)?.name.split(" ")[0] ?? "Customer";
        if (v?.status === "PAID") walkOut(was, i, name, v.total, v.customerId, v.paymentMethod ?? "");
      }
      if (is && is !== was) {
        setWalkingIn((s) => new Set(s).add(is));
        walkIn(is, i, c.customerName.split(" ")[0], c.visit!.customerId, () =>
          setWalkingIn((s) => {
            const n = new Set(s);
            n.delete(is);
            return n;
          }),
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /** Demo data only: plays one visit through a free chair so the owner can see the floor move. */
  const playDemo = () => {
    const i = onPlate.findIndex((c) => c.state === "free");
    if (i < 0) return toast("No chair is free with a stylist in right now; try again when one is");
    const d = { chair: i, name: "Dev Arora", service: "Beard trim", amount: 150, minutes: 15, since: Date.now(), seated: false };
    setDemo(d);
    walkIn("demo", i, "Dev", "dev", () => {
      setDemo({ ...d, seated: true, since: Date.now() });
      setTimeout(() => {
        setDemo(null);
        walkOut("demo", i, "Dev", 150, "dev", "UPI");
      }, 6000);
    });
  };

  const chairsView = floor.chairs.map((c, i) => (demo && demo.chair === i && c.state === "free" ? demoChair(c, demo) : c));
  const stylistFirst = (c: Chair) => c.staff.name.split(" ")[0];
  const enter = (i: number) => (reduced ? undefined : FadeInDown.duration(420).delay(i * 70).easing(easeOut));

  return (
    <View style={{ flex: 1, backgroundColor: glass.deep }}>
      <BackdropGlow />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + DOCK_SPACE + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, paddingBottom: 8 }}>
          <View>
            <GT size={12} w="semibold" c={glass.soft} style={{ letterSpacing: 1, textTransform: "uppercase" }}>
              {config.displayName} · owner
            </GT>
            <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34 }}>
              Live floor
            </GT>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <LiveDot reduced={reduced} />
            <Pressable onPress={() => setMenu(true)} accessibilityRole="button" accessibilityLabel="Owner menu" hitSlop={8} style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
              <Icon name="menu" color={glass.cream} size={19} />
            </Pressable>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12 }}>
          <GT size={13} c={glass.soft}>
            {shortDay(floor.today)} · {istTime(now)}
          </GT>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <GT size={13} c={glass.soft}>
              Today
            </GT>
            <NumberRoll value={floor.total} style={{ fontFamily: "Urbanist_800ExtraBold", fontSize: 20, lineHeight: 26, color: glass.gold }} duration={700} />
          </View>
        </View>

        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ marginHorizontal: 10, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: glass.line, backgroundColor: "#2a1a15", aspectRatio: 1000 / 565 }} accessible accessibilityLabel={`Salon floor: ${floor.busy} of ${floor.working} chairs busy`}>
          {w ? (
            <>
              <Image source={PLATE} style={{ position: "absolute", width: w, height: w * 0.565 }} />
              {onPlate.map((c, i) => {
                const [x, y] = CHAIRS[i];
                const showStylist = c.state === "busy" || c.state === "free";
                const v = chairsView[i];
                const seated = (v.state === "busy" && !(c.visit && walkingIn.has(c.visit.id))) || (demo?.chair === i && demo.seated);
                return (
                  <View key={c.staff.id} pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: w, height: w * 0.565, zIndex: y }}>
                    {seated ? <Sprite src={SEATED[hash(v.visit?.customerId ?? "dev") % SEATED.length]} srcW={SEATED_W[hash(v.visit?.customerId ?? "dev") % SEATED.length]} x={x + 6} y={y} h={SEAT_H} k={k} flip /> : null}
                    {showStylist ? <Sprite src={STYLISTS[i % 3]} srcW={STYLIST_W[i % 3]} x={x - 44} y={y + 20} h={STAND_H} k={k} flip breathe={!reduced} /> : null}
                  </View>
                );
              })}
              {trips.map((t) => (
                <Walker key={t.id} trip={t} k={k} />
              ))}
              {floor.closed || floor.chairs.every((c) => c.state === "notIn" || c.state === "off") ? null : onPlate.map((c, i) => (
                <ChairPill key={c.staff.id} chair={chairsView[i]} n={i + 1} k={k} at={PILLS[i]} selected={selected === c.staff.id} onPress={() => setSelected((s) => (s === c.staff.id ? null : c.staff.id))} />
              ))}
              {paidBubble ? <PaidBubble key={paidBubble.key} amount={paidBubble.amount} k={k} onDone={() => setPaidBubble(null)} /> : null}
              {desk ? (
                <Animated.View key={desk} entering={reduced ? undefined : FadeIn.duration(250)} style={{ position: "absolute", bottom: 8, alignSelf: "center", zIndex: 1000, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: desk.includes("paid") ? glass.gold : "rgba(38,22,17,0.78)", borderWidth: desk.includes("paid") ? 0 : 1, borderColor: glass.line }}>
                  <GT size={12} w="bold" c={desk.includes("paid") ? glass.ink : glass.cream}>
                    {desk}
                  </GT>
                </Animated.View>
              ) : null}
              {floor.closed ? <FloorNote title="Closed today" text={`The salon is closed on ${shortDay(floor.today).split(" ")[0]}s`} /> : floor.chairs.length === 0 ? <FloorNote title="No stylists yet" text="Add your stylists in the Staff tab" /> : floor.chairs.every((c) => c.state === "notIn" || c.state === "off") ? <FloorNote title="No one in yet" text={`Shift starts ${config.shift.start}`} /> : null}
            </>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <GT size={15} w="heavy">
            Chairs
          </GT>
          <GT size={13} c={glass.soft}>
            {floor.closed ? "Closed today" : `${floor.busy + (demo?.seated ? 1 : 0)} of ${floor.working} busy`}
          </GT>
        </View>
        <View style={{ gap: 8, paddingHorizontal: 12 }}>
          {chairsView.map((c, i) => (
            <Animated.View key={c.staff.id} entering={enter(i)}>
              <ChairCard chair={c} n={i + 1} selected={selected === c.staff.id} onPress={() => setSelected((s) => (s === c.staff.id ? null : c.staff.id))} first={stylistFirst(c)} />
            </Animated.View>
          ))}
        </View>
        <GlassCard style={{ marginHorizontal: 12, marginTop: 8, paddingHorizontal: 14, paddingVertical: 11, flexDirection: "row", justifyContent: "space-between" }}>
          <GT size={13} c={glass.soft}>
            Front desk
          </GT>
          <GT size={13} w="bold" numberOfLines={1} style={{ flexShrink: 1, marginLeft: 12 }}>
            {desk ?? `${floor.visits} paid today`}
          </GT>
        </GlassCard>
        {floor.chairs.length > CHAIRS.length ? (
          <GT size={12} c={glass.faint} style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            The salon picture shows the first {CHAIRS.length} chairs; every chair is in the list.
          </GT>
        ) : null}
        {data.demo ? (
          <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
            <GhostButton label={demo || trips.length ? "Playing…" : "Demo data: watch a customer come and pay"} tone={glass.gold2} onPress={() => (demo || trips.length ? null : playDemo())} />
          </View>
        ) : null}
      </ScrollView>
      <OwnerDock />
      <OwnerMenu open={menu} onClose={() => setMenu(false)} demo={data.demo} />
    </View>
  );
}

function demoChair(c: Chair, d: { name: string; service: string; amount: number; minutes: number; since: number; seated: boolean }): Chair {
  if (!d.seated) return c;
  return { ...c, state: "busy", customerName: d.name, services: d.service, amount: d.amount, minutesTotal: d.minutes, minutesDone: Math.min(d.minutes, ((Date.now() - d.since) / 6000) * d.minutes) };
}

function BackdropGlow() {
  return <LinearGradient colors={[glass.glow, glass.mid, glass.deep]} locations={[0, 0.46, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />;
}

function LiveDot({ reduced }: { reduced: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (!reduced) p.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
  }, [p, reduced]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - p.value), transform: [{ scale: 1 + p.value * 1.6 }] }));
  return (
    <View accessibilityRole="text" accessibilityLabel="Live" style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
      <View style={{ width: 8, height: 8 }}>
        <Animated.View style={[{ position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: "#F08C6A" }, ring]} />
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F08C6A" }} />
      </View>
      <GT size={12} w="heavy" style={{ letterSpacing: 1.2 }}>
        LIVE
      </GT>
    </View>
  );
}

function Sprite({ src, srcW, x, y, h, k, flip, breathe }: { src: ImageSourcePropType; srcW: number; x: number; y: number; h: number; k: number; flip?: boolean; breathe?: boolean }) {
  const b = useSharedValue(0);
  useEffect(() => {
    if (breathe) b.value = withRepeat(withSequence(withTiming(1, { duration: 1750, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1750, easing: Easing.inOut(Easing.sin) })), -1, false);
  }, [b, breathe]);
  const height = h * k;
  const width = (srcW / 180) * height;
  const s = useAnimatedStyle(() => ({ transform: [{ translateY: height / 2 }, { scaleY: 1 + 0.008 * b.value }, { translateY: -height / 2 }, { scaleX: flip ? -1 : 1 }] }));
  return (
    <Animated.View style={[{ position: "absolute", left: x * k - width / 2, top: y * k - height, width, height }, s]}>
      <Image source={src} style={{ width, height }} />
    </Animated.View>
  );
}

/** One customer on a trip: walks each leg at a natural pace, pauses where told, then goes. */
function Walker({ trip, k }: { trip: Trip; k: number }) {
  const sheet = SHEETS[trip.sheet];
  const parts = useMemo(() => {
    const walks = trip.legs.flatMap((l) => ("walk" in l ? [l.walk] : []));
    const pts: Pt[] = walks.flatMap((w, i) => (i ? w.slice(1) : w));
    return route(pts);
  }, [trip]);
  const d = useSharedValue(0);
  const face = useSharedValue(0);
  const op = useSharedValue(0);
  useEffect(() => {
    const speed = (CYCLE * 24) / sheet.frames;
    const steps: number[] = [];
    let walked = 0;
    let t = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const leg of trip.legs) {
      if ("walk" in leg) {
        const L = route(leg.walk).length;
        const ms = (L / speed + 0.45) * 1000;
        walked += L;
        steps.push(withTiming(walked, { duration: ms, easing: Easing.inOut(Easing.sin) }));
        const startAt = t;
        timers.push(setTimeout(() => (face.value = 0), startAt));
        t += ms;
      } else {
        const ms = leg.stand * 1000;
        steps.push(withDelay(ms, withTiming(walked, { duration: 1 })));
        const startAt = t;
        timers.push(
          setTimeout(() => {
            if (leg.face) face.value = leg.face;
            leg.at?.();
          }, startAt),
        );
        t += ms;
      }
    }
    d.value = withSequence(...(steps as [number]));
    op.value = withSequence(withTiming(1, { duration: 400 }), withDelay(Math.max(0, t - 800), withTiming(0, { duration: 400 })));
    timers.push(setTimeout(trip.onDone, t + 50));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const height = WALK_H * k;
  const fw = (sheet.fw / sheet.fh) * height;
  const { xs, ys, cum, length } = parts;
  const frames = sheet.frames;
  const box = useAnimatedStyle(() => {
    const s = Math.max(0, Math.min(length, d.value));
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    const seg = cum[i] - cum[i - 1] || 1;
    const u = (s - cum[i - 1]) / seg;
    const x = xs[i - 1] + (xs[i] - xs[i - 1]) * u;
    const y = ys[i - 1] + (ys[i] - ys[i - 1]) * u;
    const dir = face.value !== 0 ? face.value : xs[i] - xs[i - 1] < 0 ? -1 : 1;
    return { left: x * k - fw / 2, top: y * k - height, zIndex: Math.round(y), opacity: op.value, transform: [{ scaleX: dir }] };
  });
  const strip = useAnimatedStyle(() => {
    const walking = face.value === 0;
    const f = walking ? Math.floor(((d.value / CYCLE) % 1) * frames) : sheet.stand;
    return { transform: [{ translateX: -f * fw }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", width: fw, height, overflow: "hidden" }, box]}>
      <Animated.View style={[{ width: fw * frames, height }, strip]}>
        <Image source={sheet.src} style={{ width: fw * frames, height }} />
      </Animated.View>
    </Animated.View>
  );
}

function ChairPill({ chair, n, k, at, selected, onPress }: { chair: Chair; n: number; k: number; at: Pt; selected: boolean; onPress: () => void }) {
  const busy = chair.state === "busy";
  const left = Math.max(0, Math.ceil(chair.minutesTotal - chair.minutesDone));
  const p = busy ? Math.min(1, chair.minutesDone / (chair.minutesTotal || 1)) : 0;
  const label = busy ? `${chair.customerName.split(" ")[0]} · ${left} min` : chair.state === "free" ? "Free" : chair.state === "off" ? "Off today" : "Not in yet";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={busy ? `Chair ${n}, ${chair.customerName}, ${left} minutes left` : `Chair ${n}, ${label}`}
      style={{ position: "absolute", left: at[0] * k, top: at[1] * k, zIndex: 900, transform: [{ translateX: "-50%" }, { translateY: "-100%" }], flexDirection: "row", alignItems: "center", gap: 5, paddingLeft: 2, paddingRight: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: selected ? "rgba(60,34,24,0.9)" : "rgba(38,22,17,0.72)", borderWidth: selected ? 2 : 1, borderColor: selected ? glass.gold : glass.line, opacity: chair.state === "off" || chair.state === "notIn" ? 0.75 : 1 }}
    >
      <View style={{ width: 19, height: 19, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: busy ? glass.gold : "rgba(255,244,236,0.25)" }}>
        {busy ? (
          <Svg width={25} height={25} viewBox="0 0 24 24" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
            <Circle cx={12} cy={12} r={10.5} fill="none" stroke="rgba(255,244,236,0.25)" strokeWidth={2} />
            <Circle cx={12} cy={12} r={10.5} fill="none" stroke={glass.cream} strokeWidth={2} strokeLinecap="round" strokeDasharray={`${(p * 66).toFixed(1)} 66`} />
          </Svg>
        ) : null}
        <GT size={10} w="heavy" c={busy ? glass.ink : glass.cream}>
          {n}
        </GT>
      </View>
      <GT size={Math.max(10, 23.5 * k)} w="semibold" c={busy ? glass.cream : glass.soft}>
        {label}
      </GT>
    </Pressable>
  );
}

function ChairCard({ chair, n, selected, onPress, first }: { chair: Chair; n: number; selected: boolean; onPress: () => void; first: string }) {
  const busy = chair.state === "busy";
  const left = Math.max(0, Math.ceil(chair.minutesTotal - chair.minutesDone));
  const p = busy ? Math.min(1, chair.minutesDone / (chair.minutesTotal || 1)) : 0;
  const title = busy ? chair.customerName : chair.state === "free" ? (chair.next ? `Free · next ${chair.next.name.split(" ")[0]} ${chair.next.time}` : "Free") : chair.state === "off" ? "Off today" : "Not in yet";
  const sub = busy ? `${chair.services} · ${first}` : chair.state === "free" ? `${first} · ready${chair.late ? " · came in late" : ""}` : chair.state === "off" ? `${first} · ${chair.offReason === "leave" ? "on leave" : "weekly off"}` : `${first} · no check-in yet`;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Chair ${n}: ${title}. ${sub}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, backgroundColor: selected ? glass.card2 : glass.card, borderWidth: selected ? 2 : 1, borderColor: selected ? glass.gold : glass.line, opacity: chair.state === "off" ? 0.6 : 1 }}>
        <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Svg width={44} height={44} viewBox="0 0 44 44" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
            <Circle cx={22} cy={22} r={19} fill="none" stroke="rgba(255,244,236,0.18)" strokeWidth={4} />
            {busy ? <Circle cx={22} cy={22} r={19} fill="none" stroke={glass.gold} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${(p * 119.4).toFixed(1)} 119.4`} /> : null}
          </Svg>
          <GT size={14} w="heavy">
            {n}
          </GT>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <GT size={15} w="bold" numberOfLines={1} c={busy ? glass.cream : glass.soft}>
            {title}
          </GT>
          <GT size={12} c={glass.soft} numberOfLines={1}>
            {sub}
          </GT>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          {busy ? (
            <>
              <GT size={15} w="bold" c={glass.gold}>
                {inr(chair.amount)}
              </GT>
              <GT size={12} c={glass.soft} style={{ fontVariant: ["tabular-nums"] }}>
                {left} min left
              </GT>
            </>
          ) : (
            <GT size={12} c={glass.faint}>
              —
            </GT>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function PaidBubble({ amount, k, onDone }: { amount: number; k: number; onDone: () => void }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withSequence(withTiming(1, { duration: 350, easing: easeOut }), withDelay(1100, withTiming(2, { duration: 400 })));
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [p, onDone]);
  const s = useAnimatedStyle(() => ({ opacity: p.value <= 1 ? p.value : 2 - p.value, transform: [{ translateX: "-50%" }, { translateY: -p.value * 7 }, { scale: 0.8 + 0.2 * Math.min(1, p.value) }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", left: DESK[0] * k, top: (DESK[1] - 150) * k, zIndex: 950, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: glass.gold, shadowColor: glass.gold, shadowOpacity: 0.55, shadowRadius: 12 }, s]}>
      <GT size={Math.max(12, 34 * k)} w="heavy" c={glass.ink}>
        {inr(amount)} PAID
      </GT>
    </Animated.View>
  );
}

function FloorNote({ title, text }: { title: string; text: string }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 980, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(26,18,16,0.45)" }}>
      <View style={{ alignItems: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, backgroundColor: "rgba(38,22,17,0.8)", borderWidth: 1, borderColor: glass.line }}>
        <GT size={16} w="heavy">
          {title}
        </GT>
        <GT size={12.5} c={glass.soft}>
          {text}
        </GT>
      </View>
    </View>
  );
}

/** The owner's menu: leave requests, privacy, the data on this phone, sign out. */
function OwnerMenu({ open, onClose, demo }: { open: boolean; onClose: () => void; demo: boolean }) {
  const nav = useNav();
  const toast = useToast();
  const [confirm, setConfirm] = useState<"clear" | "demo" | "out" | null>(null);
  const close = () => {
    setConfirm(null);
    onClose();
  };
  const row = (label: string, onPress: () => void, tone: string = glass.cream) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderColor: "rgba(255,244,236,0.08)" }}>
      <GT size={15.5} w="bold" c={tone}>
        {label}
      </GT>
      <GT size={15} c={glass.soft}>
        ›
      </GT>
    </Pressable>
  );
  return (
    <GlassSheet open={open} onClose={close} label="Owner menu">
      <View style={{ gap: 4, paddingHorizontal: 20, paddingBottom: 20 }}>
        <GT size={20} w="heavy" style={{ marginBottom: 4 }}>
          Owner
        </GT>
        {confirm ? (
          <View style={{ gap: 12, paddingVertical: 8 }}>
            <GT size={15} w="bold" c={confirm === "out" ? glass.cream : glass.late}>
              {confirm === "out"
                ? "Sign out of the owner area on this phone?"
                : confirm === "clear"
                  ? "Delete every customer, visit, wallet, staff account and attendance record on this phone, and the owner password? The app goes back to first-time setup. This can't be undone."
                  : "Replace everything with demo data? Real data will be lost."}
            </GT>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <GhostButton label="Keep" style={{ flex: 1 }} onPress={() => setConfirm(null)} />
              <GhostButton
                label={confirm === "out" ? "Sign out" : confirm === "clear" ? "Delete all" : "Load demo"}
                tone={glass.late}
                style={{ flex: 1 }}
                onPress={() => {
                  if (confirm === "out") setSession(null);
                  else if (confirm === "clear") clearAll();
                  else resetToDemo();
                  if (confirm !== "out") toast(confirm === "clear" ? "All data cleared" : "Demo data loaded");
                  close();
                }}
              />
            </View>
          </View>
        ) : (
          <>
            {row("Leave requests", () => (close(), nav.push({ name: "leaveRequests" })))}
            {row("Privacy & terms", () => (close(), nav.push({ name: "legal" })))}
            <GT size={12} c={glass.soft} style={{ paddingTop: 12 }}>
              {demo ? "You're looking at demo data. Clear it before the salon starts using the app; you'll then set a new owner password and add your staff." : "All customer data lives only on this phone."}
            </GT>
            {row("Clear all data", () => setConfirm("clear"), glass.late)}
            {row("Load demo data", () => setConfirm("demo"))}
            {row("Sign out", () => setConfirm("out"), glass.gold2)}
          </>
        )}
      </View>
    </GlassSheet>
  );
}
