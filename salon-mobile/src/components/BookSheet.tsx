/**
 * "+ Book" (BUILD-SPEC 5.8): one tall sheet whose five parts unlock in order: customer
 * (10-digit mobile; a new customer needs a name and their consent), services, stylist,
 * day and time (only times where the whole booking fits, never the past or a taken
 * stylist), then a note, how they booked and the WhatsApp confirmation with its preview.
 * The engine re-checks everything on Book and its message is shown if it refuses.
 */
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import config from "../config/salon";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate, renderTemplate } from "../domain/rules";
import { commit, getData, useData } from "../domain/store";
import type { Appointment } from "../domain/types";
import { inr } from "../format";
import { useCurrentStaff } from "../screens/Attendance";
import { glass, urbanist } from "../theme/tokens";
import { easeOut, GlassSheet, GoldButton, GT } from "./glass";
import { useToast } from "./Toast";

type Found = NonNullable<ReturnType<typeof E.findByPhone>["customer"]>;

export function BookSheet({
  open,
  day,
  time,
  phone: forPhone,
  top,
  onClose,
  onBooked,
}: {
  open: boolean;
  day: string;
  time?: string;
  /** Opened from a customer's profile: their number is already filled in. */
  phone?: string;
  top: number;
  onClose: () => void;
  onBooked: (appt: Appointment, name: string) => void;
}) {
  const data = useData();
  const me = useCurrentStaff();
  const toast = useToast();
  const today = istDate();

  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [svcs, setSvcs] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | null>(me?.id ?? null);
  const [pickDay, setPickDay] = useState(day);
  const [pickTime, setPickTime] = useState<string | null>(time ?? null);
  const [note, setNote] = useState("");
  const [source, setSource] = useState<Appointment["source"]>("PHONE");
  const [whatsapp, setWhatsapp] = useState(true);

  // Every opening starts clean, on the day (and time) it was opened from.
  useEffect(() => {
    if (!open) return;
    setPhone(forPhone ?? "");
    setFound(null);
    setName("");
    setConsent(false);
    setMarketing(false);
    setSvcs([]);
    setStaffId(me?.id ?? null);
    const start = day < today || C.isClosed(day) ? nextOpen(today) : day;
    setPickDay(start);
    setPickTime(time ?? null);
    setNote("");
    setSource("PHONE");
    setWhatsapp(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const digits = phone.replace(/\D/g, "");
  const valid = digits.length === 10 && /^[6-9]/.test(digits);
  useEffect(() => {
    if (!valid) {
      setFound(null);
      return;
    }
    const r = E.findByPhone(data, digits);
    setFound(r.customer);
    const lastServices = r.customer?.lastVisit?.serviceIds;
    if (lastServices) setSvcs((v) => (v.length ? v : lastServices));
    // Re-run on every opening too: a number filled in from a profile doesn't change between openings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, valid, open]);

  const custOk = valid && (found ? true : name.trim().length > 0 && consent);
  const minutes = svcs.length ? E.appointmentMinutes(svcs) : 0;
  const price = svcs.reduce((s, id) => s + (config.services.find((x) => x.id === id)?.price ?? 0), 0);
  const slots = useMemo(() => (svcs.length ? E.appointmentSlots(data, pickDay, { staffId, minutes }) : []), [data, pickDay, staffId, minutes, svcs.length]);
  useEffect(() => {
    if (pickTime && slots.length && !slots.some((s) => s.time === pickTime && s.free)) setPickTime(null);
  }, [slots, pickTime]);
  const timeOk = !!pickTime && slots.some((s) => s.time === pickTime && s.free);
  const ready = custOk && svcs.length > 0 && timeOk;
  const stylist = staffId ? data.staff.find((s) => s.id === staffId) : null;
  const custName = found?.name ?? name.trim();

  const preview =
    pickTime && svcs.length
      ? renderTemplate(config.appointments.confirmTemplate, {
          name: (custName || "there").split(" ")[0],
          service: svcs.map((id) => config.services.find((s) => s.id === id)?.name ?? id).join(" + ").toLowerCase(),
          salon: config.displayName,
          day: C.shortDay(pickDay),
          time: `${C.clock(pickTime).time} ${C.clock(pickTime).ampm}`,
          stylist: stylist ? ` with ${stylist.name.split(" ")[0]}` : "",
        })
      : null;

  const book = () => {
    try {
      const appt = commit((d) => {
        let next = d;
        let customerId = found?.id;
        if (!customerId) {
          const c = E.createCustomer(next, { phone: digits, name, consent, marketing, takenBy: me?.id ?? null });
          next = c.data;
          customerId = c.result.id;
        }
        const b = E.bookAppointment(next, { customerId, serviceIds: svcs, staffId, day: pickDay, time: pickTime!, source, note, by: me?.id ?? null });
        return { data: b.data, result: b.result };
      });
      // A booking confirmation is a service message, so it doesn't need the marketing opt-in.
      if (whatsapp) {
        const m = E.appointmentMessage(getData(), appt.id, "confirm");
        Linking.openURL(E.whatsappLink(m.phone, m.message)).catch(() => {});
      }
      onBooked(appt, custName);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't book that", "error");
    }
  };

  const steps = [custOk, svcs.length > 0, true, timeOk];
  const unlocked = (i: number) => steps.slice(0, i).every(Boolean);
  const days = Array.from({ length: 14 }, (_, i) => C.addDays(today, i));
  const noRoom = svcs.length > 0 && !C.isClosed(pickDay) && !slots.some((s) => s.free);

  return (
    <GlassSheet open={open} onClose={onClose} top={top} label="New booking">
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 6 }}>
        <GT size={22} w="heavy" accessibilityRole="header">
          New booking
        </GT>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
          <GT size={15} w="bold">
            ✕
          </GT>
        </Pressable>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Section n={1} title="Customer" done={custOk} locked={false}>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="10-digit mobile"
            placeholderTextColor={glass.faint}
            accessibilityLabel="Customer's mobile number"
            style={field(20, 1.5)}
          />
          {valid && found ? (
            <Animated.View entering={FadeInDown.duration(260)} style={card}>
              <GT size={16} w="heavy">
                {found.name}
              </GT>
              <GT size={12.5} c={glass.soft}>
                {found.visitCount ? `${ordinal(found.visitCount + 1)} visit` : "First visit"}
                {found.lastVisit ? ` · last: ${found.lastVisit.serviceIds.map((id) => config.services.find((s) => s.id === id)?.name ?? id).join(" + ")}, ${C.shortDay(istDate(new Date(found.lastVisit.paidAt ?? found.lastVisit.createdAt)))}` : ""}
              </GT>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                {found.walletBalance ? <Tag text={`Wallet ${inr(found.walletBalance)}`} /> : null}
                <Tag text={found.marketingConsentAt ? "Reminders on" : "No reminders"} />
              </View>
            </Animated.View>
          ) : valid ? (
            <Animated.View entering={FadeInDown.duration(260)} style={card}>
              <GT size={16} w="heavy">
                New customer
              </GT>
              <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={glass.faint} accessibilityLabel="Customer's name" style={[field(16), { marginTop: 6 }]} />
              <Tick on={consent} onPress={() => setConsent((v) => !v)} label="Customer agrees we keep their name and number for bookings and visits (needed)" />
              <Tick on={marketing} onPress={() => setMarketing((v) => !v)} label="Customer wants visit reminders and offers on WhatsApp (optional; reply STOP any time)" />
            </Animated.View>
          ) : digits.length === 10 ? (
            <GT size={12} c={glass.late}>
              That isn't an Indian mobile number.
            </GT>
          ) : null}
        </Section>

        <Section n={2} title="Services" done={svcs.length > 0} locked={!unlocked(1)}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {config.services.map((s) => {
              const on = svcs.includes(s.id);
              const last = found?.lastVisit?.serviceIds.includes(s.id);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSvcs((v) => (on ? v.filter((x) => x !== s.id) : [...v, s.id]))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={{ width: "48.5%", padding: 10, borderRadius: 14, backgroundColor: on ? glass.gold : glass.card, borderWidth: 1, borderColor: on ? glass.gold : glass.line }}
                >
                  <GT size={14} w="bold" c={on ? glass.ink : glass.cream}>
                    {s.name}
                  </GT>
                  <GT size={11.5} c={on ? "rgba(42,26,18,0.75)" : glass.soft}>
                    {s.minutes} min · {inr(s.price)}
                  </GT>
                  {last ? (
                    <GT size={9.5} w="heavy" c={on ? glass.ink : glass.gold2} style={{ position: "absolute", right: 8, top: 8 }}>
                      LAST TIME
                    </GT>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <GT size={12.5} c={glass.soft} style={{ marginTop: 8 }}>
            {svcs.length ? `Total ${minutes} min · ${inr(price)}` : "Pick one or more."}
          </GT>
        </Section>

        <Section n={3} title="Stylist" done={svcs.length > 0} locked={!unlocked(2)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, padding: 2 }}>
            {[...data.staff.filter((s) => s.active).map((s, i) => ({ id: s.id as string | null, label: s.id === me?.id ? "You" : s.name.split(" ")[0], initial: s.name[0], color: glass.stylists[i % glass.stylists.length] })), { id: null, label: "Any free", initial: "★", color: "rgba(255,244,236,0.18)" }].map((s) => {
              const on = staffId === s.id;
              return (
                <Pressable key={s.id ?? "any"} onPress={() => setStaffId(s.id)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ width: 60, alignItems: "center", gap: 5 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: on ? glass.gold : "transparent" }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: s.color, alignItems: "center", justifyContent: "center" }}>
                      <GT size={15} w="heavy" c={s.id ? glass.ink : glass.cream}>
                        {s.initial}
                      </GT>
                    </View>
                  </View>
                  <GT size={11.5} w="bold" c={on ? glass.cream : glass.soft} numberOfLines={1}>
                    {s.label}
                  </GT>
                </Pressable>
              );
            })}
          </ScrollView>
        </Section>

        <Section n={4} title="Day and time" done={timeOk} locked={!unlocked(3)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 10 }}>
            {days.map((d, i) => {
              const closed = C.isClosed(d);
              const on = d === pickDay;
              return (
                <Pressable
                  key={d}
                  disabled={closed}
                  onPress={() => setPickDay(d)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on, disabled: closed }}
                  accessibilityLabel={`${C.shortDay(d)}${closed ? ", closed" : ""}`}
                  style={{ width: 48, paddingVertical: 7, borderRadius: 14, alignItems: "center", backgroundColor: on ? glass.gold : glass.card, borderWidth: 1, borderColor: on ? glass.gold : glass.line, opacity: closed ? 0.3 : 1 }}
                >
                  <GT size={10.5} w="bold" c={on ? glass.ink : glass.faint}>
                    {i === 0 ? "Today" : C.WEEKDAYS[C.dayOfWeek(d)].slice(0, 3)}
                  </GT>
                  <GT size={16} w="bold" c={on ? glass.ink : glass.cream}>
                    {C.dayNum(d)}
                  </GT>
                </Pressable>
              );
            })}
          </ScrollView>
          <Animated.View key={`${pickDay}-${staffId}-${minutes}`} entering={FadeInDown.duration(220)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
            {slots.map((s) => {
              const on = s.time === pickTime;
              return (
                <Pressable
                  key={s.time}
                  disabled={!s.free}
                  onPress={() => setPickTime(s.time)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on, disabled: !s.free }}
                  accessibilityLabel={`${C.clock(s.time).time} ${C.clock(s.time).ampm}${s.free ? "" : ", taken"}`}
                  style={{ width: "23%", paddingVertical: 9, borderRadius: 12, alignItems: "center", backgroundColor: on ? glass.gold : s.free ? glass.card : "transparent", borderWidth: 1, borderColor: on ? glass.gold : glass.line, opacity: s.free ? 1 : 0.3 }}
                >
                  <GT size={13.5} w="bold" c={on ? glass.ink : glass.cream} style={{ fontVariant: ["tabular-nums"], textDecorationLine: s.free ? "none" : "line-through" }}>
                    {C.clock(s.time).time}
                  </GT>
                </Pressable>
              );
            })}
          </Animated.View>
          <GT size={12} c={noRoom ? glass.gold2 : glass.faint} w={noRoom ? "bold" : "medium"} style={{ marginTop: 8 }}>
            {C.isClosed(pickDay)
              ? "The salon is closed that day."
              : noRoom
                ? `No room on ${C.shortDay(pickDay)}${stylist ? ` for ${stylist.id === me?.id ? "you" : stylist.name.split(" ")[0]}` : ""}. Try another day${staffId ? " or Any free" : ""}.`
                : "Crossed-out times are taken or too short for the services picked."}
          </GT>
        </Section>

        <Section n={5} title="Note and confirmation" done={false} locked={!unlocked(4)}>
          <TextInput value={note} onChangeText={setNote} maxLength={140} placeholder="Note (optional), e.g. wants a short fade" placeholderTextColor={glass.faint} accessibilityLabel="Note" style={field(15)} />
          <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
            {(
              [
                ["PHONE", "Phone call"],
                ["WHATSAPP", "WhatsApp"],
                ["COUNTER", "In person"],
              ] as const
            ).map(([k, label]) => (
              <Pressable key={k} onPress={() => setSource(k)} accessibilityRole="radio" accessibilityState={{ selected: source === k }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: source === k ? glass.card2 : "transparent", borderWidth: 1, borderColor: source === k ? glass.gold2 : glass.line }}>
                <GT size={12.5} w="bold" c={source === k ? glass.cream : glass.soft}>
                  {label}
                </GT>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setWhatsapp((v) => !v)} accessibilityRole="switch" accessibilityState={{ checked: whatsapp }} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <GT size={13.5} c={glass.soft}>
              Send WhatsApp confirmation
            </GT>
            <Toggle on={whatsapp} />
          </Pressable>
          {whatsapp ? (
            <View style={{ marginTop: 8, padding: 10, borderRadius: 14, borderBottomLeftRadius: 4, backgroundColor: "rgba(37,77,52,0.55)" }}>
              <GT size={12.5} c="#DFF3E4">
                {preview ?? "The message preview appears once a time is picked."}
              </GT>
            </View>
          ) : null}
        </Section>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderColor: glass.line, backgroundColor: glass.sheetDeep, gap: 10 }}>
        <GT size={13} c={glass.soft} numberOfLines={2}>
          {!valid
            ? "Fill in the customer's number to start."
            : !custOk
              ? "Add the new customer's name and their consent."
              : `${custName}${svcs.length ? ` · ${minutes} min · ${inr(price)}` : ""}${timeOk ? ` · ${C.shortDay(pickDay)}, ${C.clock(pickTime!).time} ${C.clock(pickTime!).ampm} with ${stylist ? (stylist.id === me?.id ? "you" : stylist.name.split(" ")[0]) : "anyone free"}` : ""}`}
        </GT>
        <GoldButton label="Book" onPress={book} disabled={!ready} />
      </View>
    </GlassSheet>
  );
}

function nextOpen(day: string): string {
  let d = day;
  for (let i = 0; i < 7 && C.isClosed(d); i++) d = C.addDays(d, 1);
  return d;
}

function ordinal(n: number): string {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${s}`;
}

const card = { marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line, gap: 4 } as const;

function field(size: number, spacing = 0) {
  return {
    fontFamily: urbanist.semibold,
    fontSize: size,
    letterSpacing: spacing,
    color: glass.cream,
    backgroundColor: "rgba(26,18,16,0.55)",
    borderWidth: 1,
    borderColor: glass.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  } as const;
}

function Section({ n, title, done, locked, children }: { n: number; title: string; done: boolean; locked: boolean; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const o = useSharedValue(locked ? 0.32 : 1);
  useEffect(() => {
    o.value = reduced ? (locked ? 0.32 : 1) : withTiming(locked ? 0.32 : 1, { duration: 260, easing: easeOut });
  }, [locked, reduced, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={st} pointerEvents={locked ? "none" : "auto"} accessibilityElementsHidden={locked} importantForAccessibility={locked ? "no-hide-descendants" : "auto"}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: done ? glass.gold : "rgba(228,166,123,0.2)" }}>
          <GT size={11} w="heavy" c={done ? glass.ink : glass.gold2}>
            {n}
          </GT>
        </View>
        <GT size={12} w="heavy" c={glass.gold2} style={{ letterSpacing: 0.8, textTransform: "uppercase" }} accessibilityRole="header">
          {title}
        </GT>
      </View>
      {children}
    </Animated.View>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(228,166,123,0.18)" }}>
      <GT size={11} w="heavy" c={glass.gold2}>
        {text}
      </GT>
    </View>
  );
}

function Tick({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 8 }}>
      <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: on ? glass.gold : glass.soft, backgroundColor: on ? glass.gold : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {on ? (
          <GT size={12} w="heavy" c={glass.ink}>
            ✓
          </GT>
        ) : null}
      </View>
      <GT size={12.5} c={glass.soft} style={{ flex: 1 }}>
        {label}
      </GT>
    </Pressable>
  );
}

function Toggle({ on }: { on: boolean }) {
  const reduced = useReducedMotion();
  const x = useSharedValue(on ? 18 : 0);
  useEffect(() => {
    x.value = reduced ? (on ? 18 : 0) : withTiming(on ? 18 : 0, { duration: 220, easing: easeOut });
  }, [on, reduced, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: on ? glass.gold : "rgba(255,244,236,0.18)", padding: 3 }}>
      <Animated.View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: glass.cream }, knob]} />
    </View>
  );
}
