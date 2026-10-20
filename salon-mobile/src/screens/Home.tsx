/**
 * Staff Home (BUILD-SPEC 4.2–4.4), brown glass, as approved: the customer's number first,
 * then MY earnings ring (only my own money: wallet vs cash/UPI/card, month total), my
 * customers today, and who is in my chair now. The salon line only counts busy chairs.
 * Motion P3: the ring draws while the number counts up, once per launch.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { GlassCard, GlassScreen, GT, SectionLabel } from "../components/glass";
import { Icon } from "../components/Icon";
import { NumberRoll } from "../components/NumberRoll";
import { Press } from "../components/Press";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { istDate } from "../domain/rules";
import { useData } from "../domain/store";
import { inr } from "../format";
import { useNav } from "../nav/Navigator";
import { StaffDock } from "../nav/StaffTabs";
import { glass, urbanist } from "../theme/tokens";
import { istTime, useCurrentStaff } from "./Attendance";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
// The ring draws on the first Home of each launch only.
let drawn = false;

export function Home() {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const searchRef = useRef<View>(null);
  const today = istDate();
  const day = useMemo(() => (me ? E.staffDay(data, me.id) : null), [data, me]);
  const bookings = useMemo(() => (me ? E.appointmentsOn(data, today).filter((a) => a.staffId === me.id && a.status !== "CANCELLED") : []), [data, me, today]);
  const toSend = useMemo(() => E.appointmentRemindersDue(data).length, [data]);
  if (!me || !day) return <GlassScreen title="Home">{null}</GlassScreen>;
  const news = E.leaveUpdates(data, me.id);
  const onLeave = E.leaveOn(data, me.id, today);
  const animate = !drawn;
  drawn = true;

  return (
    <GlassScreen title={`Hi ${me.name.split(" ")[0]}`} after={<StaffDock />}>
      <GT size={13} c={glass.soft} style={{ marginTop: -10 }}>
        {C.WEEKDAYS[C.dayOfWeek(today)]} {C.dayNum(today)} {C.MONTHS[Number(today.slice(5, 7)) - 1].slice(0, 3)} · {me.chair}
      </GT>

      <Press onPress={() => nav.push({ name: "counter" }, { from: searchRef, fromColor: glass.mid, toColor: glass.deep })} accessibilityLabel="Customer walked in: enter their mobile number" scaleTo={0.98}>
        <View ref={searchRef} collapsable={false} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 18, paddingRight: 6, height: 54, borderRadius: 999, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line }}>
          <GT size={16} c={glass.faint} style={{ flex: 1 }}>
            Customer's mobile number
          </GT>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: glass.gold, alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevron" color={glass.ink} size={20} strokeWidth={2.4} />
          </View>
        </View>
      </Press>

      {news.length ? (
        <Press onPress={() => nav.push({ name: "myLeave" })} accessibilityLabel="Leave update from the owner. Open" scaleTo={0.985}>
          <View style={{ padding: 14, borderRadius: 20, backgroundColor: news[0].status === "APPROVED" ? "rgba(143,214,164,0.16)" : "rgba(240,140,106,0.14)", borderWidth: 1, borderColor: news[0].status === "APPROVED" ? "rgba(143,214,164,0.45)" : "rgba(240,140,106,0.45)" }}>
            <GT size={15} w="heavy">
              {news[0].status === "APPROVED" ? "Leave approved ✓ " : "Leave declined · "}
              {news[0].from === news[0].to ? C.shortDay(news[0].from) : `${C.shortDay(news[0].from)} – ${C.shortDay(news[0].to)}`}
            </GT>
            <GT size={12.5} c={glass.soft}>
              {news[0].status === "APPROVED" ? "Your calendar is updated. Tap to see it." : `Owner: “${news[0].reason}”`}
            </GT>
          </View>
        </Press>
      ) : null}
      {onLeave ? (
        <View style={{ padding: 14, borderRadius: 20, backgroundColor: "rgba(159,184,230,0.14)", borderWidth: 1, borderColor: "rgba(159,184,230,0.4)" }}>
          <GT size={15} w="heavy">
            You're on leave today
          </GT>
          <GT size={12.5} c={glass.soft}>
            Nobody can book you today. Enjoy the day off.
          </GT>
        </View>
      ) : null}

      <EarningsRing earned={day.earned} wallet={day.wallet} direct={day.direct} month={day.monthTotal} name={me.name.split(" ")[0]} animate={animate} />

      <Press onPress={() => nav.push({ name: "myCustomers" })} accessibilityLabel={`My customers today: ${day.counts.handled} handled, ${day.counts.paid} paid, ${day.counts.inChair} in the chair, ${day.counts.new} new. See all`} scaleTo={0.985}>
        <GlassCard style={{ padding: 14, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <SectionLabel>My customers today</SectionLabel>
            <GT size={12.5} w="bold" c={glass.gold2}>
              See all ›
            </GT>
          </View>
          <View style={{ flexDirection: "row" }}>
            {(
              [
                [day.counts.handled, "Handled"],
                [day.counts.paid, "Paid"],
                [day.counts.inChair, "In chair"],
                [day.counts.new, "New"],
              ] as const
            ).map(([n, l], i) => (
              <View key={l} style={{ flex: 1, alignItems: "center", borderLeftWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.1)" }}>
                <GT size={24} w="heavy" c={i === 0 ? glass.gold2 : glass.cream}>
                  {n}
                </GT>
                <GT size={11.5} c={glass.soft}>
                  {l}
                </GT>
              </View>
            ))}
          </View>
        </GlassCard>
      </Press>

      <GlassCard style={{ padding: 14, gap: 8 }}>
        <SectionLabel>{`My chair · ${me.chair}`}</SectionLabel>
        {day.chair ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <GT size={16} w="heavy">
                {day.chair.customerName}
              </GT>
              <GT size={12.5} c={glass.soft}>
                since {istTime(day.chair.visit.createdAt)} · {day.chair.services.join(" + ")}
              </GT>
            </View>
            <Press onPress={() => nav.push({ name: "visit", id: day.chair!.visit.id })} accessibilityLabel={`Take payment from ${day.chair.customerName}, ${inr(day.chair.amount)}`} style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
              <GT size={13.5} w="heavy" c={glass.ink}>
                Pay {inr(day.chair.amount)}
              </GT>
            </Press>
          </View>
        ) : (
          <GT size={14} c={glass.soft}>
            Free. Tap the gold + when the next customer walks in.
          </GT>
        )}
        <GT size={12} c={glass.faint}>
          Salon now: {day.salonBusy} of {day.salonChairs} chairs busy
        </GT>
      </GlassCard>

      <Press onPress={() => nav.push({ name: "todayBookings" })} accessibilityLabel={`Today's bookings: ${bookings.length}. ${toSend} reminders to send`} scaleTo={0.985}>
        <GlassCard style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Icon name="calendar" color={glass.gold2} size={22} />
          <View style={{ flex: 1 }}>
            <GT size={15} w="bold">
              Today's bookings · {bookings.length}
            </GT>
            <GT size={12.5} c={glass.soft}>
              {toSend ? `${toSend} on-the-day reminder${toSend === 1 ? "" : "s"} to send` : "All reminders sent"}
            </GT>
          </View>
          <GT size={15} c={glass.soft}>
            ›
          </GT>
        </GlassCard>
      </Press>
    </GlassScreen>
  );
}

const R = 70;
const CIRC = 2 * Math.PI * R;

/** The approved earnings ring: gold arc = paid in cash/UPI/card, cream arc = from wallets. */
function EarningsRing({ earned, wallet, direct, month, name, animate }: { earned: number; wallet: number; direct: number; month: number; name: string; animate: boolean }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(animate && !reduced ? 0 : 1);
  useEffect(() => {
    if (animate && !reduced) p.value = withDelay(150, withTiming(1, { duration: 1200, easing: Easing.bezier(0.16, 1, 0.3, 1) }));
  }, [animate, reduced, p]);
  const directShare = earned ? direct / earned : 0;
  const walletShare = earned ? wallet / earned : 0;
  const gap = earned && direct && wallet ? 0.012 : 0;
  const a1 = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - Math.max(0, directShare - gap) * p.value) }));
  const a2 = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - Math.max(0, walletShare - gap) * p.value) }));
  return (
    <View style={{ alignItems: "center", gap: 10, paddingVertical: 4 }} accessible accessibilityLabel={`My earnings today ${inr(earned)}: ${inr(direct)} cash, UPI or card, ${inr(wallet)} from wallets. This month ${inr(month)}`}>
      <View style={{ width: 2 * R + 24, height: 2 * R + 24, alignItems: "center", justifyContent: "center" }}>
        <Svg width={2 * R + 24} height={2 * R + 24} style={{ position: "absolute" }}>
          <Circle cx={R + 12} cy={R + 12} r={R} stroke="rgba(255,244,236,0.1)" strokeWidth={12} fill="none" />
          <AnimatedCircle cx={R + 12} cy={R + 12} r={R} stroke={glass.gold} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} animatedProps={a1} transform={`rotate(-90 ${R + 12} ${R + 12})`} />
          <AnimatedCircle cx={R + 12} cy={R + 12} r={R} stroke={glass.cream} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} animatedProps={a2} transform={`rotate(${-90 + directShare * 360} ${R + 12} ${R + 12})`} />
        </Svg>
        <GT size={10.5} w="heavy" c={glass.soft} style={{ letterSpacing: 1.4 }}>
          MY EARNINGS
        </GT>
        <NumberRoll value={earned} duration={animate ? 900 : 1} style={{ fontFamily: urbanist.heavy, fontSize: 32, lineHeight: 38, color: glass.cream }} />
        <GT size={12} c={glass.soft}>
          Today · {name}
        </GT>
      </View>
      <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
        <Legend color={glass.gold} label={`Cash/UPI/card ${inr(direct)}`} />
        <Legend color={glass.cream} label={`Wallet ${inr(wallet)}`} />
        <GT size={12} c={glass.soft}>
          Month {inr(month)}
        </GT>
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <GT size={12} c={glass.soft}>
        {label}
      </GT>
    </View>
  );
}

/** My customers (BUILD-SPEC 4.3): today's customers one by one, and the month so far. */
export function MyCustomers() {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const today = istDate();
  const day = useMemo(() => (me ? E.staffDay(data, me.id) : null), [data, me]);
  const month = useMemo(() => (me ? E.staffMonth(data, me.id, today.slice(0, 7)) : null), [data, me, today]);
  const [filter, setFilter] = useState<"all" | "paid" | "chair">("all");
  if (!me || !day || !month) return <GlassScreen title="My customers">{null}</GlassScreen>;
  const list = day.customers.filter((c) => (filter === "all" ? true : filter === "paid" ? c.visit.status === "PAID" : c.visit.status === "OPEN"));
  const max = Math.max(1, ...month.days.map((d) => d.total));
  const todayIdx = Number(today.slice(8, 10)) - 1;
  return (
    <GlassScreen title="My customers" back="Home" onBack={nav.pop}>
      <View style={{ flexDirection: "row", padding: 4, borderRadius: 999, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line }}>
        {(
          [
            ["all", `All ${day.counts.handled}`],
            ["paid", `Paid ${day.counts.paid}`],
            ["chair", `In chair ${day.counts.inChair}`],
          ] as const
        ).map(([k, l]) => (
          <Pressable key={k} onPress={() => setFilter(k)} accessibilityRole="tab" accessibilityState={{ selected: filter === k }} style={{ flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 999, backgroundColor: filter === k ? glass.cream : "transparent" }}>
            <GT size={13.5} w="bold" c={filter === k ? glass.ink : glass.soft}>
              {l}
            </GT>
          </Pressable>
        ))}
      </View>
      <GlassCard style={{ overflow: "hidden" }}>
        {list.length ? (
          list.map((c, i) => (
            <Pressable
              key={c.visit.id}
              onPress={() => (c.visit.status === "OPEN" ? nav.push({ name: "visit", id: c.visit.id }) : nav.push({ name: "profile", id: c.visit.customerId }))}
              accessibilityRole="button"
              accessibilityLabel={`${c.customerName}, ${c.services.join(" and ")}, ${inr(c.amount)}, ${c.visit.status === "OPEN" ? "in the chair" : "paid"}`}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}
            >
              <GT size={11.5} c={glass.faint} style={{ width: 40 }}>
                {istTime(c.visit.createdAt).replace(/ (AM|PM)/, "")}
              </GT>
              <View style={{ flex: 1 }}>
                <GT size={15} w="bold">
                  {c.customerName}
                  {c.isNew ? <GT size={11} w="heavy" c={glass.ok}>  New</GT> : null}
                </GT>
                <GT size={12} c={glass.soft} numberOfLines={1}>
                  {c.services.join(" + ")}
                </GT>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <GT size={15} w="heavy">
                  {inr(c.amount)}
                </GT>
                <GT size={11.5} c={c.visit.status === "OPEN" ? glass.gold2 : glass.soft}>
                  {c.visit.status === "OPEN" ? "In chair" : `Paid · ${c.visit.walletPaid === c.visit.total ? "Wallet" : c.visit.paymentMethod === "UPI" ? "UPI" : c.visit.paymentMethod === "CARD" ? "Card" : "Cash"}`}
                </GT>
              </View>
            </Pressable>
          ))
        ) : (
          <GT size={14} c={glass.soft} style={{ padding: 14 }}>
            No customers here yet today.
          </GT>
        )}
      </GlassCard>
      <GlassCard style={{ padding: 14, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <SectionLabel>{`${C.MONTHS[Number(today.slice(5, 7)) - 1]} so far`}</SectionLabel>
          <GT size={13} w="heavy" c={glass.gold2}>
            {inr(month.total)}
          </GT>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 56, gap: 2 }} accessible accessibilityLabel={`${month.customers} customers this month, ${inr(month.total)}`}>
          {month.days.slice(0, todayIdx + 1).map((d, i) => (
            <View key={d.date} style={{ flex: 1, height: Math.max(3, (d.total / max) * 56), borderRadius: 3, backgroundColor: i === todayIdx ? glass.gold : C.isClosed(d.date) ? "rgba(255,244,236,0.06)" : "rgba(255,244,236,0.28)" }} />
          ))}
        </View>
        <GT size={12} c={glass.soft}>
          {month.customers} customers{month.best ? ` · best day ${C.shortDay(month.best.date).slice(0, 6)} ${inr(month.best.total)}` : ""}
        </GT>
      </GlassCard>
    </GlassScreen>
  );
}
