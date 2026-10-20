/**
 * The owner's Staff tab (BUILD-SPEC 6.5, 6.4, 4.16, 10.10), brown glass.
 * A photo card per stylist with today's attendance, a gold + to add someone, and a profile
 * with every option for that stylist: attendance (calendar, selfie, Excel export), leave,
 * shift & weekly off, performance, account and deactivate. No salary or advances (19 Oct).
 */
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop, easeOut, GhostButton, GlassCard, GlassScreen, GlassSheet, GoldButton, GT, SectionLabel } from "../../components/glass";
import { Icon, type IconName } from "../../components/Icon";
import { Press } from "../../components/Press";
import { useToast } from "../../components/Toast";
import config from "../../config/salon";
import { makeSecret, MIN_PASSWORD } from "../../domain/auth";
import * as C from "../../domain/calendar";
import * as E from "../../domain/engine";
import { UserError } from "../../domain/errors";
import { istDate } from "../../domain/rules";
import { commit, useData } from "../../domain/store";
import type { Data, LeaveRequest, Staff } from "../../domain/types";
import { buildXlsx } from "../../domain/xlsx";
import { formatPhone, inr } from "../../format";
import { useNav } from "../../nav/Navigator";
import { OwnerDock } from "../../nav/OwnerTabs";
import { DOCK_SPACE } from "../../nav/StaffTabs";
import { hasher } from "../../platform/hasher";
import { photoUri, pickPhoto, savePhoto } from "../../platform/photos";
import { shareXlsx } from "../../platform/share";
import { glass } from "../../theme/tokens";
import { istTime } from "../Attendance";
import { Field } from "../Counter";

const OK = "#9CCB8F";
const LATE = "#F0A86A";
const LEAVE = "#9FB8E6";
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
/** Monday first, the way the salon reads a week. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const TYPE: Record<LeaveRequest["type"], string> = { CASUAL: "Casual", SICK: "Sick", OTHER: "Other" };

type Status = { kind: "in" | "late" | "leave" | "off" | "notin"; label: string; tone: string };

/** Today's attendance for one stylist, as the card badge reads it. */
function todayStatus(data: Data, s: Staff, today: string): Status {
  const rec = E.todaysAttendance(data, s.id);
  if (rec) return E.staffLate(s, rec.checkInAt) ? { kind: "late", label: `Late ${istTime(rec.checkInAt).replace(/ (AM|PM)/, "")}`, tone: LATE } : { kind: "in", label: `In ${istTime(rec.checkInAt).replace(/ (AM|PM)/, "")}`, tone: OK };
  if (E.leaveOn(data, s.id, today)) return { kind: "leave", label: "On leave", tone: LEAVE };
  if (isOffDay(s, today)) return { kind: "off", label: "Weekly off", tone: glass.faint };
  return { kind: "notin", label: "Not in yet", tone: glass.faint };
}

/** The salon's closed day, or this stylist's own weekly off when the owner set one. */
function isOffDay(s: Staff, day: string) {
  const dow = C.dayOfWeek(day);
  return config.appointments.closedDays.includes(dow) || s.weeklyOff === dow;
}
const weeklyOffName = (s: Staff) => (s.weeklyOff != null ? C.WEEKDAYS[s.weeklyOff] : config.appointments.closedDays.map((d) => C.WEEKDAYS[d]).join(", ") || "None");
const initials = (name: string) => name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();

/** The owner's photo of the stylist, or gold initials on a warm gradient. */
function StylistPhoto({ staff, width, height, radius = 18 }: { staff: Staff; width: number | `${number}%`; height: number; radius?: number }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    photoUri(staff.photoKey ?? null).then((u) => live && setUri(u));
    return () => void (live = false);
  }, [staff.photoKey]);
  if (uri) return <Image source={{ uri }} style={{ width, height, borderRadius: radius }} resizeMode="cover" accessibilityLabel={`${staff.name}'s photo`} />;
  return (
    <View style={{ width, height, borderRadius: radius, overflow: "hidden", alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${staff.name}, no photo yet`}>
      <LinearGradient colors={["#B58471", "#6B4337"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <GT size={Math.min(height * 0.3, 44)} w="heavy" c={glass.gold2}>
        {initials(staff.name)}
      </GT>
    </View>
  );
}

function Badge({ status }: { status: Status }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(26,18,16,0.62)" }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: status.tone }} />
      <GT size={11.5} w="bold">
        {status.label}
      </GT>
    </View>
  );
}

// ── Staff tab ────────────────────────────────────────────────────────────────

export function StaffTab() {
  const data = useData();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const today = istDate();
  const active = data.staff.filter((s) => s.active);
  const gone = data.staff.filter((s) => !s.active);
  const waiting = E.leaveRequestsWaiting(data);
  const rows = useMemo(
    () =>
      active.map((s) => {
        const day = E.staffDay(data, s.id);
        return { s, status: todayStatus(data, s, today), customers: day.counts.handled, earned: day.earned, leaveFlag: waiting.some((l) => l.staffId === s.id) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, today],
  );
  const n = (k: Status["kind"]) => rows.filter((r) => r.status.kind === k).length;
  const checkedIn = n("in") + n("late");

  return (
    <Backdrop>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + DOCK_SPACE + 40, gap: 12 }} showsVerticalScrollIndicator={false}>
        <GT size={13} w="semibold" c={glass.soft}>
          Owner · {C.shortDay(today)}
        </GT>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34 }}>
            Staff
          </GT>
          <View accessible accessibilityLabel={`Checked in ${checkedIn} of ${rows.length}. ${n("late")} late, ${n("leave")} on leave`} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
            <Dot c={rows.length && n("off") === rows.length ? glass.faint : OK} />
            <GT size={12.5} w="bold">
              {rows.length && n("off") === rows.length ? "Weekly off today" : `${checkedIn} of ${rows.length} in`}
            </GT>
            {n("late") ? (
              <>
                <Dot c={LATE} />
                <GT size={12.5} w="bold">
                  {n("late")} late
                </GT>
              </>
            ) : null}
            {n("leave") ? (
              <>
                <Dot c={LEAVE} />
                <GT size={12.5} w="bold">
                  {n("leave")} leave
                </GT>
              </>
            ) : null}
          </View>
        </View>

        {waiting.length ? (
          <Press onPress={() => nav.push({ name: "leaveRequests" })} accessibilityLabel={`Leave requests, ${waiting.length} waiting. Review`} scaleTo={0.985}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 20, backgroundColor: "rgba(228,166,123,0.2)", borderWidth: 1, borderColor: "rgba(228,166,123,0.5)" }}>
              <View style={{ flexShrink: 1 }}>
                <GT size={11.5} w="heavy" c={glass.gold2} style={{ letterSpacing: 1, textTransform: "uppercase" }}>
                  Leave requests · {waiting.length} waiting
                </GT>
                <GT size={15} w="heavy" numberOfLines={1}>
                  {waiting.map((l) => data.staff.find((s) => s.id === l.staffId)?.name.split(" ")[0]).join(", ")}
                </GT>
              </View>
              <View style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
                <GT size={14} w="heavy" c={glass.ink}>
                  Review
                </GT>
              </View>
            </View>
          </Press>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }}>
          {rows.map((r, i) => (
            <Animated.View key={r.s.id} entering={reduced ? undefined : FadeInDown.duration(380).delay(Math.min(i, 6) * 60).easing(easeOut)} style={{ width: "48.4%" }}>
              <Press onPress={() => nav.push({ name: "staffCard", id: r.s.id })} accessibilityLabel={`${r.s.name}, ${r.s.chair}, ${r.status.label}. ${r.customers} customers, ${inr(r.earned)} today${r.leaveFlag ? ". Leave request waiting" : ""}`} scaleTo={0.97}>
                <GlassCard style={{ overflow: "hidden", opacity: r.status.kind === "leave" || r.status.kind === "off" ? 0.78 : 1 }}>
                  <StylistPhoto staff={r.s} width="100%" height={168} radius={0} />
                  <View style={{ position: "absolute", top: 10, left: 10 }}>
                    <Badge status={r.status} />
                  </View>
                  {r.leaveFlag ? (
                    <View style={{ position: "absolute", top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: glass.gold }}>
                      <GT size={11} w="heavy" c={glass.ink}>
                        Leave?
                      </GT>
                    </View>
                  ) : null}
                  <View style={{ padding: 12, gap: 2 }}>
                    <GT size={16.5} w="heavy" numberOfLines={1}>
                      {r.s.name.split(" ")[0]}
                    </GT>
                    <GT size={12.5} c={glass.soft} numberOfLines={1}>
                      {r.s.chair}
                    </GT>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                      <GT size={12.5} c={glass.soft}>
                        {r.customers} customer{r.customers === 1 ? "" : "s"}
                      </GT>
                      <GT size={13.5} w="heavy" c={glass.gold}>
                        {inr(r.earned)}
                      </GT>
                    </View>
                  </View>
                </GlassCard>
              </Press>
            </Animated.View>
          ))}
        </View>
        {rows.length === 0 ? (
          <GlassCard style={{ padding: 18, gap: 6 }}>
            <GT size={16} w="heavy">
              No stylists yet
            </GT>
            <GT size={13.5} c={glass.soft}>
              Tap the gold + to add the first one. They sign in on their own phone with their mobile number.
            </GT>
          </GlassCard>
        ) : null}

        {gone.length ? (
          <>
            <SectionLabel>Deactivated</SectionLabel>
            <GlassCard style={{ overflow: "hidden" }}>
              {gone.map((s, i) => (
                <Pressable key={s.id} onPress={() => nav.push({ name: "staffCard", id: s.id })} accessibilityRole="button" accessibilityLabel={`${s.name}, deactivated. Open`} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)", opacity: 0.7 }}>
                  <StylistPhoto staff={s} width={40} height={40} radius={12} />
                  <View style={{ flex: 1 }}>
                    <GT size={15} w="bold">
                      {s.name}
                    </GT>
                    <GT size={12} c={glass.soft}>
                      {s.chair} · can't log in
                    </GT>
                  </View>
                  <GT size={15} c={glass.soft}>
                    ›
                  </GT>
                </Pressable>
              ))}
            </GlassCard>
          </>
        ) : null}
      </ScrollView>
      <Press
        onPress={() => nav.push({ name: "addStylist" })}
        accessibilityLabel="Add a stylist"
        scaleTo={0.92}
        style={{ position: "absolute", right: 20, bottom: insets.bottom + DOCK_SPACE + 14, width: 60, height: 60, borderRadius: 30, backgroundColor: glass.gold, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}
      >
        <Icon name="plus" color={glass.ink} size={26} strokeWidth={2.6} />
      </Press>
      <OwnerDock />
    </Backdrop>
  );
}

function Dot({ c }: { c: string }) {
  return <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c }} />;
}

// ── Add a stylist ────────────────────────────────────────────────────────────

/** Gallery or camera, then the photo is stored under a fresh key. Returns the key or null. */
function usePhotoPicker() {
  const toast = useToast();
  const [ask, setAsk] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const choose = async (from: "gallery" | "camera") => {
    setAsk(false);
    try {
      const uri = await pickPhoto(from);
      if (uri) setPreview(uri);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't open the photos", "error");
    }
  };
  /** Saves the picked photo and returns its key; null when none was picked. */
  const save = async (): Promise<string | null> => {
    if (!preview) return null;
    const key = await savePhoto(`staff-${Date.now().toString(36)}`, preview);
    return key || null;
  };
  const sheet = (
    <GlassSheet open={ask} onClose={() => setAsk(false)} label="Stylist photo">
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 10 }}>
        <GT size={21} w="heavy">
          Stylist photo
        </GT>
        <GT size={13.5} c={glass.soft}>
          A clear face photo. It shows on their card here and on their own Profile.
        </GT>
        <GoldButton label="Choose from gallery" onPress={() => choose("gallery")} />
        <GhostButton label="Take a photo" onPress={() => choose("camera")} />
      </View>
    </GlassSheet>
  );
  return { open: () => setAsk(true), preview, setPreview, save, sheet };
}

function PhotoBox({ preview, onPress, size = 116, label = "Upload photo" }: { preview: string | null; onPress: () => void; size?: number; label?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={preview ? "Change photo" : label} style={{ width: size, height: size * 1.15, borderRadius: 20, borderWidth: 1.5, borderStyle: preview ? "solid" : "dashed", borderColor: preview ? glass.gold : "rgba(255,244,236,0.4)", overflow: "hidden", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(26,18,16,0.3)" }}>
      {preview ? (
        <Image source={{ uri: preview }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      ) : (
        <>
          <Icon name="camera" color={glass.gold2} size={28} />
          <GT size={12.5} w="semibold" c={glass.soft} style={{ textAlign: "center" }}>
            {label}
          </GT>
        </>
      )}
    </Pressable>
  );
}

function WeekdayPicker({ value, onChange }: { value: number | null; onChange: (d: number | null) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel="Weekly off">
      {WEEK_ORDER.map((d) => {
        const on = value === d;
        return (
          <Pressable key={d} onPress={() => onChange(on ? null : d)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={C.WEEKDAYS[d]} style={{ flex: 1, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: on ? glass.gold : glass.card, borderWidth: 1, borderColor: on ? glass.gold : glass.line }}>
            <GT size={13.5} w="heavy" c={on ? glass.ink : glass.soft}>
              {DAY_LETTERS[d]}
            </GT>
          </Pressable>
        );
      })}
    </View>
  );
}

const nextChair = (data: Data) => {
  const nums = data.staff.map((s) => Number(/\d+/.exec(s.chair)?.[0] ?? 0));
  return `Chair ${Math.max(0, ...nums) + 1}`;
};

export function AddStylist() {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const photo = usePhotoPicker();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [chair, setChair] = useState(() => nextChair(data));
  const [shift, setShift] = useState(config.shift.start);
  const [off, setOff] = useState<number | null>(config.appointments.closedDays[0] ?? null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = !!name.trim() && phone.replace(/\D/g, "").length >= 10 && password.length >= MIN_PASSWORD;

  const add = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const secret = await makeSecret(password, hasher);
      const photoKey = await photo.save().catch(() => null);
      const s = commit((d) => E.addStaff(d, { name, phone, chair, secret, photoKey, shiftStart: shift, weeklyOff: off }));
      toast(`${s.name.split(" ")[0]} added. They log in with ${formatPhone(s.phone)}.`);
      nav.pop();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't add the stylist.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassScreen title="Add a stylist" back="Staff" onBack={nav.pop} after={photo.sheet}>
      <View style={{ flexDirection: "row", gap: 14 }}>
        <PhotoBox preview={photo.preview} onPress={photo.open} />
        <View style={{ flex: 1, gap: 10 }}>
          <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Full name" />
          <Field label="Mobile (their login)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="10-digit number" maxLength={14} />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field label="Chair" value={chair} onChangeText={setChair} placeholder="e.g. Chair 4" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Shift starts" value={shift} onChangeText={setShift} placeholder="10:00" keyboardType="numbers-and-punctuation" maxLength={5} />
        </View>
      </View>
      <GT size={12.5} w="semibold" c={glass.soft}>
        Weekly off
      </GT>
      <WeekdayPicker value={off} onChange={setOff} />
      <Field label="First password (they can change it)" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder={`At least ${MIN_PASSWORD} characters`} />
      <GT size={12.5} c={glass.faint}>
        They log in on their own phone with this mobile number and password, then check in with a selfie each day.
      </GT>
      <GoldButton label={busy ? "Adding…" : "Add stylist"} disabled={!ready || busy} onPress={add} style={{ marginTop: 6 }} />
    </GlassScreen>
  );
}

// ── Stylist profile ──────────────────────────────────────────────────────────

type SheetKind = "leave" | "shift" | "account" | "deactivate" | null;

export function StaffCard({ id }: { id: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const s = data.staff.find((x) => x.id === id);
  if (!s) return <GlassScreen title="Stylist" back="Staff" onBack={nav.pop}>{null}</GlassScreen>;
  const today = istDate();
  const month = today.slice(0, 7);
  const status = todayStatus(data, s, today);
  const att = E.myAttendance(data, s.id, month);
  const perf = E.staffMonth(data, s.id, month);
  const leave = E.myLeave(data, s.id);
  const leaveThisMonth = att.month.leave;
  const monthName = C.MONTHS[Number(month.slice(5, 7)) - 1];
  const joined = `${C.MONTHS[Number(att.joined.slice(5, 7)) - 1].slice(0, 3)} ${att.joined.slice(0, 4)}`;
  const enter = (i: number) => (reduced ? undefined : FadeInDown.duration(380).delay(i * 70).easing(easeOut));

  const toggleActive = () => {
    commit((d) => E.updateStaff(d, s.id, { active: !s.active }));
    toast(s.active ? `${s.name.split(" ")[0]} can no longer log in. History kept.` : `${s.name.split(" ")[0]} can log in again`);
    setSheet(null);
  };

  return (
    <GlassScreen
      title=""
      back="Staff"
      onBack={nav.pop}
      after={
        <>
          <LeaveSheet open={sheet === "leave"} onClose={() => setSheet(null)} staff={s} leave={leave} />
          <ShiftSheet open={sheet === "shift"} onClose={() => setSheet(null)} staff={s} />
          <AccountSheet open={sheet === "account"} onClose={() => setSheet(null)} staff={s} />
          <GlassSheet open={sheet === "deactivate"} onClose={() => setSheet(null)} label={s.active ? "Deactivate" : "Reactivate"}>
            <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
              <GT size={21} w="heavy">
                {s.active ? `Deactivate ${s.name.split(" ")[0]}?` : `Reactivate ${s.name.split(" ")[0]}?`}
              </GT>
              <GT size={13.5} c={glass.soft}>
                {s.active
                  ? "For when someone leaves the salon. They can't log in any more and can't be booked. Their visits, bills and attendance stay in the records. You can reactivate them later."
                  : "They can log in again with their mobile number and password, and can be booked."}
              </GT>
              <GoldButton label={s.active ? "Deactivate" : "Reactivate"} style={s.active ? { backgroundColor: "#F08C6A" } : undefined} onPress={toggleActive} />
              <GhostButton label="Cancel" onPress={() => setSheet(null)} />
            </View>
          </GlassSheet>
        </>
      }
    >
      <Animated.View entering={enter(0)} style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <StylistPhoto staff={s} width={132} height={150} radius={22} />
        <View style={{ flex: 1, gap: 2 }}>
          <GT size={25} w="heavy" accessibilityRole="header" style={{ lineHeight: 30 }}>
            {s.name}
          </GT>
          <GT size={13.5} c={glass.soft}>
            {s.chair}
          </GT>
          <GT size={13.5} c={glass.soft}>
            {formatPhone(s.phone)}
          </GT>
          <GT size={13.5} c={glass.soft}>
            Since {joined}
          </GT>
          <View style={{ alignSelf: "flex-start", marginTop: 6 }}>
            <Badge status={s.active ? status : { kind: "notin", label: "Deactivated", tone: "#F08C6A" }} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={enter(1)} style={{ flexDirection: "row", gap: 8 }}>
        <GhostButton label="Call" style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:+91${s.phone}`).catch(() => toast("Calling isn't available here", "error"))} />
        <GhostButton label="WhatsApp" style={{ flex: 1 }} onPress={() => Linking.openURL(E.whatsappLink(s.phone, `Hi ${s.name.split(" ")[0]}, `)).catch(() => toast("WhatsApp isn't available here", "error"))} />
      </Animated.View>

      <Animated.View entering={enter(2)} style={{ gap: 8 }}>
        <SectionLabel>{`${monthName} so far`}</SectionLabel>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Count n={att.month.present} label="present" />
          <Count n={att.month.late} label="late" tone={LATE} />
          <Count n={leaveThisMonth} label="leave" tone={LEAVE} />
          <Count n={perf.customers} label="customers" tone={glass.gold} />
        </View>
      </Animated.View>

      <Animated.View entering={enter(3)}>
        <GlassCard style={{ overflow: "hidden" }}>
          <Option icon="check" title="Attendance" sub="Month calendar, today's selfie, late count, export" value={`${att.month.present} · ${att.month.late} late`} onPress={() => nav.push({ name: "staffAttendance", id: s.id })} />
          <Option icon="calendar" title="Leave" sub={leave.next ? `Next: ${rangeText(leave.next)}` : "Requests, approved and declined leave"} value={leave.waiting ? `${leave.waiting} waiting` : `${leave.takenThisYear} this year`} badge={leave.waiting} onPress={() => setSheet("leave")} />
          <Option icon="reminders" title="Shift & weekly off" sub={`Shift start ${s.shiftStart ?? config.shift.start}, grace ${config.shift.graceMinutes} min, off on ${weeklyOffName(s)}`} value={s.shiftStart ?? config.shift.start} onPress={() => setSheet("shift")} />
          <Option icon="dashboard" title="Performance" sub="Customers, earnings, top services" value={compactInr(perf.total)} onPress={() => nav.push({ name: "ownerStylist", id: s.id })} />
          <Option icon="person" title="Account" sub="Change photo, mobile, chair, reset password" onPress={() => setSheet("account")} />
          <Option icon="close" title={s.active ? "Deactivate" : "Reactivate"} sub={s.active ? "When someone leaves: can't log in, history kept" : "Let them log in again"} danger={s.active} onPress={() => setSheet("deactivate")} />
        </GlassCard>
      </Animated.View>
    </GlassScreen>
  );
}

const compactInr = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : inr(n));
const rangeText = (l: { from: string; to: string }) => (l.from === l.to ? C.shortDay(l.from) : `${C.shortDay(l.from)} – ${C.shortDay(l.to)}`);

function Count({ n, label, tone = OK }: { n: number; label: string; tone?: string }) {
  return (
    <View accessible accessibilityLabel={`${n} ${label}`} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 16, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
      <GT size={21} w="heavy" c={tone} style={{ fontVariant: ["tabular-nums"] }}>
        {n}
      </GT>
      <GT size={11.5} c={glass.soft}>
        {label}
      </GT>
    </View>
  );
}

function Option({ icon, title, sub, value, onPress, danger, badge }: { icon: IconName; title: string; sub?: string; value?: string; onPress: () => void; danger?: boolean; badge?: number }) {
  const tone = danger ? "#F08C6A" : glass.gold2;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}${sub ? `. ${sub}` : ""}${value ? `. ${value}` : ""}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: 1, borderColor: "rgba(255,244,236,0.08)", marginTop: -1 }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: danger ? "rgba(240,140,106,0.14)" : "rgba(228,166,123,0.16)" }}>
        <Icon name={icon} color={tone} size={19} />
      </View>
      <View style={{ flex: 1 }}>
        <GT size={15.5} w="bold" c={danger ? tone : glass.cream}>
          {title}
        </GT>
        {sub ? (
          <GT size={12} c={glass.soft} numberOfLines={2}>
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
      ) : value ? (
        <GT size={12.5} w="semibold" c={glass.soft}>
          {value}
        </GT>
      ) : null}
      <GT size={15} c={glass.soft}>
        ›
      </GT>
    </Pressable>
  );
}

function LeaveSheet({ open, onClose, staff, leave }: { open: boolean; onClose: () => void; staff: Staff; leave: ReturnType<typeof E.myLeave> }) {
  const nav = useNav();
  const tone = (st: LeaveRequest["status"]) => (st === "APPROVED" ? LEAVE : st === "WAITING" ? glass.gold2 : "#F08C6A");
  const label = (st: LeaveRequest["status"]) => (st === "APPROVED" ? "Approved" : st === "WAITING" ? "Waiting for you" : st === "DECLINED" ? "Declined" : "Withdrawn");
  return (
    <GlassSheet open={open} onClose={onClose} label={`${staff.name}'s leave`}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
        <GT size={21} w="heavy">
          {staff.name.split(" ")[0]}'s leave
        </GT>
        <GT size={13.5} c={glass.soft}>
          {leave.takenThisYear} working day{leave.takenThisYear === 1 ? "" : "s"} taken this year{leave.next ? ` · next ${rangeText(leave.next)}` : ""}. Leave is requested by the stylist from their Profile; you approve or decline it.
        </GT>
        {leave.waiting ? (
          <GoldButton
            label={`Review ${leave.waiting} waiting request${leave.waiting === 1 ? "" : "s"}`}
            onPress={() => {
              onClose();
              nav.push({ name: "leaveRequests" });
            }}
          />
        ) : null}
        <GlassCard style={{ overflow: "hidden" }}>
          {leave.requests.length ? (
            leave.requests.slice(0, 6).map((l, i) => (
              <View key={l.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
                <View style={{ flex: 1 }}>
                  <GT size={14.5} w="bold">
                    {rangeText(l)}
                  </GT>
                  <GT size={12} c={glass.soft} numberOfLines={2}>
                    {TYPE[l.type]} · {l.workingDays === 0.5 ? "half day" : `${l.workingDays} day${l.workingDays === 1 ? "" : "s"}`}
                    {l.status === "DECLINED" && l.reason ? ` · ${l.reason}` : l.note ? ` · ${l.note}` : ""}
                  </GT>
                </View>
                <GT size={12} w="heavy" c={tone(l.status)}>
                  {label(l.status)}
                </GT>
              </View>
            ))
          ) : (
            <GT size={13.5} c={glass.soft} style={{ padding: 14 }}>
              No leave requests yet.
            </GT>
          )}
        </GlassCard>
        <GhostButton label="Close" onPress={onClose} />
      </View>
    </GlassSheet>
  );
}

function ShiftSheet({ open, onClose, staff }: { open: boolean; onClose: () => void; staff: Staff }) {
  const toast = useToast();
  const [shift, setShift] = useState(staff.shiftStart ?? config.shift.start);
  const [off, setOff] = useState<number | null>(staff.weeklyOff ?? config.appointments.closedDays[0] ?? null);
  useEffect(() => {
    if (open) {
      setShift(staff.shiftStart ?? config.shift.start);
      setOff(staff.weeklyOff ?? config.appointments.closedDays[0] ?? null);
    }
  }, [open, staff]);
  const save = () => {
    try {
      commit((d) => E.updateStaff(d, staff.id, { shiftStart: shift, weeklyOff: off }));
      toast("Shift saved");
      onClose();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save.", "error");
    }
  };
  return (
    <GlassSheet open={open} onClose={onClose} label="Shift and weekly off">
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
        <GT size={21} w="heavy">
          Shift & weekly off
        </GT>
        <Field label="Shift starts" value={shift} onChangeText={setShift} placeholder="10:00" keyboardType="numbers-and-punctuation" maxLength={5} />
        <GT size={12.5} c={glass.soft}>
          Later than {config.shift.graceMinutes} minutes after the salon's shift start ({config.shift.start}) counts as late.
        </GT>
        <GT size={12.5} w="semibold" c={glass.soft}>
          Weekly off
        </GT>
        <WeekdayPicker value={off} onChange={setOff} />
        <GoldButton label="Save" onPress={save} />
        <GhostButton label="Cancel" onPress={onClose} />
      </View>
    </GlassSheet>
  );
}

function AccountSheet({ open, onClose, staff }: { open: boolean; onClose: () => void; staff: Staff }) {
  const toast = useToast();
  const photo = usePhotoPicker();
  const [phone, setPhone] = useState(staff.phone);
  const [chair, setChair] = useState(staff.chair);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setPhone(staff.phone);
    setChair(staff.chair);
    setPw("");
    photo.setPreview(null);
    photoUri(staff.photoKey ?? null).then(setCurrent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff]);
  const save = async () => {
    if (busy) return;
    if (pw && pw.length < MIN_PASSWORD) return toast(`The new password needs at least ${MIN_PASSWORD} characters`, "error");
    setBusy(true);
    try {
      const secret = pw ? await makeSecret(pw, hasher) : undefined;
      const photoKey = photo.preview ? await photo.save() : undefined;
      commit((d) => E.updateStaff(d, staff.id, { phone, chair, ...(secret ? { secret } : {}), ...(photoKey ? { photoKey } : {}) }));
      toast(pw ? `Saved. Tell ${staff.name.split(" ")[0]} the new password.` : "Saved");
      onClose();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save.", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <GlassSheet open={open} onClose={onClose} label="Account">
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
          <GT size={21} w="heavy">
            Account
          </GT>
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <PhotoBox preview={photo.preview ?? current} onPress={photo.open} size={84} label="Add photo" />
            <GT size={13} c={glass.soft} style={{ flex: 1 }}>
              Tap the photo to change it, from the gallery or the camera.
            </GT>
          </View>
          <Field label="Mobile (their login)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={14} />
          <Field label="Chair" value={chair} onChangeText={setChair} />
          <Field label="Reset password (leave empty to keep)" value={pw} onChangeText={setPw} secureTextEntry autoCapitalize="none" placeholder={`At least ${MIN_PASSWORD} characters`} />
          <GoldButton label={busy ? "Saving…" : "Save"} disabled={busy} onPress={save} />
          <GhostButton label="Cancel" onPress={onClose} />
        </View>
      </GlassSheet>
      {photo.sheet}
    </>
  );
}

// ── Attendance for one stylist ───────────────────────────────────────────────

const KIND_BG: Record<string, string> = {
  present: OK,
  late: LATE,
  leave: LEAVE,
  absent: "rgba(240,140,106,0.3)",
  off: "transparent",
  future: "rgba(255,244,236,0.07)",
  before: "transparent",
};

export function StaffAttendance({ id }: { id: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const today = istDate();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [exporting, setExporting] = useState(0);
  const s = data.staff.find((x) => x.id === id);
  if (!s) return <GlassScreen title="Attendance" back="Staff" onBack={nav.pop}>{null}</GlassScreen>;
  const a = E.myAttendance(data, s.id, month);
  const grid = C.monthGrid(month);
  const first = a.joined.slice(0, 7);
  const rec = E.todaysAttendance(data, s.id);
  const status = todayStatus(data, s, today);

  const exportExcel = async () => {
    if (exporting) return;
    setExporting(0.15);
    try {
      const bytes = buildXlsx(E.attendanceSheets(data, month));
      setExporting(0.7);
      await shareXlsx(`attendance-${month}.xlsx`, bytes);
      setExporting(1);
      toast(`Attendance for ${C.monthName(month)} exported`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't export.", "error");
    } finally {
      setTimeout(() => setExporting(0), 900);
    }
  };

  return (
    <GlassScreen title="Attendance" back={s.name.split(" ")[0]} onBack={nav.pop}>
      <GlassCard style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Selfie photoKey={rec?.photoKey ?? null} staff={s} ring={rec ? status.tone : glass.line} />
        <View style={{ flex: 1, gap: 3 }}>
          <GT size={11.5} w="heavy" c={glass.gold2} style={{ letterSpacing: 1.2, textTransform: "uppercase" }}>
            Today
          </GT>
          <GT size={18} w="heavy">
            {rec ? `${E.staffLate(s, rec.checkInAt) ? "Late" : "On time"} · in ${istTime(rec.checkInAt)}` : status.label}
          </GT>
          <GT size={12.5} c={glass.soft}>
            Shift starts {s.shiftStart ?? config.shift.start} · off on {weeklyOffName(s)}
          </GT>
        </View>
      </GlassCard>

      <View style={{ flexDirection: "row", gap: 6 }}>
        <Count n={a.month.present} label="present" />
        <Count n={a.month.late} label="late" tone={LATE} />
        <Count n={a.month.leave} label="leave" tone={LEAVE} />
        <Count n={a.month.absent} label="absent" tone="#F08C6A" />
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
            [OK, "Present"],
            [LATE, "Late"],
            [LEAVE, "Leave"],
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
            <View key={x.date} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
              <Selfie photoKey={x.photoKey} staff={s} ring={x.late ? LATE : OK} size={40} />
              <View style={{ flex: 1 }}>
                <GT size={14.5} w="bold">
                  {C.shortDay(x.date)}
                </GT>
                <GT size={12} c={glass.soft}>
                  Selfie at {istTime(x.at)}
                </GT>
              </View>
              <GT size={12.5} w="heavy" c={x.late ? LATE : OK}>
                {x.late ? "Late" : "On time"}
              </GT>
            </View>
          ))
        ) : (
          <GT size={13.5} c={glass.soft} style={{ paddingVertical: 14 }}>
            No check-ins yet.
          </GT>
        )}
      </GlassCard>

      <View style={{ gap: 8, marginTop: 4 }}>
        {exporting > 0 ? <Progress value={exporting} /> : null}
        <GoldButton label={exporting > 0 && exporting < 1 ? "Exporting…" : `Export ${C.monthName(month)} to Excel`} disabled={exporting > 0 && exporting < 1} onPress={exportExcel} />
        <GT size={12} c={glass.faint}>
          One file for the whole salon: a summary sheet, then a sheet for each day with check-in times, leave and weekly offs. Selfies stay in the app.
        </GT>
      </View>
    </GlassScreen>
  );
}

function Selfie({ photoKey, staff, ring, size = 64 }: { photoKey: string | null; staff: Staff; ring: string; size?: number }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    photoUri(photoKey).then((u) => live && setUri(u));
    return () => void (live = false);
  }, [photoKey]);
  return (
    <View style={{ width: size + 6, height: size + 6, borderRadius: (size + 6) / 2, borderWidth: 2, borderColor: ring, alignItems: "center", justifyContent: "center" }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} accessibilityLabel={`${staff.name}'s check-in selfie`} />
      ) : (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "rgba(228,166,123,0.22)", alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${staff.name}, no selfie`}>
          <GT size={size * 0.32} w="heavy" c={glass.gold2}>
            {initials(staff.name)}
          </GT>
        </View>
      )}
    </View>
  );
}

function Round({ label, a11y, disabled, onPress }: { label: string; a11y: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ disabled }} hitSlop={8} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line, opacity: disabled ? 0.35 : 1 }}>
      <GT size={18} w="bold">
        {label}
      </GT>
    </Pressable>
  );
}

/** A thin gold bar that fills as the export is built and shared. */
function Progress({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = reduced ? value : withTiming(value, { duration: 380, easing: easeOut });
  }, [p, value, reduced]);
  const s = useAnimatedStyle(() => ({ width: `${Math.round(p.value * 100)}%` }));
  return (
    <View accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={{ height: 6, borderRadius: 3, backgroundColor: glass.card, overflow: "hidden" }}>
      <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: glass.gold }, s]} />
    </View>
  );
}
