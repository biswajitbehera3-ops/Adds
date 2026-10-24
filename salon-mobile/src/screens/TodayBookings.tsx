/**
 * Today's bookings (BUILD-SPEC 5.4, 5.5), brown glass, as approved: every booking in the salon
 * today, the on-the-day WhatsApp reminder for each (from 9:00, one tap; marked Sent for
 * everyone once done), "arrived · start visit" for the next one, and one-tap no-show once
 * the time has passed.
 */
import { useMemo, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { GhostButton, GlassCard, GlassScreen, GoldButton, GT } from "../components/glass";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate } from "../domain/rules";
import { commit, useData } from "../domain/store";
import { useNav } from "../nav/Navigator";
import { glass } from "../theme/tokens";
import { useCurrentStaff } from "./Attendance";

export function TodayBookings() {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const now = new Date();
  const today = istDate(now);
  const list = useMemo(() => E.appointmentsOn(data, today).filter((a) => a.status !== "CANCELLED"), [data, today]);
  const due = new Set(E.appointmentRemindersDue(data, now).map((a) => a.id));
  const beforeNine = now.getTime() < E.istInstant(today, config.appointments.reminderAt).getTime();
  const next = list.find((a) => a.status === "BOOKED" && (!me || a.staffId === me.id || !a.staffId));
  const at = (t: string) => `${C.clock(t).time} ${C.clock(t).ampm}`;

  const run = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Something went wrong", "error");
    }
  };
  const send = (id: string) =>
    run(() => {
      const m = E.appointmentMessage(data, id, "reminder");
      commit((d) => E.markAppointmentReminded(d, { id, channel: "MANUAL" }));
      Linking.openURL(E.whatsappLink(m.phone, m.message)).catch(() => {});
    });
  const arrived = (id: string, staffId: string | null) =>
    run(() => {
      const r = commit((d) => E.appointmentArrived(d, { id, staffId: staffId ?? me?.id ?? data.staff[0].id }));
      nav.replace({ name: "visit", id: r.visit.id });
    });

  return (
    <GlassScreen title="Today's bookings" back="Home" onBack={nav.pop}>
      <GT size={13} c={glass.soft} style={{ marginTop: -8 }}>
        {C.WEEKDAYS[C.dayOfWeek(today)]} {C.dayNum(today)} {C.MONTHS[Number(today.slice(5, 7)) - 1].slice(0, 3)} · reminders go out from {at(config.appointments.reminderAt)}
      </GT>
      {list.length ? (
        <GlassCard style={{ overflow: "hidden" }}>
          {list.map((a, i) => {
            const state = C.bookingState(data, a, now);
            const sent = !!a.reminderSentAt;
            const isOpen = open === a.id;
            return (
              <View key={a.id} style={{ borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
                <Pressable onPress={() => setOpen(isOpen ? null : a.id)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${at(a.time)}, ${a.customerName}, ${a.serviceNames.join(" and ")}${a.stylistName ? ` with ${a.stylistName}` : ""}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
                  <GT size={14} w="heavy" style={{ width: 58, fontVariant: ["tabular-nums"] }}>
                    {C.clock(a.time).time}
                    <GT size={10.5} c={glass.faint}> {C.clock(a.time).ampm}</GT>
                  </GT>
                  <View style={{ flex: 1 }}>
                    <GT size={15} w="bold" c={state === "done" || state === "noshow" ? glass.faint : glass.cream}>
                      {a.customerName}
                    </GT>
                    <GT size={12} c={glass.soft} numberOfLines={1}>
                      {a.serviceNames.join(" + ")} · {a.stylistName?.split(" ")[0] ?? "anyone"}
                    </GT>
                  </View>
                  {state === "inchair" || state === "done" || state === "noshow" ? (
                    <GT size={12} w="heavy" c={glass.faint}>
                      {state === "inchair" ? "In chair" : state === "done" ? "Done" : "No-show"}
                    </GT>
                  ) : sent ? (
                    <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(143,214,164,0.16)" }}>
                      <GT size={11.5} w="heavy" c={glass.ok}>
                        Sent ✓
                      </GT>
                    </View>
                  ) : due.has(a.id) ? (
                    <Pressable onPress={() => send(a.id)} accessibilityRole="button" accessibilityLabel={`Send reminder to ${a.customerName}`} style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 }}>
                      <GT size={13} w="heavy" c={glass.ink}>
                        Send
                      </GT>
                    </Pressable>
                  ) : (
                    <GT size={11.5} c={glass.faint}>
                      {beforeNine ? `at ${C.clock(config.appointments.reminderAt).time}` : state === "late" ? "Late" : ""}
                    </GT>
                  )}
                </Pressable>
                {isOpen ? (
                  <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>
                    <View style={{ padding: 10, borderRadius: 12, borderBottomLeftRadius: 4, backgroundColor: "rgba(37,77,52,0.55)" }}>
                      <GT size={12.5} c="#DFF3E4">
                        {safeMessage(data, a.id)}
                      </GT>
                    </View>
                    {a.status === "BOOKED" ? (
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <GoldButton label="Arrived · start visit" style={{ flex: 1, paddingVertical: 11 }} onPress={() => arrived(a.id, a.staffId)} />
                        {state === "late" ? <GhostButton label="No-show" tone="#F08C6A" style={{ flex: 1 }} onPress={() => run(() => (commit((d) => E.markNoShow(d, a.id)), toast("Marked as no-show"), setOpen(null)))} /> : null}
                      </View>
                    ) : null}
                  </Animated.View>
                ) : null}
              </View>
            );
          })}
        </GlassCard>
      ) : (
        <GT size={14} c={glass.soft} style={{ paddingVertical: 16 }}>
          {C.isClosed(today) ? "The salon is closed today." : "No bookings today."}
        </GT>
      )}
      {next ? <GoldButton label={`${next.customerName.split(" ")[0]} arrived · start visit`} onPress={() => arrived(next.id, next.staffId)} /> : null}
      <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
        No-show after the time? Open the booking and one tap marks it.
      </GT>
    </GlassScreen>
  );
}

function safeMessage(data: ReturnType<typeof useData>, id: string) {
  try {
    return E.appointmentMessage(data, id, "reminder").message;
  } catch {
    return "This customer's number has been deleted.";
  }
}
