/**
 * Owner Earnings tab (BUILD-SPEC 6.3, approved design `design-studies/owner-earnings-final.html`):
 * three comparison cards (Today / 7 days / Month) that switch the period, the total against
 * the period before with a bar chart, and the stylists ranked. A stylist opens their own page
 * with a Day / Week / Month line graph and the customers or day-by-day sums behind it.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { Easing, FadeIn, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, Line, Path, Polyline, Rect, Stop, LinearGradient as SvgGradient, Text as SvgText } from "react-native-svg";
import { Backdrop, easeOut, GlassCard, GlassSwitch, GT } from "../../components/glass";
import { Icon } from "../../components/Icon";
import { NumberRoll } from "../../components/NumberRoll";
import { Press } from "../../components/Press";
import * as C from "../../domain/calendar";
import { change, earningsOverview, shortInr, stylistPeriod, stylistSeries, type LineSeries, type Period, type Trend } from "../../domain/earnings";
import { istDate } from "../../domain/rules";
import { useData } from "../../domain/store";
import { inr } from "../../format";
import { useNav } from "../../nav/Navigator";
import { OwnerDock } from "../../nav/OwnerTabs";
import { DOCK_SPACE } from "../../nav/StaffTabs";
import { glass, urbanist } from "../../theme/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SHORT: Record<Period, string> = { day: "Today", week: "7 days", month: "Month" };
const FONT = urbanist.semibold;

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const avatarColour = (i: number) => glass.stylists[i % glass.stylists.length];

function Avatar({ name, index, size = 38 }: { name: string; index: number; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColour(index), alignItems: "center", justifyContent: "center" }}>
      <GT size={size * 0.33} w="heavy" c={glass.ink}>
        {initials(name)}
      </GT>
    </View>
  );
}

function Delta({ now, before, word, small }: { now: number; before: number; word?: string; small?: boolean }) {
  const d = change(now, before);
  if (d === null) return null;
  const up = d >= 0;
  return (
    <View style={{ alignSelf: "flex-start", flexDirection: "row", borderRadius: 999, paddingHorizontal: small ? 6 : 9, paddingVertical: small ? 2 : 4, backgroundColor: up ? "rgba(156,203,143,0.14)" : "rgba(240,140,106,0.14)" }}>
      <GT size={small ? 10.5 : 12} w="bold" c={up ? "#9CCB8F" : "#F08C6A"} numberOfLines={1}>
        {up ? "▲" : "▼"} {Math.abs(d)}%{word ? ` ${word}` : ""}
      </GT>
    </View>
  );
}

const Label = ({ children, style }: { children: string; style?: object }) => (
  <GT size={11} w="semibold" c={glass.soft} style={[{ letterSpacing: 1.3, textTransform: "uppercase" }, style]}>
    {children}
  </GT>
);

/** Width-aware box so charts draw at real pixels. */
function useWidth() {
  const [w, setW] = useState(0);
  return { w, onLayout: (e: { nativeEvent: { layout: { width: number } } }) => setW(Math.round(e.nativeEvent.layout.width)) };
}

export function Earnings() {
  const data = useData();
  const insets = useSafeAreaInsets();
  const nav = useNav();
  const reduced = useReducedMotion();
  const [p, setP] = useState<Period>("day");
  const all = useMemo(() => earningsOverview(data), [data]);
  const d = all[p];
  const best = Math.max(1, ...d.staff.map((s) => s.earned));
  const today = istDate();

  return (
    <Backdrop>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + DOCK_SPACE + 28, gap: 12 }} showsVerticalScrollIndicator={false}>
        <View>
          <GT size={13} c={glass.soft}>
            Owner · {C.shortDay(today)}
          </GT>
          <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34 }}>
            Earnings
          </GT>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }} accessibilityRole="tablist">
          {(["day", "week", "month"] as const).map((k) => (
            <KpiCard key={k} k={k} on={k === p} total={all[k].total} prev={all[k].prev} vals={all[k].trend.vals} onPress={() => setP(k)} />
          ))}
        </View>

        <GlassCard style={{ padding: 16, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
            <View style={{ flexShrink: 1 }}>
              <Label>{d.label}</Label>
              <NumberRoll value={d.total} duration={900} style={{ fontFamily: urbanist.heavy, fontSize: 38, lineHeight: 44, color: glass.cream, marginTop: 4 }} />
            </View>
            <View style={{ alignItems: "flex-end", gap: 4, flexShrink: 1 }}>
              <View style={{ alignSelf: "flex-end" }}>
                <Delta now={d.total} before={d.prev} />
              </View>
              <GT size={12} c={glass.soft} style={{ textAlign: "right" }}>
                {d.prevLabel}: {inr(d.prev)}
              </GT>
            </View>
          </View>
          <BarChart key={p} trend={d.trend} animate={!reduced} />
          <GT size={12} c={glass.soft} style={{ textAlign: "center" }}>
            {d.trend.note}
          </GT>
        </GlassCard>

        <GlassCard style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
            <Label>Stylists</Label>
            <GT size={12} c={glass.soft}>
              tap for customers
            </GT>
          </View>
          {d.staff.map((s, i) => (
            <Press
              key={s.staffId}
              onPress={() => nav.push({ name: "ownerStylist", id: s.staffId })}
              accessibilityLabel={`${s.name}: ${inr(s.earned)} from ${s.customers} customers. Open`}
              scaleTo={0.985}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.1)" }}
            >
              <Avatar name={s.name} index={s.index} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                  <GT size={15} w="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {s.name.split(" ")[0]}{" "}
                    <GT size={12.5} c={glass.soft}>
                      · {s.customers}
                    </GT>
                  </GT>
                  <GT size={15} w="bold" style={{ fontVariant: ["tabular-nums"] }}>
                    {inr(s.earned)}
                  </GT>
                </View>
                <ShareBar share={s.earned / best} gold={i === 0} delay={i * 70} />
              </View>
              <Icon name="chevron" color={glass.soft} size={16} />
            </Press>
          ))}
          {d.staff.length === 0 ? (
            <GT size={14} c={glass.soft} style={{ paddingVertical: 10 }}>
              No stylists yet. Add them in the Staff tab.
            </GT>
          ) : null}
        </GlassCard>
      </ScrollView>
      <OwnerDock />
    </Backdrop>
  );
}

function KpiCard({ k, on, total, prev, vals, onPress }: { k: Period; on: boolean; total: number; prev: number; vals: number[]; onPress: () => void }) {
  const { w, onLayout } = useWidth();
  const mx = Math.max(1, ...vals);
  const pts = vals.map((x, i) => `${((i / Math.max(1, vals.length - 1)) * w).toFixed(1)},${(25 - (x / mx) * 21).toFixed(1)}`).join(" ");
  return (
    <Press
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${SHORT[k]}: ${inr(total)}`}
      scaleTo={0.96}
      style={{ flex: 1, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: on ? "rgba(228,166,123,0.7)" : glass.line, backgroundColor: on ? undefined : glass.card }}
    >
      {on ? <LinearGradient colors={["rgba(228,166,123,0.32)", "rgba(228,166,123,0.1)"]} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} /> : null}
      <View style={{ padding: 10, gap: 4 }}>
        <GT size={10.5} w="semibold" c={glass.soft} style={{ letterSpacing: 0.6, textTransform: "uppercase" }}>
          {SHORT[k]}
        </GT>
        <GT size={18} w="heavy" style={{ fontVariant: ["tabular-nums"] }} numberOfLines={1}>
          {shortInr(total)}
        </GT>
        <Delta now={total} before={prev} small />
        <View onLayout={onLayout} style={{ height: 28 }}>
          {w ? (
            <Svg width={w} height={28}>
              <Polyline points={pts} fill="none" stroke={on ? glass.gold2 : "rgba(255,248,241,0.5)"} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </Svg>
          ) : null}
        </View>
      </View>
    </Press>
  );
}

function ShareBar({ share, gold, delay }: { share: number; gold: boolean; delay: number }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? share : 0);
  useEffect(() => {
    p.value = reduced ? share : withDelay(delay, withTiming(share, { duration: 600, easing: easeOut }));
  }, [share, reduced, delay, p]);
  const s = useAnimatedStyle(() => ({ width: `${Math.max(0, p.value) * 100}%` }));
  return (
    <View style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(255,244,236,0.1)", overflow: "hidden", marginTop: 6 }}>
      <Animated.View style={[{ height: "100%", borderRadius: 999, backgroundColor: gold ? glass.gold : glass.cream }, s]} />
    </View>
  );
}

/** Bars for the last 7 days / 8 weeks / 6 months: now in gold, the one before marked. */
function BarChart({ trend, animate }: { trend: Trend; animate: boolean }) {
  const { w, onLayout } = useWidth();
  const g = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) g.value = withDelay(120, withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) }));
  }, [animate, g]);
  const grow = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.max(0.001, g.value) }] }));
  const H = 120;
  const n = trend.vals.length;
  const max = Math.max(1, ...trend.vals, trend.outline ?? 0) * 1.14;
  const slot = w / n;
  const bw = slot * 0.56;
  return (
    <View onLayout={onLayout} style={{ height: H + 20 }} accessible accessibilityLabel={`${trend.note}: ${trend.labels.map((l, i) => `${l} ${inr(trend.vals[i])}`).join(", ")}`}>
      {w ? (
        <>
          <Animated.View style={[{ position: "absolute", left: 0, top: 0, width: w, height: H, transformOrigin: "bottom" }, grow]}>
            <Svg width={w} height={H}>
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <Line key={f} x1={0} x2={w} y1={H - H * f} y2={H - H * f} stroke="rgba(255,244,236,0.07)" />
              ))}
              {trend.vals.map((v, i) => {
                const h = Math.max(v ? 3 : 1.5, (v / max) * H);
                const cur = i === n - 1;
                const prev = i === trend.prevIdx;
                return <Rect key={i} x={i * slot + (slot - bw) / 2} y={H - h} width={bw} height={h} rx={Math.min(5, bw / 2)} fill={cur ? glass.gold : prev ? "rgba(255,244,236,0.55)" : "rgba(255,244,236,0.2)"} />;
              })}
              {trend.outline ? (
                <Rect x={(n - 1) * slot + (slot - bw) / 2} y={H - (trend.outline / max) * H} width={bw} height={(trend.outline / max) * H} rx={5} fill="none" stroke="rgba(228,166,123,0.6)" strokeDasharray="3 3" />
              ) : null}
            </Svg>
          </Animated.View>
          <Svg width={w} height={H + 20} style={{ position: "absolute" }} pointerEvents="none">
            {trend.vals.map((_, i) => {
              const cur = i === n - 1;
              return (
                <SvgText key={`l${i}`} x={i * slot + slot / 2} y={H + 14} textAnchor="middle" fontSize={10} fontFamily={FONT} fill={cur ? glass.gold2 : "rgba(255,248,241,0.5)"}>
                  {trend.labels[i]}
                </SvgText>
              );
            })}
            {trend.vals.map((v, i) => {
              const cur = i === n - 1;
              const prev = i === trend.prevIdx;
              if (!cur && !prev) return null;
              const h = Math.max(v ? 3 : 1.5, (v / max) * H);
              return (
                <SvgText key={`v${i}`} x={i * slot + slot / 2} y={H - h - 5} textAnchor="middle" fontSize={10} fontFamily={urbanist.bold} fill={cur ? glass.gold2 : "rgba(255,248,241,0.75)"}>
                  {shortInr(v)}
                </SvgText>
              );
            })}
          </Svg>
        </>
      ) : null}
    </View>
  );
}

export function StylistEarnings({ id }: { id: string }) {
  const nav = useNav();
  const data = useData();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [p, setP] = useState<Period>("day");
  const index = data.staff.findIndex((s) => s.id === id);
  const staff = data.staff[index];
  const series = useMemo(() => stylistSeries(data, id, p), [data, id, p]);
  const d = useMemo(() => stylistPeriod(data, id, p), [data, id, p]);
  if (!staff) return null;

  return (
    <Backdrop>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: insets.bottom + 40, gap: 12 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={nav.pop} accessibilityRole="button" accessibilityLabel="Back to Earnings" hitSlop={10}>
          <GT size={13.5} w="bold" c={glass.gold2}>
            ‹ Earnings
          </GT>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar name={staff.name} index={index} size={50} />
          <View style={{ flex: 1 }}>
            <GT size={24} w="heavy" accessibilityRole="header" style={{ lineHeight: 30 }}>
              {staff.name}
            </GT>
            <GT size={12.5} c={glass.soft}>
              {d.label} · {d.customers} customer{d.customers === 1 ? "" : "s"}
            </GT>
          </View>
        </View>
        <GlassSwitch
          options={[
            { key: "day", label: "Day" },
            { key: "week", label: "Week" },
            { key: "month", label: "Month" },
          ]}
          value={p}
          onChange={setP}
        />
        <GlassCard style={{ padding: 16, gap: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
            <NumberRoll value={d.total} duration={800} style={{ fontFamily: urbanist.heavy, fontSize: 34, lineHeight: 40, color: glass.cream }} />
            <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
              <Delta now={d.total} before={d.prev} word={d.cmpWord} />
            </View>
          </View>
          {d.note ? (
            <GT size={12} c={glass.soft}>
              {d.note}
            </GT>
          ) : null}
          <LineChart key={p} s={series} animate={!reduced} />
        </GlassCard>

        <Animated.View key={`list-${p}`} entering={reduced ? undefined : FadeIn.duration(260)}>
          <GlassCard style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Label style={{ marginBottom: 4 }}>{d.list.kind === "customers" ? "Customers today" : d.list.title}</Label>
            {d.list.kind === "customers" ? (
              d.list.rows.length ? (
                d.list.rows.map((r, i) => (
                  <View key={r.visitId} style={{ flexDirection: "row", gap: 10, alignItems: "center", paddingVertical: 9, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.1)" }}>
                    <GT size={13} c={glass.soft} style={{ width: 42, fontVariant: ["tabular-nums"] }}>
                      {r.time}
                    </GT>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <GT size={14} w="semibold" numberOfLines={1}>
                        {r.name}
                      </GT>
                      <GT size={12} c={glass.soft} numberOfLines={1}>
                        {r.services}
                      </GT>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <GT size={14} w="bold" style={{ fontVariant: ["tabular-nums"] }}>
                        {inr(r.amount)}
                      </GT>
                      <GT size={10} w="semibold" c={glass.soft} style={{ letterSpacing: 0.6, textTransform: "uppercase" }}>
                        {r.method}
                      </GT>
                    </View>
                  </View>
                ))
              ) : (
                <GT size={14} c={glass.soft} style={{ paddingVertical: 8 }}>
                  No paid customers yet today.
                </GT>
              )
            ) : (
              <>
                {d.list.rows.map((r, i) => (
                  <View key={r.label} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 9, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.1)" }}>
                    <View style={{ flex: 1 }}>
                      <GT size={14} w="semibold">
                        {r.label}
                      </GT>
                      <GT size={12} c={glass.soft}>
                        {r.closed ? "Closed" : `${r.customers} customer${r.customers === 1 ? "" : "s"}`}
                      </GT>
                    </View>
                    <GT size={14} w="bold" c={r.closed ? glass.soft : glass.cream} style={{ fontVariant: ["tabular-nums"] }}>
                      {r.closed ? "—" : inr(r.earned)}
                    </GT>
                  </View>
                ))}
                {d.topServices.length ? (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    <Label>Top services</Label>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {d.topServices.map((t) => (
                        <View key={t} style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: glass.card2 }}>
                          <GT size={11.5} c={glass.soft}>
                            {t}
                          </GT>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </Backdrop>
  );
}

/** The stylist's line: gold, drawn left to right; closed days, upcoming weeks, last month and averages marked. */
function LineChart({ s, animate }: { s: LineSeries; animate: boolean }) {
  const { w, onLayout } = useWidth();
  const draw = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) draw.value = withDelay(120, withTiming(1, { duration: 1200, easing: Easing.bezier(0.16, 1, 0.3, 1) }));
  }, [animate, draw]);
  const H = 150;
  const padL = 10;
  const padR = 12;
  const top = 26;
  const bot = 120;
  const n = s.vals.length;
  const nums = [...s.vals, ...(s.ghost ?? [])].filter((x): x is number => x !== null);
  const hi = Math.max(1, ...nums) * 1.14;
  const X = (i: number) => padL + (i * (w - padL - padR)) / Math.max(1, n - 1);
  const Y = (x: number) => bot - (x / hi) * (bot - top);
  const runs: number[][] = [];
  let cur: number[] = [];
  s.vals.forEach((x, i) => {
    if (x === null) {
      if (cur.length) runs.push(cur);
      cur = [];
    } else cur.push(i);
  });
  if (cur.length) runs.push(cur);
  const pathOf = (r: number[]) => r.map((i, k) => `${k ? "L" : "M"}${X(i).toFixed(1)} ${Y(s.vals[i]!).toFixed(1)}`).join(" ");
  const lenOf = (r: number[]) => r.slice(1).reduce((acc, i, k) => acc + Math.hypot(X(i) - X(r[k]), Y(s.vals[i]!) - Y(s.vals[r[k]]!)), 0) + 1;
  const total = runs.reduce((a, r) => a + lenOf(r), 0);
  const dense = n > 8;
  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: total * (1 - draw.value) }));
  const head = s.ghost ? null : s.avg !== null ? `avg ${shortInr(Math.round(s.avg / 50) * 50)} / ${s.unit}` : null;
  // A point's value label is dropped when it would sit on the "so far" label next to it.
  const crowded = (i: number) => {
    const xi = s.vals[i];
    const xj = s.vals[s.partial];
    return Math.abs(i - s.partial) === 1 && xi !== null && xj != null && Math.abs(Y(xi) - Y(xj)) < 22;
  };
  const lastLabel = (i: number) => (i === n - 1 ? "end" : i === 0 ? "start" : "middle");

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Label>{s.title}</Label>
        {s.ghost ? (
          <GT size={12} c={glass.soft}>
            <GT size={12} c={glass.gold2}>
              ━
            </GT>{" "}
            This month{"  "}
            <GT size={12} c="rgba(255,248,241,0.5)">
              ┅
            </GT>{" "}
            {s.ghostName}
          </GT>
        ) : head ? (
          <GT size={12} c={glass.soft}>
            {head}
          </GT>
        ) : null}
      </View>
      <View onLayout={onLayout} style={{ height: H, marginTop: 4 }} accessible accessibilityLabel={`${s.title}: ${s.labels.map((l, i) => `${l} ${s.vals[i] === null ? (s.closed.includes(i) ? "closed" : "to come") : inr(s.vals[i]!)}`).join(", ")}`}>
        {w ? (
          <Svg width={w} height={H}>
            <Defs>
              <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={glass.gold} stopOpacity={0.38} />
                <Stop offset="1" stopColor={glass.gold} stopOpacity={0} />
              </SvgGradient>
            </Defs>
            <Line x1={padL} x2={w - padR} y1={bot} y2={bot} stroke="rgba(255,244,236,0.12)" />
            {s.avg !== null && !s.ghost ? <Line x1={padL} x2={w - padR} y1={Y(s.avg)} y2={Y(s.avg)} stroke="rgba(255,248,241,0.35)" strokeDasharray="3 4" /> : null}
            {s.ghost ? (
              <>
                <Path d={s.ghost.map((x, i) => (x === null ? "" : `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(x).toFixed(1)}`)).join(" ")} fill="none" stroke="rgba(255,248,241,0.45)" strokeWidth={1.5} strokeDasharray="3 4" />
                {s.ghost.map((x, i) => (x === null ? null : <Circle key={`g${i}`} cx={X(i)} cy={Y(x)} r={2} fill="rgba(255,248,241,0.5)" />))}
              </>
            ) : null}
            {runs.map((r) => (r.length > 1 ? <Path key={`a${r[0]}`} d={`${pathOf(r)} L${X(r[r.length - 1])} ${bot} L${X(r[0])} ${bot} Z`} fill="url(#fill)" /> : null))}
            {runs.map((r) => (
              <AnimatedPath key={`p${r[0]}`} d={pathOf(r)} fill="none" stroke={glass.gold2} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${total} ${total}`} animatedProps={lineProps} />
            ))}
            {s.closed.map((ci) =>
              ci > 0 && ci < n - 1 && s.vals[ci - 1] !== null && s.vals[ci + 1] !== null ? <Path key={`c${ci}`} d={`M${X(ci - 1)} ${Y(s.vals[ci - 1]!)} L${X(ci + 1)} ${Y(s.vals[ci + 1]!)}`} stroke="rgba(245,201,160,0.35)" strokeWidth={1.4} strokeDasharray="2 4" fill="none" /> : null,
            )}
            {s.vals.map((x, i) => {
              const last = i === s.partial;
              const isClosed = s.closed.includes(i);
              const future = x === null && !isClosed;
              const labelFill = last ? glass.gold2 : future ? "rgba(255,248,241,0.3)" : "rgba(255,248,241,0.5)";
              return (
                <G key={`d${i}`}>
                  {isClosed ? (
                    <>
                      <Circle cx={X(i)} cy={bot} r={3} fill="none" stroke="rgba(255,248,241,0.45)" />
                      <SvgText x={X(i)} y={bot - 8} textAnchor="middle" fontSize={9} fontFamily={FONT} fill="rgba(255,248,241,0.5)">
                        Closed
                      </SvgText>
                    </>
                  ) : future ? (
                    <Circle cx={X(i)} cy={bot} r={2.4} fill="none" stroke="rgba(255,248,241,0.25)" strokeDasharray="1.5 1.5" />
                  ) : (
                    <>
                      <Circle cx={X(i)} cy={Y(x!)} r={last ? 4.6 : dense ? 2.2 : 2.8} fill={last ? glass.cream : glass.gold} stroke="#3a2620" strokeWidth={1.2} />
                      {(!dense && !crowded(i)) || last ? (
                        <SvgText x={X(i)} y={Math.max(10, Y(x!) - (last ? 10 : 7))} textAnchor={lastLabel(i)} fontSize={last ? 10.5 : 9} fontFamily={last ? urbanist.bold : FONT} fill={last ? glass.gold2 : "rgba(255,248,241,0.7)"}>
                          {`${shortInr(x!)}${last ? " so far" : ""}`}
                        </SvgText>
                      ) : null}
                    </>
                  )}
                  <SvgText x={X(i)} y={H - 6} textAnchor={lastLabel(i)} fontSize={9.5} fontFamily={FONT} fill={labelFill}>
                    {s.labels[i]}
                  </SvgText>
                </G>
              );
            })}
            {dense && s.best !== null && s.best !== s.partial ? (
              <SvgText x={X(s.best)} y={Y(s.vals[s.best]!) - 8} textAnchor="middle" fontSize={9.5} fontFamily={urbanist.bold} fill="rgba(255,248,241,0.85)">
                {`best ${shortInr(s.vals[s.best]!)}`}
              </SvgText>
            ) : null}
          </Svg>
        ) : null}
      </View>
    </View>
  );
}
