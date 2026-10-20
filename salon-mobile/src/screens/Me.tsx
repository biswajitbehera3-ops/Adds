/**
 * The stylist's own Profile tab (BUILD-SPEC 4.15), brown glass. Only their own details, no
 * business numbers: photo, chair, shift, weekly off, joined date, then the sections
 * Attendance, Leave, Change password, Privacy & terms and Log out. Leave requests go to the
 * owner (4.16); the owner's answer shows here as a notification until it has been seen.
 */
import { useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { GhostButton, GlassCard, GlassScreen, GlassSheet, GoldButton, GT, SectionLabel } from "../components/glass";
import { Icon, type IconName } from "../components/Icon";
import { Press } from "../components/Press";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import { checkSecret, makeSecret, MIN_PASSWORD } from "../domain/auth";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate } from "../domain/rules";
import { commit, getData, setSession, useData } from "../domain/store";
import type { LeaveRequest } from "../domain/types";
import { formatPhone } from "../format";
import { useNav } from "../nav/Navigator";
import { hasher } from "../platform/hasher";
import { photoUri } from "../platform/photos";
import { glass, urbanist } from "../theme/tokens";
import { StaffDock } from "../nav/StaffTabs";
import { istTime, useCurrentStaff } from "./Attendance";

const KIND_BG: Record<string, string> = {
  present: "#9CCB8F",
  late: "#F0A86A",
  leave: "#9FB8E6",
  absent: "rgba(240,140,106,0.3)",
  off: "transparent",
  future: "rgba(255,244,236,0.07)",
  before: "transparent",
};
const TYPE: Record<LeaveRequest["type"], string> = { CASUAL: "Casual", SICK: "Sick", OTHER: "Other" };
const offDays = () => config.appointments.closedDays.map((d) => C.WEEKDAYS[d]).join(", ") || "None";
const daysText = (n: number) => (n === 0.5 ? "Half day" : `${n} ${n === 1 ? "day" : "days"}`);
const range = (l: { from: string; to: string }) => (l.from === l.to ? C.shortDay(l.from) : `${C.shortDay(l.from)} – ${C.shortDay(l.to)}`);

// ── My profile ───────────────────────────────────────────────────────────────

export function MyProfile({ onBack }: { onBack?: () => void }) {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const [out, setOut] = useState(false);
  if (!me) return <GlassScreen title="My profile">{null}</GlassScreen>;
  const today = istDate();
  const att = E.myAttendance(data, me.id, today.slice(0, 7));
  const leave = E.myLeave(data, me.id);
  const updates = E.leaveUpdates(data, me.id);
  const checkIn = E.todaysAttendance(data, me.id);
  const onLeave = E.leaveOn(data, me.id, today);
  const latest = data.attendance.filter((a) => a.staffId === me.id).sort((a, b) => b.checkInAt.localeCompare(a.checkInAt))[0] ?? null;
  const months = Math.floor(att.daysWithSalon / 30.44);

  return (
    <GlassScreen
      title="My profile"
      back={onBack ? "Home" : undefined}
      onBack={onBack}
      after={
        <>
        <StaffDock />
        <GlassSheet open={out} onClose={() => setOut(false)} label="Log out">
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
            <GT size={21} w="heavy">
              Log out of this phone?
            </GT>
            <GT size={13.5} c={glass.soft}>
              Today's attendance and any customer in your chair stay saved. To come back, log in with your mobile number and password.
            </GT>
            <GoldButton label="Log out" style={{ backgroundColor: "#F08C6A" }} onPress={() => setSession(null)} />
            <GhostButton label="Stay logged in" onPress={() => setOut(false)} />
          </View>
        </GlassSheet>
        </>
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <StaffPhoto photoKey={latest?.photoKey ?? null} name={me.name} size={96} />
        <View style={{ flex: 1, gap: 3 }}>
          <GT size={24} w="heavy" style={{ lineHeight: 29 }}>
            {me.name}
          </GT>
          <GT size={13} c={glass.soft}>
            Stylist · {me.chair}
          </GT>
          <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: onLeave ? "rgba(159,184,230,0.18)" : checkIn ? "rgba(143,214,164,0.16)" : "rgba(255,244,236,0.1)" }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: onLeave ? "#9FB8E6" : checkIn ? glass.ok : glass.faint }} />
            <GT size={12.5} w="bold" c={onLeave ? "#9FB8E6" : checkIn ? glass.ok : glass.soft}>
              {onLeave ? "On leave today" : checkIn ? `In · ${istTime(checkIn.checkInAt)} today` : "Not checked in"}
            </GT>
          </View>
        </View>
      </View>

      <GlassCard style={{ flexDirection: "row", flexWrap: "wrap", overflow: "hidden" }}>
        <Detail label="Mobile (login)" value={formatPhone(me.phone)} />
        <Detail label="Chair" value={me.chair} />
        <Detail label="Shift" value={`${C.clock(config.shift.start).time} – ${C.clock(config.appointments.close).time} ${C.clock(config.appointments.close).ampm.toLowerCase()}`} />
        <Detail label="Weekly off" value={offDays()} />
        <Detail label="Joined" value={C.shortDay(att.joined)} />
        <Detail label="With the salon" value={months >= 1 ? `${months} month${months === 1 ? "" : "s"}` : `${att.daysWithSalon} days`} />
      </GlassCard>

      {updates.length ? (
        <Press onPress={() => nav.push({ name: "myLeave" })} accessibilityLabel="Leave update from the owner. Open" scaleTo={0.985}>
          <View style={{ padding: 14, borderRadius: 20, backgroundColor: updates[0].status === "APPROVED" ? "rgba(143,214,164,0.16)" : "rgba(240,140,106,0.14)", borderWidth: 1, borderColor: updates[0].status === "APPROVED" ? "rgba(143,214,164,0.45)" : "rgba(240,140,106,0.45)" }}>
            <GT size={15} w="heavy">
              {updates[0].status === "APPROVED" ? `Leave approved ✓ ${range(updates[0])}` : `Leave declined · ${range(updates[0])}`}
            </GT>
            <GT size={12.5} c={glass.soft}>
              {updates[0].status === "APPROVED" ? "Your calendar is updated." : `Owner: “${updates[0].reason}”`}
              {updates.length > 1 ? ` · ${updates.length - 1} more` : ""}
            </GT>
          </View>
        </Press>
      ) : null}

      <GlassCard style={{ overflow: "hidden" }}>
        <Section icon="calendar" title="Attendance" sub={`${att.month.present} days present this month · ${att.month.late} late`} onPress={() => nav.push({ name: "myAttendance" })} />
        <Section
          icon="spark"
          title="Leave"
          sub={leave.next ? `Next: ${range(leave.next)}, approved${leave.waiting ? ` · ${leave.waiting} waiting` : ""}` : leave.waiting ? `${leave.waiting} waiting for the owner` : "Request leave"}
          badge={updates.length || undefined}
          onPress={() => nav.push({ name: "myLeave" })}
        />
        <Section icon="check" title="Change password" sub={`Login: ${formatPhone(me.phone)}`} onPress={() => nav.push({ name: "changePassword" })} />
        <Section icon="copy" title="Privacy & terms" sub="Your data and the salon's rules" onPress={() => nav.push({ name: "staffPrivacy" })} />
        <Section icon="back" title="Log out" danger onPress={() => setOut(true)} />
      </GlassCard>
    </GlassScreen>
  );
}

/** The stylist's latest check-in photo, or their initials on gold. */
function StaffPhoto({ photoKey, name, size }: { photoKey: string | null; name: string; size: number }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    photoUri(photoKey).then((u) => live && setUri(u));
    return () => void (live = false);
  }, [photoKey]);
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size * 1.1, borderRadius: 22 }} accessibilityLabel={`${name}'s photo`} />;
  return (
    <View style={{ width: size, height: size * 1.1, borderRadius: 22, backgroundColor: glass.gold, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${name}'s photo`}>
      <GT size={size * 0.34} w="heavy" c={glass.ink}>
        {name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
      </GT>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: "50%", paddingHorizontal: 14, paddingVertical: 10, borderColor: "rgba(255,244,236,0.08)", borderTopWidth: 1, marginTop: -1 }}>
      <GT size={10.5} w="heavy" c={glass.faint} style={{ letterSpacing: 0.8, textTransform: "uppercase" }}>
        {label}
      </GT>
      <GT size={14.5} w="bold" numberOfLines={1}>
        {value}
      </GT>
    </View>
  );
}

function Section({ icon, title, sub, onPress, danger, badge }: { icon: IconName; title: string; sub?: string; onPress: () => void; danger?: boolean; badge?: number }) {
  const tone = danger ? "#F08C6A" : glass.gold2;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}${sub ? `. ${sub}` : ""}${badge ? `. ${badge} new` : ""}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderColor: "rgba(255,244,236,0.08)", marginTop: -1 }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: danger ? "rgba(240,140,106,0.14)" : "rgba(228,166,123,0.16)" }}>
        <Icon name={icon} color={tone} size={19} />
      </View>
      <View style={{ flex: 1 }}>
        <GT size={15} w="bold" c={danger ? tone : glass.cream}>
          {title}
        </GT>
        {sub ? (
          <GT size={12} c={glass.soft} numberOfLines={1}>
            {sub}
          </GT>
        ) : null}
      </View>
      {badge ? (
        <View style={{ minWidth: 20, paddingHorizontal: 6, height: 20, borderRadius: 10, backgroundColor: "#F08C6A", alignItems: "center", justifyContent: "center" }}>
          <GT size={11} w="heavy" c="#2a1210">
            {badge}
          </GT>
        </View>
      ) : null}
      <GT size={15} c={glass.soft}>
        ›
      </GT>
    </Pressable>
  );
}

// ── Attendance ───────────────────────────────────────────────────────────────

export function MyAttendance() {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const today = istDate();
  const [month, setMonth] = useState(today.slice(0, 7));
  if (!me) return <GlassScreen title="Attendance">{null}</GlassScreen>;
  const a = E.myAttendance(data, me.id, month);
  const first = a.joined.slice(0, 7);
  const grid = C.monthGrid(month);
  const months = Math.floor(a.daysWithSalon / 30.44);
  return (
    <GlassScreen title="Attendance" back="My profile" onBack={nav.pop}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(228,166,123,0.2)", borderWidth: 1, borderColor: "rgba(228,166,123,0.45)" }}>
        <View>
          <GT size={12} c={glass.soft}>
            Joined
          </GT>
          <GT size={17} w="heavy">
            {C.WEEKDAYS[C.dayOfWeek(a.joined)].slice(0, 3)} {C.dayNum(a.joined)} {C.MONTHS[Number(a.joined.slice(5, 7)) - 1].slice(0, 3)} {a.joined.slice(0, 4)}
          </GT>
          <GT size={12} c={glass.soft}>
            {a.presentSinceJoin} days present · {a.leaveSinceJoin} days leave
          </GT>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <GT size={22} w="heavy" c={glass.gold2}>
            {months >= 1 ? `${months} mo` : `${a.daysWithSalon} d`}
          </GT>
          <GT size={12} c={glass.soft}>
            with the salon
          </GT>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Count n={a.month.present} label="present" tone="#9CCB8F" />
        <Count n={a.month.late} label="late" tone="#F0A86A" />
        <Count n={a.month.leave} label="leave" tone="#9FB8E6" />
        <Count n={a.month.absent} label="absent" />
      </View>
      <GlassCard style={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Round label="‹" a11y="Previous month" disabled={month <= first} onPress={() => setMonth((m) => C.addMonths(m, -1))} />
          <GT size={15} w="bold">
            {C.monthName(month)}
          </GT>
          <Round label="›" a11y="Next month" disabled={month >= today.slice(0, 7)} onPress={() => setMonth((m) => C.addMonths(m, 1))} />
        </View>
        <View style={{ flexDirection: "row" }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <GT key={i} size={11} w="bold" c={glass.faint} style={{ flex: 1, textAlign: "center" }}>
              {d}
            </GT>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from({ length: grid.lead }, (_, i) => (
            <View key={`b${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />
          ))}
          {a.cells.map((c) => {
            const dark = ["present", "late", "leave"].includes(c.kind);
            return (
              <View key={c.date} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }} accessible accessibilityLabel={`${C.shortDay(c.date)}: ${c.kind === "off" ? "weekly off" : c.kind === "future" ? "to come" : c.kind === "before" ? "before joining" : c.kind}`}>
                <View style={{ flex: 1, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: KIND_BG[c.kind], borderWidth: c.date === today ? 2 : 0, borderColor: glass.gold2, opacity: c.kind === "off" || c.kind === "before" ? 0.45 : 1 }}>
                  <GT size={12} w="bold" c={dark ? glass.ink : glass.faint}>
                    {C.dayNum(c.date)}
                  </GT>
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 2 }}>
          {[
            ["#9CCB8F", "Present"],
            ["#F0A86A", "Late"],
            ["#9FB8E6", "Leave"],
            ["rgba(240,140,106,0.3)", "Absent"],
            ["rgba(255,244,236,0.2)", "Weekly off"],
          ].map(([c, l]) => (
            <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c }} />
              <GT size={11.5} c={glass.soft}>
                {l}
              </GT>
            </View>
          ))}
        </View>
      </GlassCard>
      <SectionLabel>Last check-ins</SectionLabel>
      <GlassCard style={{ paddingHorizontal: 14 }}>
        {a.lastCheckIns.length ? (
          a.lastCheckIns.map((x, i) => (
            <View key={x.date} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
              <View style={{ flex: 1 }}>
                <GT size={14.5} w="bold">
                  {C.shortDay(x.date)}
                </GT>
                <GT size={12} c={glass.soft}>
                  Selfie at {istTime(x.at)}
                </GT>
              </View>
              <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: x.late ? "rgba(240,140,106,0.16)" : "rgba(143,214,164,0.16)" }}>
                <GT size={11.5} w="heavy" c={x.late ? "#F08C6A" : glass.ok}>
                  {x.late ? "Late" : "On time"}
                </GT>
              </View>
            </View>
          ))
        ) : (
          <GT size={14} c={glass.soft} style={{ paddingVertical: 12 }}>
            No check-ins yet.
          </GT>
        )}
      </GlassCard>
    </GlassScreen>
  );
}

function Count({ n, label, tone }: { n: number; label: string; tone?: string }) {
  return (
    <GlassCard style={{ flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 16 }}>
      <GT size={19} w="heavy" c={tone ?? glass.cream}>
        {n}
      </GT>
      <GT size={11} c={glass.soft}>
        {label}
      </GT>
    </GlassCard>
  );
}

function Round({ label, a11y, onPress, disabled }: { label: string; a11y: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Press onPress={onPress} disabled={disabled} accessibilityLabel={a11y} accessibilityState={{ disabled }} style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line, opacity: disabled ? 0.35 : 1 }}>
      <GT size={17} w="bold" style={{ marginTop: -2 }}>
        {label}
      </GT>
    </Press>
  );
}

// ── Leave ────────────────────────────────────────────────────────────────────

export function MyLeave() {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [asking, setAsking] = useState(false);
  const [armed, setArmed] = useState<string | null>(null);
  // Opening Leave is seeing the owner's answers: the notification clears.
  useEffect(() => {
    if (me && E.leaveUpdates(getData(), me.id).length) commit((d) => E.markLeaveSeen(d, me.id));
  }, [me, data.leaves.length]);
  if (!me) return <GlassScreen title="Leave">{null}</GlassScreen>;
  const l = E.myLeave(data, me.id);
  const year = istDate().slice(0, 4);
  return (
    <GlassScreen
      title="Leave"
      back="My profile"
      onBack={nav.pop}
      after={<RequestLeaveSheet open={asking} staffId={me.id} onClose={() => setAsking(false)} onSent={() => (setAsking(false), toast("Sent to the owner"))} />}
    >
      {l.next ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(159,184,230,0.14)", borderWidth: 1, borderColor: "rgba(159,184,230,0.4)" }}>
          <View>
            <GT size={12} c={glass.soft}>
              Next leave · approved
            </GT>
            <GT size={18} w="heavy">
              {range(l.next)}
            </GT>
            <GT size={12} c={glass.soft}>
              {TYPE[l.next.type]} · {daysText(E.leaveWorkingDays(l.next.from, l.next.to, l.next.halfDay))}
            </GT>
          </View>
          <Status s="APPROVED" />
        </View>
      ) : null}
      <GoldButton label="+ Request leave" onPress={() => setAsking(true)} />
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Count n={l.takenThisYear} label={`days in ${year}`} />
        <Count n={l.waiting} label="waiting" />
        <Count n={l.declined} label="declined" />
      </View>
      <SectionLabel>My requests</SectionLabel>
      {l.requests.length ? (
        <GlassCard style={{ overflow: "hidden" }}>
          {l.requests.map((r, i) => (
            <Animated.View key={r.id} entering={reduced ? undefined : FadeInDown.duration(260).delay(i * 30)} style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 4, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <GT size={15} w="bold">
                    {range(r)}
                  </GT>
                  <GT size={12} c={glass.soft}>
                    {TYPE[r.type]} · {daysText(r.workingDays)}
                    {r.status === "APPROVED" && r.decidedAt ? ` · approved ${C.shortDay(istDate(new Date(r.decidedAt)))}` : ""}
                  </GT>
                </View>
                <Status s={r.status} />
              </View>
              {r.status === "DECLINED" && r.reason ? (
                <GT size={12} c={glass.faint} style={{ fontStyle: "italic" }}>
                  Owner: “{r.reason}”
                </GT>
              ) : null}
              {r.note ? (
                <GT size={12} c={glass.faint}>
                  Your note: {r.note}
                </GT>
              ) : null}
              {r.status === "WAITING" ? (
                <Pressable
                  onPress={() => {
                    if (armed !== r.id) return setArmed(r.id);
                    try {
                      commit((d) => E.withdrawLeave(d, { id: r.id, staffId: me.id }));
                      toast("Request withdrawn");
                    } catch (e) {
                      toast(e instanceof UserError ? e.message : "Couldn't withdraw it", "error");
                    }
                  }}
                  accessibilityRole="button"
                  hitSlop={6}
                >
                  <GT size={12.5} w="heavy" c="#F08C6A">
                    {armed === r.id ? "Tap again to withdraw" : "Withdraw request"}
                  </GT>
                </Pressable>
              ) : null}
            </Animated.View>
          ))}
        </GlassCard>
      ) : (
        <GT size={14} c={glass.soft}>
          No leave asked for yet.
        </GT>
      )}
      <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
        Once the owner approves, your calendar shows the leave, nobody can book you that day, and it counts as leave in attendance, not absent.
      </GT>
    </GlassScreen>
  );
}

function Status({ s }: { s: LeaveRequest["status"] }) {
  const map = {
    WAITING: ["Waiting for owner", glass.gold2, "rgba(245,201,160,0.14)"],
    APPROVED: ["Approved", glass.ok, "rgba(143,214,164,0.16)"],
    DECLINED: ["Declined", "#F08C6A", "rgba(240,140,106,0.16)"],
    WITHDRAWN: ["Withdrawn", glass.faint, "rgba(255,244,236,0.08)"],
  } as const;
  const [t, fg, bg] = map[s];
  return (
    <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: bg }}>
      <GT size={11.5} w="heavy" c={fg}>
        {t}
      </GT>
    </View>
  );
}

function RequestLeaveSheet({ open, staffId, onClose, onSent }: { open: boolean; staffId: string; onClose: () => void; onSent: () => void }) {
  const toast = useToast();
  const today = istDate();
  const days = useMemo(() => Array.from({ length: 60 }, (_, i) => C.addDays(today, i)), [today]);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [type, setType] = useState<LeaveRequest["type"]>("CASUAL");
  const [half, setHalf] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!open) return;
    setFrom(null);
    setTo(null);
    setType("CASUAL");
    setHalf(false);
    setNote("");
  }, [open]);
  const pick = (d: string) => {
    // First tap sets the first day; a later day sets the last day; an earlier one starts over.
    if (!from || (to && to !== from) || d < from) {
      setFrom(d);
      setTo(d);
    } else setTo(d);
    setHalf(false);
  };
  const working = from && to ? E.leaveWorkingDays(from, to, half) : 0;
  const offInside = from && to ? C.addDays(from, 0) <= to && E.leaveWorkingDays(from, to) < (Date.parse(to) - Date.parse(from)) / 86400000 + 1 : false;
  const send = () => {
    try {
      commit((d) => E.requestLeave(d, { staffId, from: from!, to: to!, type, halfDay: half, note }));
      onSent();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't send it", "error");
    }
  };
  return (
    <GlassSheet open={open} onClose={onClose} label="Request leave">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }} keyboardShouldPersistTaps="handled">
        <GT size={21} w="heavy">
          Request leave
        </GT>
        <GT size={12.5} c={glass.soft}>
          Tap the first day, then the last day.
        </GT>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {days.map((d) => {
            const closed = C.isClosed(d);
            const inRange = from && to && d >= from && d <= to;
            const edge = d === from || d === to;
            return (
              <Pressable
                key={d}
                onPress={() => pick(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: !!inRange }}
                accessibilityLabel={`${C.shortDay(d)}${closed ? ", weekly off" : ""}`}
                style={{ width: 48, paddingVertical: 7, borderRadius: 14, alignItems: "center", backgroundColor: edge ? glass.gold : inRange ? "rgba(228,166,123,0.3)" : glass.card, borderWidth: 1, borderColor: edge ? glass.gold : glass.line, opacity: closed ? 0.5 : 1 }}
              >
                <GT size={10.5} w="bold" c={edge ? glass.ink : glass.faint}>
                  {C.WEEKDAYS[C.dayOfWeek(d)].slice(0, 3)}
                </GT>
                <GT size={16} w="bold" c={edge ? glass.ink : glass.cream}>
                  {C.dayNum(d)}
                </GT>
                <GT size={9} w="bold" c={edge ? glass.ink : glass.faint}>
                  {C.MONTHS[Number(d.slice(5, 7)) - 1].slice(0, 3)}
                </GT>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Field label="From" value={from ? C.shortDay(from) : "—"} />
          <Field label="To" value={to ? C.shortDay(to) : "—"} />
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {(["CASUAL", "SICK", "OTHER"] as const).map((t) => (
            <Pressable key={t} onPress={() => setType(t)} accessibilityRole="radio" accessibilityState={{ selected: type === t }} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: type === t ? glass.gold : glass.card, borderWidth: 1, borderColor: type === t ? glass.gold : glass.line }}>
              <GT size={13.5} w="bold" c={type === t ? glass.ink : glass.soft}>
                {TYPE[t]}
              </GT>
            </Pressable>
          ))}
        </View>
        {from && from === to && !C.isClosed(from) ? (
          <Pressable onPress={() => setHalf((h) => !h)} accessibilityRole="switch" accessibilityState={{ checked: half }} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 14, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
            <GT size={14}>Half day</GT>
            <View style={{ width: 44, height: 26, borderRadius: 13, padding: 3, backgroundColor: half ? glass.gold : "rgba(255,244,236,0.18)", alignItems: half ? "flex-end" : "flex-start" }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: glass.cream }} />
            </View>
          </Pressable>
        ) : null}
        <TextInput
          value={note}
          onChangeText={setNote}
          maxLength={200}
          placeholder="Note for the owner (optional)"
          placeholderTextColor={glass.faint}
          accessibilityLabel="Note for the owner"
          style={{ fontFamily: urbanist.medium, fontSize: 15, color: glass.cream, backgroundColor: "rgba(26,18,16,0.55)", borderWidth: 1, borderColor: glass.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}
        />
        {from && to ? (
          <View style={{ padding: 12, borderRadius: 14, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line }}>
            <GT size={13} c={glass.soft}>
              <GT size={13} w="heavy">
                {working ? `${daysText(working)}.` : "No working days."}
              </GT>{" "}
              {offInside ? `${offDays()} is your weekly off, so it isn't counted. ` : ""}Once approved, your chair shows "Off today" on the Live floor and no one can book you then.
            </GT>
          </View>
        ) : null}
        <GoldButton label="Send to owner" disabled={!from || !to || !working} onPress={send} />
      </ScrollView>
    </GlassSheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line }}>
      <GT size={11} w="bold" c={glass.faint}>
        {label}
      </GT>
      <GT size={15} w="bold">
        {value}
      </GT>
    </View>
  );
}

// ── Change password ──────────────────────────────────────────────────────────

export function ChangePassword() {
  const me = useCurrentStaff();
  const nav = useNav();
  const toast = useToast();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!me) return <GlassScreen title="Change password">{null}</GlassScreen>;
  const rules = [
    { ok: next.length >= MIN_PASSWORD, text: `At least ${MIN_PASSWORD} characters` },
    { ok: !!next && next !== cur, text: "Not the same as the old one" },
    { ok: !!next && next === again, text: "Both new passwords match" },
  ];
  const save = async () => {
    setBusy(true);
    try {
      if (!(await checkSecret(me.secret, cur, hasher))) throw new UserError("The current password is wrong");
      const secret = await makeSecret(next, hasher);
      commit((d) => E.updateStaff(d, me.id, { secret }));
      toast("Password changed");
      nav.pop();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't change it. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <GlassScreen title="Change password" back="My profile" onBack={nav.pop}>
      <PwField label="Current password" value={cur} onChange={setCur} show={show} onShow={() => setShow((s) => !s)} />
      <PwField label="New password" value={next} onChange={setNext} show={show} onShow={() => setShow((s) => !s)} />
      <PwField label="New password again" value={again} onChange={setAgain} show={show} onShow={() => setShow((s) => !s)} />
      <GlassCard style={{ padding: 14, gap: 8 }}>
        {rules.map((r) => (
          <View key={r.text} style={{ flexDirection: "row", alignItems: "center", gap: 8 }} accessible accessibilityLabel={`${r.text}: ${r.ok ? "done" : "not yet"}`}>
            <View style={{ width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: r.ok ? glass.ok : "rgba(255,244,236,0.14)" }}>
              <GT size={10} w="heavy" c={r.ok ? glass.ink : glass.faint}>
                ✓
              </GT>
            </View>
            <GT size={13.5} c={glass.soft}>
              {r.text}
            </GT>
          </View>
        ))}
      </GlassCard>
      <GoldButton label={busy ? "Saving…" : "Save new password"} disabled={busy || !cur || !rules.every((r) => r.ok)} onPress={save} />
      <GT size={12.5} c={glass.faint} style={{ textAlign: "center" }}>
        Forgot it? Ask the owner: they can reset it from Staff. Your login stays your mobile number, {formatPhone(me.phone)}.
      </GT>
    </GlassScreen>
  );
}

function PwField({ label, value, onChange, show, onShow }: { label: string; value: string; onChange: (s: string) => void; show: boolean; onShow: () => void }) {
  return (
    <View style={{ gap: 5 }}>
      <GT size={12.5} w="semibold" c={glass.soft}>
        {label}
      </GT>
      <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 14, backgroundColor: "rgba(26,18,16,0.55)", borderWidth: 1, borderColor: glass.line, paddingHorizontal: 14 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
          style={{ flex: 1, minHeight: 48, fontFamily: urbanist.semibold, fontSize: 16, color: glass.cream }}
        />
        <Pressable onPress={onShow} accessibilityRole="button" accessibilityLabel={show ? "Hide passwords" : "Show passwords"} hitSlop={8}>
          <GT size={12.5} w="bold" c={glass.gold2}>
            {show ? "Hide" : "Show"}
          </GT>
        </Pressable>
      </View>
    </View>
  );
}

// ── Privacy & terms (staff) ──────────────────────────────────────────────────

export function StaffPrivacy() {
  const nav = useNav();
  const [openKey, setOpenKey] = useState<string | null>("keep");
  const r = config.retention;
  const b = config.business;
  const items: [string, string, string][] = [
    ["keep", "What we keep about you", "Your name, mobile number (your login), chair, password (scrambled: nobody can read it), check-in times, attendance selfies, leave requests, and the customers and amounts you served."],
    ["who", "Who sees it", "The owner sees everyone's attendance, leave and earnings. You see only your own. The app provider stores it securely for the salon."],
    ["long", "How long it is kept", `Selfies ${Math.round(r.attendancePhotoDays / 30)} months, then deleted, keeping only the check-in time. Attendance and earnings as long as wages and tax records need. When you leave, your login is turned off at once and your details are deleted 12 months later, apart from what the law requires.`],
    ["rights", "Your rights", `Ask the owner for a copy, a correction, or deletion. Contact ${b.grievance.name}, ${b.grievance.phone}. You can also complain to the Data Protection Board of India. The selfie is not face recognition: it is only a photo the owner can look at.`],
  ];
  return (
    <GlassScreen title="Privacy & terms" back="My profile" onBack={nav.pop}>
      <SectionLabel>About you</SectionLabel>
      <GlassCard style={{ overflow: "hidden" }}>
        {items.map(([k, title, body], i) => (
          <View key={k} style={{ borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
            <Pressable onPress={() => setOpenKey((o) => (o === k ? null : k))} accessibilityRole="button" accessibilityState={{ expanded: openKey === k }} style={{ flexDirection: "row", justifyContent: "space-between", padding: 14 }}>
              <GT size={14.5} w="bold">
                {title}
              </GT>
              <GT size={14} c={glass.soft}>
                {openKey === k ? "▾" : "›"}
              </GT>
            </Pressable>
            {openKey === k ? (
              <GT size={13} c={glass.soft} style={{ paddingHorizontal: 14, paddingBottom: 14, lineHeight: 19 }}>
                {body}
              </GT>
            ) : null}
          </View>
        ))}
      </GlassCard>
      <SectionLabel>Customer data: your rules</SectionLabel>
      <GlassCard style={{ padding: 14, gap: 6 }}>
        {["Use customers' numbers only to serve and remind them here.", "No screenshots or sharing outside the app.", "Message only customers who agreed to messages; stop if they reply STOP."].map((t) => (
          <GT key={t} size={13} c={glass.soft}>
            • {t}
          </GT>
        ))}
      </GlassCard>
      <SectionLabel>Full documents</SectionLabel>
      <GlassCard style={{ overflow: "hidden" }}>
        {(
          [
            ["Privacy policy", () => Linking.openURL(config.legal.privacyUrl)],
            ["Terms of service", () => Linking.openURL(config.legal.termsUrl)],
            ["Customer notice, credits & licences", () => nav.push({ name: "legal" })],
          ] as const
        ).map(([t, go], i) => (
          <Pressable key={t} onPress={go} accessibilityRole="link" style={{ flexDirection: "row", justifyContent: "space-between", padding: 14, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
            <GT size={14.5} w="bold">
              {t}
            </GT>
            <GT size={14} c={glass.soft}>
              {i < 2 ? "↗" : "›"}
            </GT>
          </Pressable>
        ))}
      </GlassCard>
      <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
        Notice version {config.legal.noticeVersion} · no cookies, ads or tracking
      </GT>
    </GlassScreen>
  );
}
