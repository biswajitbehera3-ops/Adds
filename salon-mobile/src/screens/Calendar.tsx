/**
 * Calendar (BUILD-SPEC 4.10, 5.1, 5.8). Opens on the month: every day with bookings has a
 * gold ring filled to how booked it is, a warm glow and its count. Tapping a day folds the
 * month into that week's strip and opens the day as a timeline (one column, or one per
 * stylist for the whole salon). "+ Book" opens the booking sheet; tapping a booking opens
 * its card with Arrived, No-show, Cancel, Call and WhatsApp.
 *
 * Motion (design-studies/staff-calendar-final.html): pill glides 260ms; rings sweep 700ms,
 * rippling out from today 24ms per day; fold 340ms on the drawer curve; the day enters
 * 260–280ms from the side you moved toward; a new booking scales in with a gold halo.
 * Nothing loops. Reduce Motion makes all of it instant.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeIn,
  FadeInLeft,
  FadeInRight,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { BookSheet } from "../components/BookSheet";
import { drawer, easeOut, GhostButton, GlassCard, GlassSheet, GlassSwitch, GoldButton, GT, StatusChip } from "../components/glass";
import { Press } from "../components/Press";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate } from "../domain/rules";
import { commit, useData } from "../domain/store";
import { inr } from "../format";
import { useNav } from "../nav/Navigator";
import { glass } from "../theme/tokens";
import { DOCK_SPACE, StaffDock, useStaffTabs } from "../nav/StaffTabs";
import { useCurrentStaff } from "./Attendance";

type Mode = "me" | "all";
type Load = Record<string, { count: number; minutes: number; load: number }>;
type Appt = ReturnType<typeof E.appointmentsOn>[number];

// Month card geometry: fixed sizes so the fold can be computed, not measured.
const PAD = 10;
const BAR = 40;
const HEADS = 22;
const CELL = 42;
const GAP = 3;
const GRID_TOP = PAD + BAR + HEADS;
const BAND = CELL + PAD * 2; // the folded month, the same height as the week strip
// Timeline.
const PX = 64;
const TL_TOP = 14;
const OPEN_MIN = C.minutesOf(config.appointments.open);
const CLOSE_MIN = C.minutesOf(config.appointments.close);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function Calendar() {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const today = istDate();

  const [mode, setMode] = useState<Mode>(me ? "me" : "all");
  const [month, setMonth] = useState(today.slice(0, 7));
  const [sel, setSel] = useState(today);
  const [view, setView] = useState<"month" | "day">("month");
  const [dir, setDir] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [booking, setBooking] = useState<{ day: string; time?: string } | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [width, setWidth] = useState(360);
  const fold = useSharedValue(0);
  const busy = useRef(false);
  // Rings sweep in when a month appears, not when it unfolds back from a day.
  const [sweep, setSweep] = useState(true);

  const staffId = mode === "me" ? (me?.id ?? null) : null;
  const tabs = useStaffTabs();
  // My approved leave days, shown on the month in "My bookings".
  const leaveDays = useMemo(() => {
    const out = new Set<string>();
    if (!me || mode !== "me") return out;
    for (const l of data.leaves) if (l.staffId === me.id && l.status === "APPROVED") for (let d = l.from; d <= l.to; d = C.addDays(d, 1)) if (!C.isClosed(d)) out.add(d);
    return out;
  }, [data, me, mode]);
  const loads: Load = useMemo(
    () => ({ ...E.appointmentLoad(data, C.addMonths(month, -1), staffId), ...E.appointmentLoad(data, month, staffId), ...E.appointmentLoad(data, C.addMonths(month, 1), staffId) }),
    [data, month, staffId],
  );
  const weekLoads: Load = useMemo(() => {
    const m = sel.slice(0, 7);
    return { ...E.appointmentLoad(data, C.addMonths(m, -1), staffId), ...E.appointmentLoad(data, m, staffId), ...E.appointmentLoad(data, C.addMonths(m, 1), staffId) };
  }, [data, sel, staffId]);

  const openDay = (day: string) => {
    if (view !== "month" || busy.current) return;
    busy.current = true;
    if (!day.startsWith(month)) {
      setSweep(false);
      setMonth(day.slice(0, 7));
    }
    setSel(day);
    setDir(0);
    const done = () => {
      setView("day");
      busy.current = false;
    };
    if (reduced) {
      fold.value = 1;
      done();
      return;
    }
    setTimeout(() => {
      fold.value = withTiming(1, { duration: 340, easing: drawer }, (fin) => {
        if (fin) runOnJS(done)();
      });
    }, 90);
  };

  const closeDay = () => {
    setSweep(false);
    setMonth(sel.slice(0, 7));
    setView("month");
    fold.value = 1;
    fold.value = reduced ? 0 : withTiming(0, { duration: 340, easing: drawer });
  };

  const goDay = (day: string) => {
    if (day === sel) return;
    setDir(day > sel ? 1 : -1);
    setSel(day);
  };

  const changeMode = (m: Mode) => {
    setSweep(true);
    setMode(m);
  };

  const changeMonth = (n: number) => {
    setSweep(true);
    setDir(n);
    setMonth((m) => C.addMonths(m, n));
  };

  const onBooked = (appt: { id: string; at: string; staffId: string | null }, name: string) => {
    setBooking(null);
    const day = istDate(new Date(appt.at));
    if (appt.staffId !== me?.id) setMode("all");
    setFresh(appt.id);
    const t = C.clock(new Date(Date.parse(appt.at) + 330 * 60000).toISOString().slice(11, 16));
    toast(`Booked · ${name}, ${t.time} ${t.ampm} ${C.shortDay(day)}`);
    if (view === "month") setTimeout(() => openDay(day), 380);
    else goDay(day);
    setTimeout(() => setFresh(null), 2400);
  };

  const dayTitle = (sel === today ? "Today, " : "") + C.WEEKDAYS[C.dayOfWeek(sel)].slice(0, 3) + " " + C.dayNum(sel);

  return (
    <View style={{ flex: 1, backgroundColor: glass.deep }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <LinearGradient colors={[glass.glow, glass.mid, glass.deep]} locations={[0, 0.42, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, paddingTop: insets.top + 8, paddingHorizontal: 18, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flexShrink: 1 }}>
            {view === "day" ? (
              <Pressable onPress={closeDay} accessibilityRole="button" accessibilityLabel={`Back to ${C.monthName(sel.slice(0, 7))}`} hitSlop={10}>
                <GT size={13.5} w="bold" c={glass.gold2}>
                  ‹ {C.monthName(sel.slice(0, 7))}
                </GT>
              </Pressable>
            ) : (
              <Pressable onPress={tabs ? undefined : nav.pop} disabled={!!tabs} accessibilityRole={tabs ? "text" : "button"} accessibilityLabel={tabs ? undefined : "Back"} hitSlop={10}>
                <GT size={13.5} w="semibold" c={glass.soft}>
                  {tabs ? "" : "‹ "}
                  {C.WEEKDAYS[C.dayOfWeek(today)]} {C.dayNum(today)} {C.MONTHS[Number(today.slice(5, 7)) - 1].slice(0, 3)}
                </GT>
              </Pressable>
            )}
            <Animated.View key={view === "day" ? sel : "cal"} entering={reduced ? undefined : FadeIn.duration(240)}>
              <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34, letterSpacing: -0.3 }}>
                {view === "day" ? dayTitle : "Calendar"}
              </GT>
            </Animated.View>
          </View>
          <Press onPress={() => setBooking({ day: view === "day" ? sel : today })} accessibilityLabel="Book an appointment" style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 15, paddingVertical: 9 }}>
            <GT size={14} w="heavy" c={glass.ink}>
              + Book
            </GT>
          </Press>
        </View>

        {me ? (
          <GlassSwitch
            options={[
              { key: "me", label: "My bookings" },
              { key: "all", label: "Whole salon" },
            ]}
            value={mode}
            onChange={changeMode}
          />
        ) : null}

        <View style={{ flex: 1 }}>
          {view === "month" ? (
            <MonthView
              month={month}
              sel={sel}
              today={today}
              loads={loads}
              fold={fold}
              width={width - 36}
              sweep={sweep && !reduced}
              dir={dir}
              mode={mode}
              data={data}
              staffId={staffId}
              onPick={openDay}
              onMonth={changeMonth}
              leaveDays={leaveDays}
              bottom={tabs ? DOCK_SPACE : 0}
            />
          ) : (
            <DayView
              data={data}
              day={sel}
              today={today}
              dir={dir}
              mode={mode}
              meId={me?.id ?? null}
              loads={weekLoads}
              width={width - 36}
              fresh={fresh}
              onPick={goDay}
              onOpen={setOpenId}
              onEmpty={(time) => setBooking({ day: sel, time })}
              bottom={insets.bottom + (tabs ? DOCK_SPACE : 0)}
            />
          )}
        </View>
      </View>

      <StaffDock />
      <BookingCard id={openId} meId={me?.id ?? null} onClose={() => setOpenId(null)} />
      <BookSheet open={!!booking} day={booking?.day ?? today} time={booking?.time} top={insets.top + 30} onClose={() => setBooking(null)} onBooked={onBooked} />
    </View>
  );
}

// ── Month ────────────────────────────────────────────────────────────────────

function MonthView({
  month,
  sel,
  today,
  loads,
  fold,
  width,
  sweep,
  dir,
  mode,
  data,
  staffId,
  onPick,
  onMonth,
  leaveDays,
  bottom,
}: {
  month: string;
  sel: string;
  today: string;
  loads: Load;
  fold: SharedValue<number>;
  width: number;
  sweep: boolean;
  dir: number;
  mode: Mode;
  data: ReturnType<typeof useData>;
  staffId: string | null;
  onPick: (day: string) => void;
  onMonth: (n: number) => void;
  leaveDays: Set<string>;
  bottom: number;
}) {
  const reduced = useReducedMotion();
  const grid = C.monthGrid(month);
  const cw = (width - PAD * 2 - GAP * 6) / 7;
  const H = GRID_TOP + grid.rows * CELL + (grid.rows - 1) * GAP + PAD;
  const pos = (day: string) => {
    const i = grid.lead + grid.days.indexOf(day);
    return { x: (i % 7) * (cw + GAP), y: Math.floor(i / 7) * (CELL + GAP), row: Math.floor(i / 7) };
  };
  const selIn = sel.startsWith(month);
  const selRow = selIn ? pos(sel).row : 0;
  const rowTop = GRID_TOP + selRow * (CELL + GAP);

  // The gold pill glides between days.
  const px = useSharedValue(selIn ? pos(sel).x : 0);
  const py = useSharedValue(selIn ? pos(sel).y : 0);
  const first = useRef(true);
  useEffect(() => {
    if (!selIn) return;
    const p = pos(sel);
    if (first.current || reduced) {
      px.value = p.x;
      py.value = p.y;
    } else {
      px.value = withTiming(p.x, { duration: 260, easing: easeOut });
      py.value = withTiming(p.y, { duration: 260, easing: easeOut });
    }
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, month, cw]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: px.value }, { translateY: py.value }] }));

  const card = useAnimatedStyle(() => ({ height: interpolate(fold.value, [0, 1], [H, BAND]) }));
  const inner = useAnimatedStyle(() => ({ transform: [{ translateY: -fold.value * (rowTop - PAD) }] }));
  const fades = useAnimatedStyle(() => ({ opacity: interpolate(fold.value, [0, 0.45], [1, 0], "clamp") }));
  const below = useAnimatedStyle(() => ({
    opacity: interpolate(fold.value, [0, 0.4], [1, 0], "clamp"),
    transform: [{ translateY: fold.value * 8 }],
  }));

  const todayIdx = today.startsWith(month) ? C.dayNum(today) : 0;

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 40 + bottom }} showsVerticalScrollIndicator={false} scrollEnabled>
      <Animated.View style={[{ overflow: "hidden", borderRadius: 22, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }, card]}>
        <Animated.View style={[{ padding: PAD }, inner]}>
          <Animated.View style={[{ height: BAR, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }, fades]}>
            <RoundButton label="‹" a11y="Previous month" onPress={() => onMonth(-1)} />
            <GT size={15.5} w="bold" style={{ marginTop: 6 }}>
              {C.monthName(month)}
            </GT>
            <RoundButton label="›" a11y="Next month" onPress={() => onMonth(1)} />
          </Animated.View>
          <Animated.View style={[{ height: HEADS, flexDirection: "row", gap: GAP }, fades]}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <GT key={i} size={11} w="bold" c={glass.faint} style={{ width: cw, textAlign: "center" }}>
                {d}
              </GT>
            ))}
          </Animated.View>
          <Animated.View
            key={`${month}-${mode}`}
            entering={reduced || !dir ? undefined : (dir > 0 ? FadeInRight : FadeInLeft).duration(280)}
            style={{ height: grid.rows * CELL + (grid.rows - 1) * GAP }}
          >
            {selIn ? <Animated.View pointerEvents="none" style={[{ position: "absolute", width: cw, height: CELL, borderRadius: 13, backgroundColor: glass.gold }, pill]} /> : null}
            {grid.days.map((day) => {
              const p = pos(day);
              const l = loads[day];
              return (
                <DayCell
                  key={day}
                  day={day}
                  x={p.x}
                  y={p.y}
                  w={cw}
                  count={l?.count ?? 0}
                  load={l?.load ?? 0}
                  isToday={day === today}
                  isSel={day === sel}
                  closed={C.isClosed(day)}
                  leave={leaveDays.has(day)}
                  delay={todayIdx ? Math.abs(C.dayNum(day) - todayIdx) * 24 : C.dayNum(day) * 24}
                  sweep={sweep}
                  fold={fold}
                  inRow={p.row === selRow}
                  onPress={() => onPick(day)}
                />
              );
            })}
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={below}>
        <TodayCard data={data} today={today} staffId={staffId} mode={mode} onOpen={() => onPick(today)} />
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 12 }}>
          <Legend swatch={<View style={{ width: 12, height: 12, borderRadius: 4, borderWidth: 1.5, borderColor: glass.gold2 }} />} label="Today" />
          <Legend swatch={<View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: glass.gold }} />} label="Selected" />
          <Legend swatch={<MiniRing />} label="Ring = how booked" />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function RoundButton({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  return (
    <Press onPress={onPress} accessibilityLabel={a11y} hitSlop={6} style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
      <GT size={17} w="bold" style={{ marginTop: -2 }}>
        {label}
      </GT>
    </Press>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      {swatch}
      <GT size={11.5} c={glass.faint}>
        {label}
      </GT>
    </View>
  );
}

function MiniRing() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx={6} cy={6} r={4.6} stroke="rgba(255,244,236,0.18)" strokeWidth={2} fill="none" />
      <Circle cx={6} cy={6} r={4.6} stroke={glass.gold2} strokeWidth={2} fill="none" strokeDasharray={`${2 * Math.PI * 4.6}`} strokeDashoffset={2 * Math.PI * 4.6 * 0.35} transform="rotate(-90 6 6)" />
    </Svg>
  );
}

const R = 15.6;
const CIRC = 2 * Math.PI * R;

function DayCell({
  day,
  x,
  y,
  w,
  count,
  load,
  isToday,
  isSel,
  closed,
  leave,
  delay,
  sweep,
  fold,
  inRow,
  onPress,
}: {
  day: string;
  x: number;
  y: number;
  w: number;
  count: number;
  load: number;
  isToday: boolean;
  isSel: boolean;
  closed: boolean;
  leave?: boolean;
  delay: number;
  sweep: boolean;
  fold: SharedValue<number>;
  inRow: boolean;
  onPress: () => void;
}) {
  const p = useSharedValue(sweep ? 0 : load);
  useEffect(() => {
    p.value = sweep ? withDelay(delay, withTiming(load, { duration: 700, easing: easeOut })) : load;
    // Only a new load re-sweeps; selection changes don't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);
  const ring = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - p.value) }));
  const glow = useAnimatedStyle(() => ({ opacity: load ? Math.min(1, p.value / load) : 0, transform: [{ scale: 0.7 + 0.3 * Math.min(1, load ? p.value / load : 1) }] }));
  const hide = useAnimatedStyle(() => ({ opacity: inRow ? 1 : interpolate(fold.value, [0, 0.45], [1, 0], "clamp") }));
  const full = load >= 0.75;
  const fg = isSel ? glass.ink : closed ? glass.faint : glass.cream;
  const stroke = isSel ? glass.ink : full ? glass.gold : glass.gold2;

  return (
    <Animated.View style={[{ position: "absolute", left: x, top: y, width: w, height: CELL }, hide]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: isSel }}
        accessibilityLabel={`${C.shortDay(day)}${closed ? ", closed" : leave ? ", you're on leave" : `, ${count} booking${count === 1 ? "" : "s"}, ${Math.round(load * 100)}% booked`}`}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 13, borderWidth: isToday && !isSel ? 1.5 : 0, borderColor: glass.gold2, opacity: closed ? 0.45 : 1 }}
      >
        {leave && !isSel ? <View pointerEvents="none" style={{ position: "absolute", top: 3, left: 3, right: 3, bottom: 3, borderRadius: 11, backgroundColor: "#9FB8E6" }} /> : null}
        {count && !isSel ? (
          <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 3, left: 3, right: 3, bottom: 3, borderRadius: 12, backgroundColor: `rgba(228,166,123,${(0.06 + load * 0.5).toFixed(3)})` }, glow]} />
        ) : null}
        {!closed && !leave ? (
          <Svg width={34} height={34} style={{ position: "absolute" }} pointerEvents="none">
            <Circle cx={17} cy={17} r={R} stroke={isSel ? "rgba(42,26,18,0.22)" : "rgba(255,244,236,0.09)"} strokeWidth={2.4} fill="none" />
            <AnimatedCircle cx={17} cy={17} r={R} stroke={stroke} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} animatedProps={ring} transform="rotate(-90 17 17)" />
          </Svg>
        ) : null}
        <GT size={15} w={isSel || leave ? "heavy" : "semibold"} c={leave && !isSel ? glass.ink : fg} style={{ fontVariant: ["tabular-nums"], marginTop: leave ? -6 : 0 }}>
          {C.dayNum(day)}
        </GT>
        {leave ? (
          <GT size={8.5} w="heavy" c={glass.ink} style={{ position: "absolute", bottom: 5, letterSpacing: 0.3 }}>
            LEAVE
          </GT>
        ) : null}
        {count && !leave ? (
          <View style={{ position: "absolute", top: 0, right: 1, paddingHorizontal: 3, borderRadius: 999, backgroundColor: full && !isSel ? glass.gold : "transparent" }}>
            <GT size={9.5} w="heavy" c={isSel || full ? glass.ink : glass.gold2} style={{ lineHeight: 13 }}>
              {count}
            </GT>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function TodayCard({ data, today, staffId, mode, onOpen }: { data: ReturnType<typeof useData>; today: string; staffId: string | null; mode: Mode; onOpen: () => void }) {
  const reduced = useReducedMotion();
  const all = E.appointmentsOn(data, today).filter((a) => a.status !== "CANCELLED" && (!staffId || a.staffId === staffId));
  const now = new Date();
  const left = all.filter((a) => ["booked", "late", "inchair"].includes(C.bookingState(data, a, now)));
  const next = left[0];
  const load = E.appointmentLoad(data, today.slice(0, 7), staffId)[today]?.load ?? 0;
  const bar = useSharedValue(reduced ? load : 0);
  useEffect(() => {
    bar.value = reduced ? load : withDelay(150, withTiming(load, { duration: 700, easing: easeOut }));
  }, [load, reduced, bar]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: bar.value }] }));
  return (
    <Press onPress={onOpen} accessibilityLabel={`Today: ${all.length} bookings, ${left.length} left. Open today's timeline`} scaleTo={0.985}>
      <GlassCard style={{ padding: 14, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <GT size={16} w="heavy">
            Today · {C.WEEKDAYS[C.dayOfWeek(today)].slice(0, 3)} {C.dayNum(today)}
          </GT>
          <GT size={12.5} c={glass.soft}>
            {all.length} bookings · {left.length} left
          </GT>
        </View>
        {next ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 14, backgroundColor: "rgba(26,18,16,0.4)", borderWidth: 1, borderColor: glass.line }}>
            <View>
              <GT size={15} w="heavy" style={{ fontVariant: ["tabular-nums"] }}>
                {C.clock(next.time).time}
              </GT>
              <GT size={11} w="bold" c={glass.faint}>
                {C.clock(next.time).ampm}
              </GT>
            </View>
            <View style={{ flex: 1 }}>
              <GT size={14.5} w="bold" numberOfLines={1}>
                {next.customerName}
              </GT>
              <GT size={12} c={glass.soft} numberOfLines={1}>
                {next.serviceNames.join(" + ")}
                {mode === "all" && next.stylistName ? ` · ${next.stylistName.split(" ")[0]}` : ""}
              </GT>
            </View>
            <StatusChip state={C.bookingState(data, next, now)} />
          </View>
        ) : (
          <GT size={13} c={glass.soft}>
            {C.isClosed(today) ? "The salon is closed today." : "Nothing left today."}
          </GT>
        )}
        <View style={{ height: 6, borderRadius: 6, backgroundColor: "rgba(255,244,236,0.1)", overflow: "hidden" }}>
          <Animated.View style={[{ height: 6, borderRadius: 6, backgroundColor: glass.gold, transformOrigin: "left" }, fill]} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: -4 }}>
          <GT size={12} c={glass.soft}>
            {mode === "all" ? "Salon" : "Your day"} is {Math.round(load * 100)}% booked
          </GT>
          <GT size={12} c={glass.soft}>
            {C.clock(config.appointments.open).time}
            {C.clock(config.appointments.open).ampm.toLowerCase()} – {C.clock(config.appointments.close).time}
            {C.clock(config.appointments.close).ampm.toLowerCase()}
          </GT>
        </View>
        <GT size={13} w="heavy" c={glass.gold2}>
          Open today's timeline →
        </GT>
      </GlassCard>
    </Press>
  );
}

// ── Day ──────────────────────────────────────────────────────────────────────

function DayView({
  data,
  day,
  today,
  dir,
  mode,
  meId,
  loads,
  width,
  fresh,
  onPick,
  onOpen,
  onEmpty,
  bottom,
}: {
  data: ReturnType<typeof useData>;
  day: string;
  today: string;
  dir: number;
  mode: Mode;
  meId: string | null;
  loads: Load;
  width: number;
  fresh: string | null;
  onPick: (day: string) => void;
  onOpen: (id: string) => void;
  onEmpty: (time: string) => void;
  bottom: number;
}) {
  const reduced = useReducedMotion();
  const week = C.weekOf(day);
  const idx = week.indexOf(day);
  const cell = (width - 12) / 7;
  const px = useSharedValue(idx * cell);
  const weekKey = week[0];
  const lastWeek = useRef(weekKey);
  useEffect(() => {
    const jump = lastWeek.current !== weekKey || reduced;
    px.value = jump ? idx * cell : withTiming(idx * cell, { duration: 260, easing: easeOut });
    lastWeek.current = weekKey;
  }, [idx, cell, weekKey, reduced, px]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: px.value }] }));

  const swipe = (n: number, step: number) => onPick(C.addDays(day, n * step));
  const stripPan = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 40) runOnJS(swipe)(e.translationX < 0 ? 1 : -1, 7);
    });

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <GestureDetector gesture={stripPan}>
        <View style={{ height: BAND, padding: 6, borderRadius: 22, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line, flexDirection: "row" }}>
          <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 6, left: 6, width: cell, bottom: 6, borderRadius: 14, backgroundColor: glass.gold }, pill]} />
          <Animated.View key={weekKey} entering={reduced || !dir ? undefined : (dir > 0 ? FadeInRight : FadeInLeft).duration(280)} style={{ flexDirection: "row", flex: 1 }}>
            {week.map((d, i) => {
              const closed = C.isClosed(d);
              const on = d === day;
              const l = loads[d]?.load ?? 0;
              return (
                <Pressable
                  key={d}
                  onPress={() => onPick(d)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${C.shortDay(d)}${closed ? ", closed" : `, ${loads[d]?.count ?? 0} bookings`}`}
                  style={{ width: cell, alignItems: "center", justifyContent: "center", gap: 1, opacity: closed ? 0.4 : 1 }}
                >
                  <GT size={11} w="bold" c={on ? glass.ink : glass.faint}>
                    {C.WEEKDAYS[C.dayOfWeek(d)][0]}
                  </GT>
                  <GT size={17} w="bold" c={on ? glass.ink : d === today ? glass.gold2 : glass.cream} style={{ fontVariant: ["tabular-nums"] }}>
                    {C.dayNum(d)}
                  </GT>
                  <LoadBar load={closed ? 0 : l} on={on} delay={i * 40} />
                </Pressable>
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>
      <Timeline data={data} day={day} today={today} dir={dir} mode={mode} meId={meId} width={width} fresh={fresh} onOpen={onOpen} onEmpty={onEmpty} onSwipe={(n) => swipe(n, 1)} bottom={bottom} />
    </View>
  );
}

function LoadBar({ load, on, delay }: { load: number; on: boolean; delay: number }) {
  const reduced = useReducedMotion();
  const s = useSharedValue(reduced ? load : 0);
  useEffect(() => {
    s.value = reduced ? load : withDelay(delay, withTiming(load, { duration: 520, easing: easeOut }));
  }, [load, reduced, delay, s]);
  const st = useAnimatedStyle(() => ({ transform: [{ scaleX: s.value }] }));
  return (
    <View style={{ width: 22, height: 3, borderRadius: 3, marginTop: 2, overflow: "hidden", backgroundColor: on ? "rgba(42,26,18,0.2)" : "rgba(255,244,236,0.12)" }}>
      <Animated.View style={[{ height: 3, borderRadius: 3, backgroundColor: on ? glass.ink : glass.gold2, transformOrigin: "left" }, st]} />
    </View>
  );
}

const freshIn = () => {
  "worklet";
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.9 }] },
    animations: {
      opacity: withTiming(1, { duration: 300 }),
      transform: [{ scale: withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }) }],
    },
  };
};

function Timeline({
  data,
  day,
  today,
  dir,
  mode,
  meId,
  width,
  fresh,
  onOpen,
  onEmpty,
  onSwipe,
  bottom,
}: {
  data: ReturnType<typeof useData>;
  day: string;
  today: string;
  dir: number;
  mode: Mode;
  meId: string | null;
  width: number;
  fresh: string | null;
  onOpen: (id: string) => void;
  onEmpty: (time: string) => void;
  onSwipe: (n: number) => void;
  bottom: number;
}) {
  const reduced = useReducedMotion();
  const scroll = useRef<ScrollView>(null);
  const now = new Date();
  const nowMin = C.salonMinutesNow(now);
  const list = E.appointmentsOn(data, day).filter((a) => a.status !== "CANCELLED" && (mode === "all" || a.staffId === meId));
  const myLeave = meId ? E.leaveOn(data, meId, day) : null;
  const stylists = data.staff.filter((s) => s.active);
  const cols: { id: string | null; name: string; initial: string; color: string }[] =
    mode === "me"
      ? [{ id: meId, name: "You", initial: "", color: glass.gold }]
      : [
          ...stylists.map((s, i) => ({ id: s.id, name: s.id === meId ? "You" : s.name.split(" ")[0], initial: s.name[0], color: glass.stylists[i % glass.stylists.length] })),
          ...(list.some((a) => !a.staffId) ? [{ id: null, name: "Anyone", initial: "★", color: glass.faint }] : []),
        ];
  const gutter = 46;
  const colW = mode === "me" ? width - gutter - 10 : Math.max(96, (width - gutter) / cols.length);
  const wide = mode === "all" && gutter + colW * cols.length > width + 1;
  const height = TL_TOP + ((CLOSE_MIN - OPEN_MIN) / 60) * PX + 20;
  const yOf = (min: number) => TL_TOP + ((min - OPEN_MIN) / 60) * PX;

  useEffect(() => {
    const target = fresh ? list.find((a) => a.id === fresh) : null;
    const y = target ? yOf(C.minutesOf(target.time)) - 90 : day === today ? yOf(nowMin) - 60 : 0;
    const t = setTimeout(() => scroll.current?.scrollTo({ y: Math.max(0, y), animated: false }), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, mode, fresh]);

  const pan = Gesture.Pan()
    .enabled(!wide)
    .activeOffsetX([-30, 30])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 50) runOnJS(onSwipe)(e.translationX < 0 ? 1 : -1);
    });

  const tapEmpty = (y: number) => {
    if (mode !== "me" || C.isClosed(day) || myLeave) return;
    const slot = config.appointments.slotMinutes;
    const min = OPEN_MIN + Math.floor((((y - TL_TOP) / PX) * 60) / slot) * slot;
    if (min < OPEN_MIN || min >= CLOSE_MIN) return;
    onEmpty(`${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`);
  };

  const body = (
    <View style={{ width: wide ? gutter + colW * cols.length : width, flex: 1 }}>
      {mode === "all" ? (
        <View style={{ flexDirection: "row", paddingLeft: gutter, paddingVertical: 8, backgroundColor: "rgba(40,25,20,0.6)", borderTopLeftRadius: 22, borderTopRightRadius: wide ? 0 : 22 }}>
          {cols.map((c) => (
            <View key={c.id ?? "any"} style={{ width: colW, alignItems: "center", gap: 3 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.color, alignItems: "center", justifyContent: "center" }}>
                <GT size={12} w="heavy" c={glass.ink}>
                  {c.initial}
                </GT>
              </View>
              <GT size={11.5} w="bold" c={c.id === meId ? glass.gold2 : glass.soft}>
                {c.name}
              </GT>
              {c.id && E.leaveOn(data, c.id, day) ? (
                <GT size={9.5} w="heavy" c="#9FB8E6">
                  ON LEAVE
                </GT>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottom + 40 }}>
        <Animated.View key={`${day}-${mode}`} entering={reduced ? undefined : dir > 0 ? FadeInRight.duration(280) : dir < 0 ? FadeInLeft.duration(280) : FadeIn.duration(260)} style={{ height }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={(e) => tapEmpty(e.nativeEvent.locationY)} accessibilityLabel="Book at this time" accessible={mode === "me"} />
          {Array.from({ length: (CLOSE_MIN - OPEN_MIN) / 60 + 1 }, (_, i) => {
            const h = OPEN_MIN / 60 + i;
            return (
              <View key={h} pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: TL_TOP + i * PX, borderTopWidth: 1, borderColor: "rgba(255,244,236,0.08)" }}>
                <GT size={11} w="bold" c={glass.faint} style={{ position: "absolute", left: 0, top: -8, width: 40, textAlign: "right" }}>
                  {((h + 11) % 12) + 1}
                  {h < 12 ? "a" : "p"}
                </GT>
              </View>
            );
          })}
          {mode === "me" && myLeave && !C.isClosed(day) ? (
            <View style={{ position: "absolute", left: gutter, right: 10, top: TL_TOP + 40, padding: 14, borderRadius: 18, backgroundColor: "rgba(159,184,230,0.16)", borderWidth: 1, borderColor: "rgba(159,184,230,0.45)", gap: 2 }}>
              <GT size={16} w="heavy">
                You're on leave
              </GT>
              <GT size={12.5} c={glass.soft}>
                {({ CASUAL: "Casual", SICK: "Sick", OTHER: "Other" } as const)[myLeave.type]} · approved by the owner{myLeave.bookings === "REASSIGNED" ? " · your bookings were moved" : ""}. Nobody can book you today.
              </GT>
            </View>
          ) : C.isClosed(day) ? (
            <GT size={14} c={glass.faint} style={{ position: "absolute", left: gutter, right: 10, top: TL_TOP + 60, textAlign: "center" }}>
              Closed. {C.WEEKDAYS[C.dayOfWeek(day)]} is the weekly off.
            </GT>
          ) : !list.length ? (
            <GT size={14} c={glass.faint} style={{ position: "absolute", left: gutter, right: 10, top: TL_TOP + 60, textAlign: "center" }}>
              No bookings yet.{mode === "me" ? " Tap a time to book." : ""}
            </GT>
          ) : null}
          {list.map((a) => {
            const col = mode === "me" ? 0 : cols.findIndex((c) => c.id === a.staffId);
            const top = yOf(C.minutesOf(a.time));
            const h = Math.max((a.minutes / 60) * PX - 4, 24);
            const state = C.bookingState(data, a, now);
            return (
              <Block
                key={a.id}
                a={a}
                state={state}
                top={top}
                left={gutter + 4 + col * colW}
                width={colW - 8}
                height={h}
                showChip={mode === "me" && h > 30}
                accent={mode === "all" ? cols[col]?.color : glass.gold}
                fresh={a.id === fresh && !reduced}
                onPress={() => onOpen(a.id)}
              />
            );
          })}
          {day === today && nowMin >= OPEN_MIN && nowMin <= CLOSE_MIN ? (
            <View pointerEvents="none" style={{ position: "absolute", left: 42, right: 0, top: yOf(nowMin), height: 2, backgroundColor: glass.gold2 }}>
              <View style={{ position: "absolute", left: -5, top: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: glass.gold2 }} />
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: glass.card, borderWidth: 1, borderBottomWidth: 0, borderColor: glass.line, overflow: "hidden" }}>
        {wide ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </View>
    </GestureDetector>
  );
}

function Block({
  a,
  state,
  top,
  left,
  width,
  height,
  showChip,
  accent,
  fresh,
  onPress,
}: {
  a: Appt;
  state: C.BookingState;
  top: number;
  left: number;
  width: number;
  height: number;
  showChip: boolean;
  accent: string;
  fresh: boolean;
  onPress: () => void;
}) {
  const halo = useSharedValue(fresh ? 1 : 0);
  useEffect(() => {
    if (fresh) halo.value = withDelay(400, withTiming(0, { duration: 1600, easing: easeOut }));
  }, [fresh, halo]);
  const haloStyle = useAnimatedStyle(() => ({ opacity: halo.value }));
  const bg = state === "done" || state === "noshow" ? "rgba(255,244,236,0.06)" : state === "inchair" ? "rgba(228,166,123,0.34)" : "rgba(228,166,123,0.18)";
  const edge = state === "done" || state === "noshow" ? "rgba(255,248,241,0.25)" : state === "late" ? glass.late : accent;
  const dim = state === "done" || state === "noshow";
  const t = C.clock(a.time);
  return (
    <Animated.View entering={fresh ? freshIn : undefined} style={{ position: "absolute", top, left, width, height }}>
      {fresh ? <Animated.View pointerEvents="none" style={[{ position: "absolute", top: -3, left: -3, right: -3, bottom: -3, borderRadius: 14, borderWidth: 2, borderColor: glass.gold2 }, haloStyle]} /> : null}
      <Press
        onPress={onPress}
        scaleTo={0.98}
        accessibilityLabel={`${t.time} ${t.ampm}, ${a.customerName}, ${a.serviceNames.join(" and ")}${a.stylistName ? ` with ${a.stylistName}` : ""}, ${state}`}
        style={{ flex: 1, borderRadius: 12, backgroundColor: bg, borderLeftWidth: 3, borderLeftColor: edge, paddingHorizontal: 9, paddingVertical: 5, overflow: "hidden" }}
      >
        <GT size={13.5} w="bold" c={dim ? glass.faint : glass.cream} numberOfLines={1} style={{ paddingRight: showChip ? 70 : 0 }}>
          {a.customerName}
        </GT>
        {height > 34 ? (
          <GT size={11.5} c={dim ? glass.faint : glass.soft} numberOfLines={1}>
            {t.time} · {a.serviceNames.join(" + ")}
          </GT>
        ) : null}
        {showChip ? (
          <View style={{ position: "absolute", right: 6, top: 6 }}>
            <StatusChip state={state} small />
          </View>
        ) : null}
      </Press>
    </Animated.View>
  );
}

// ── A booking's card ─────────────────────────────────────────────────────────

function BookingCard({ id, meId, onClose }: { id: string | null; meId: string | null; onClose: () => void }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const [shown, setShown] = useState<string | null>(id);
  const [confirmCancel, setConfirmCancel] = useState(false);
  useEffect(() => {
    if (id) setShown(id);
    setConfirmCancel(false);
  }, [id]);
  const appt = shown ? data.appointments.find((x) => x.id === shown) : null;
  const a = appt ? E.appointmentsOn(data, istDate(new Date(appt.at))).find((x) => x.id === shown) : null;
  const now = new Date();
  const run = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Something went wrong", "error");
    }
  };

  let body: React.ReactNode = null;
  if (a) {
    const state = C.bookingState(data, a, now);
    const t = C.clock(a.time);
    const price = a.serviceIds.reduce((sum, sid) => sum + (config.services.find((s) => s.id === sid)?.price ?? 0), 0);
    const isToday = istDate(new Date(a.at)) === istDate(now);
    const started = Date.parse(a.at) <= now.getTime();
    const canArrive = a.status === "BOOKED" && isToday && !!meId;
    body = (
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <GT size={22} w="heavy">
              {a.customerName}
            </GT>
            <GT size={13.5} c={glass.soft}>
              {a.serviceNames.join(" + ")} · {a.minutes} min · {a.stylistName ? `with ${a.stylistName.split(" ")[0]}` : "anyone free"}
            </GT>
          </View>
          <StatusChip state={state} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Fact label="Time" value={`${t.time} ${t.ampm}`} />
          <Fact label="Day" value={C.shortDay(istDate(new Date(a.at)))} />
          <Fact label="Bill" value={inr(price)} />
        </View>
        {a.note ? (
          <GT size={13} c={glass.soft}>
            “{a.note}”
          </GT>
        ) : null}
        {canArrive ? (
          <GoldButton
            label="Arrived · start visit"
            onPress={() =>
              run(() => {
                const r = commit((d) => E.appointmentArrived(d, { id: a.id, staffId: a.staffId ?? meId! }));
                onClose();
                setTimeout(() => nav.push({ name: "visit", id: r.visit.id }), 300);
              })
            }
          />
        ) : null}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <GhostButton label="Call" style={{ flex: 1 }} onPress={() => a.phone && Linking.openURL(`tel:${a.phone}`)} />
          <GhostButton
            label="WhatsApp"
            style={{ flex: 1 }}
            onPress={() =>
              run(() => {
                const m = E.appointmentMessage(data, a.id, isToday ? "reminder" : "confirm");
                Linking.openURL(E.whatsappLink(m.phone, m.message));
              })
            }
          />
        </View>
        {a.status === "BOOKED" ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {started ? <GhostButton label="No-show" style={{ flex: 1 }} tone={glass.late} onPress={() => run(() => (commit((d) => E.markNoShow(d, a.id)), toast("Marked as no-show"), onClose()))} /> : null}
            <GhostButton
              label={confirmCancel ? "Tap again to cancel" : "Cancel booking"}
              style={{ flex: 1 }}
              tone={glass.late}
              onPress={() => (confirmCancel ? run(() => (commit((d) => E.cancelAppointment(d, a.id)), toast("Booking cancelled"), onClose())) : setConfirmCancel(true))}
            />
          </View>
        ) : null}
        {a.status === "BOOKED" && !isToday ? (
          <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
            Arrived opens on the day.
          </GT>
        ) : null}
      </View>
    );
  }
  return (
    <GlassSheet open={!!id} onClose={onClose} label="Booking">
      {body}
    </GlassSheet>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, padding: 10, borderRadius: 14, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
      <GT size={11} w="bold" c={glass.faint}>
        {label}
      </GT>
      <GT size={15} w="heavy" numberOfLines={1}>
        {value}
      </GT>
    </View>
  );
}
