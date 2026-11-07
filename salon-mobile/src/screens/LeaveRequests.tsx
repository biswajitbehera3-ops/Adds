/**
 * The owner's Leave requests (BUILD-SPEC 4.16), brown glass. Each request shows the dates,
 * type, working days, the stylist's note, their bookings on those days and who else is in.
 * Approve asks what to do with those bookings (give them to a free stylist, or ask the
 * customers to rebook) and then lists the customers to tell on WhatsApp. Decline needs a
 * reason, which the stylist sees.
 */
import { useState } from "react";
import { Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { GhostButton, GlassCard, GlassScreen, GlassSheet, GoldButton, GT } from "../components/glass";
import { useToast } from "../components/Toast";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate } from "../domain/rules";
import { commit, useData } from "../domain/store";
import type { LeaveRequest } from "../domain/types";
import { useNav } from "../nav/Navigator";
import { glass, urbanist } from "../theme/tokens";

type Result = ReturnType<typeof E.approveLeave>["result"];
const TYPE: Record<LeaveRequest["type"], string> = { CASUAL: "Casual", SICK: "Sick", OTHER: "Other" };
const REASONS = ["Busy day", "Too many off that day", "Short notice", "Other"];
const range = (l: { from: string; to: string }) => (l.from === l.to ? C.shortDay(l.from) : `${C.shortDay(l.from)} – ${C.shortDay(l.to)}`);
const days = (n: number) => (n === 0.5 ? "Half day" : `${n} working day${n === 1 ? "" : "s"}`);

export function LeaveRequests() {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<"WAITING" | "APPROVED" | "DECLINED">("WAITING");
  const [approving, setApproving] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const list = data.leaves.filter((l) => l.status === tab).sort((a, b) => (tab === "WAITING" ? a.createdAt.localeCompare(b.createdAt) : b.from.localeCompare(a.from)));
  const count = (s: LeaveRequest["status"]) => data.leaves.filter((l) => l.status === s).length;

  return (
    <GlassScreen
      title="Leave requests"
      back="Owner"
      onBack={nav.pop}
      after={
        <>
          <ApproveSheet id={approving} onClose={() => setApproving(null)} onDone={(r) => (setApproving(null), setResult(r), toast(`Leave approved · ${r.leave.from === r.leave.to ? C.shortDay(r.leave.from) : range(r.leave)}`))} />
          <DeclineSheet id={declining} onClose={() => setDeclining(null)} onDone={() => (setDeclining(null), toast("Declined. They'll see your reason."))} />
          <TellCustomers result={result} onClose={() => setResult(null)} />
        </>
      }
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(
          [
            ["WAITING", `Waiting · ${count("WAITING")}`],
            ["APPROVED", "Approved"],
            ["DECLINED", "Declined"],
          ] as const
        ).map(([k, label]) => (
          <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: tab === k ? glass.gold : glass.card, borderWidth: 1, borderColor: tab === k ? glass.gold : glass.line }}>
            <GT size={13.5} w="bold" c={tab === k ? glass.ink : glass.soft}>
              {label}
            </GT>
          </Pressable>
        ))}
      </View>
      {list.length ? (
        list.map((l, i) => {
          const im = E.leaveImpact(data, l.id);
          return (
            <Animated.View key={l.id} entering={reduced ? undefined : FadeInDown.duration(280).delay(i * 40)}>
              <GlassCard style={{ padding: 14, gap: 9 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: glass.gold, alignItems: "center", justifyContent: "center" }}>
                    <GT size={14} w="heavy" c={glass.ink}>
                      {im.staffName.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                    </GT>
                  </View>
                  <View style={{ flex: 1 }}>
                    <GT size={15.5} w="bold">
                      {im.staffName}
                    </GT>
                    <GT size={12.5} c={glass.soft}>
                      {range(l)} · {TYPE[l.type]}
                    </GT>
                  </View>
                  <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(245,201,160,0.14)" }}>
                    <GT size={11.5} w="heavy" c={glass.gold2}>
                      {days(im.workingDays)}
                    </GT>
                  </View>
                </View>
                {l.note ? (
                  <GT size={13} c={glass.soft} style={{ fontStyle: "italic" }}>
                    “{l.note}”
                  </GT>
                ) : null}
                {l.status === "WAITING" ? (
                  <>
                    <Note tone={im.bookings.length ? "warn" : "ok"}>
                      {im.bookings.length
                        ? `${im.bookings.length} of ${im.staffName.split(" ")[0]}'s bookings fall on those days (${im.bookings.map((b) => C.clock(b.time).time).join(", ")}). You'll choose what to do with them.`
                        : "No bookings on those days."}
                    </Note>
                    <Note tone={im.working.length ? "ok" : "warn"}>
                      {im.working.length ? `${im.working.map((n) => n.split(" ")[0]).join(", ")} ${im.working.length === 1 ? "is" : "are"} working then.` : "Nobody else is working then."}
                      {im.alsoOff.length ? ` Already off: ${im.alsoOff.map((n) => n.split(" ")[0]).join(", ")}.` : ""}
                    </Note>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <GhostButton label="Decline" tone="#F08C6A" style={{ flex: 1 }} onPress={() => setDeclining(l.id)} />
                      <GoldButton label="Approve" style={{ flex: 1, paddingVertical: 12 }} onPress={() => setApproving(l.id)} />
                    </View>
                  </>
                ) : (
                  <GT size={12.5} c={l.status === "DECLINED" ? "#F08C6A" : glass.ok}>
                    {l.status === "DECLINED" ? `Declined: “${l.reason}”` : `Approved ${l.decidedAt ? C.shortDay(istDate(new Date(l.decidedAt))) : ""}${l.bookings === "REASSIGNED" ? " · bookings given to free stylists" : l.bookings === "REBOOK" ? " · customers asked to rebook" : ""}`}
                    {l.seenAt ? " · seen" : " · not seen yet"}
                  </GT>
                )}
              </GlassCard>
            </Animated.View>
          );
        })
      ) : (
        <GT size={14} c={glass.soft} style={{ paddingVertical: 20 }}>
          {tab === "WAITING" ? "No leave requests waiting." : tab === "APPROVED" ? "No approved leave yet." : "Nothing declined."}
        </GT>
      )}
    </GlassScreen>
  );
}

function Note({ tone, children }: { tone: "ok" | "warn"; children: React.ReactNode }) {
  const ok = tone === "ok";
  return (
    <View style={{ padding: 10, borderRadius: 12, backgroundColor: ok ? "rgba(156,203,143,0.1)" : "rgba(240,168,106,0.12)", borderWidth: 1, borderColor: ok ? "rgba(156,203,143,0.3)" : "rgba(240,168,106,0.35)" }}>
      <GT size={12.5} c={ok ? glass.ok : "#F0A86A"}>
        {children}
      </GT>
    </View>
  );
}

function ApproveSheet({ id, onClose, onDone }: { id: string | null; onClose: () => void; onDone: (r: Result) => void }) {
  const data = useData();
  const toast = useToast();
  const [choice, setChoice] = useState<"REASSIGN" | "REBOOK">("REASSIGN");
  const im = id && data.leaves.some((l) => l.id === id) ? E.leaveImpact(data, id) : null;
  const first = im?.staffName.split(" ")[0] ?? "";
  const approve = () => {
    try {
      const r = commit((d) => E.approveLeave(d, { id: id!, bookings: choice }));
      onDone(r);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't approve it", "error");
    }
  };
  return (
    <GlassSheet open={!!id} onClose={onClose} label="Approve leave">
      {im ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
          <GT size={21} w="heavy">
            Approve {first}'s leave?
          </GT>
          <GT size={13} c={glass.soft}>
            {range(im.leave)} · {TYPE[im.leave.type]} · {days(im.workingDays)}.{im.bookings.length ? ` ${first} has ${im.bookings.length} booking${im.bookings.length === 1 ? "" : "s"} then:` : ""}
          </GT>
          {im.bookings.length ? (
            <>
              <GlassCard style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
                {im.bookings.map((b, i) => (
                  <View key={b.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
                    <GT size={13} w="heavy" style={{ width: 74 }}>
                      {C.shortDay(b.day).slice(0, 6)} {C.clock(b.time).time}
                    </GT>
                    <GT size={13} c={glass.soft} style={{ flex: 1 }} numberOfLines={1}>
                      {b.customerName} · {b.serviceNames.join(" + ")}
                    </GT>
                  </View>
                ))}
              </GlassCard>
              {(
                [
                  ["REASSIGN", "Give them to a free stylist", "Each booking goes to a stylist who is free at that time. If nobody is, that customer is asked to rebook. You'll get a WhatsApp message ready for each customer."],
                  ["REBOOK", "Ask the customers to rebook", "The bookings are cancelled and each customer gets a WhatsApp asking for a new day and time."],
                ] as const
              ).map(([k, t, d]) => (
                <Pressable key={k} onPress={() => setChoice(k)} accessibilityRole="radio" accessibilityState={{ selected: choice === k }} style={{ flexDirection: "row", gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: choice === k ? glass.gold : glass.line, backgroundColor: choice === k ? "rgba(228,166,123,0.12)" : "rgba(255,244,236,0.05)" }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 5, borderColor: choice === k ? glass.gold : "rgba(255,244,236,0.25)", marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <GT size={14} w="bold">
                      {t}
                    </GT>
                    <GT size={12} c={glass.soft}>
                      {d}
                    </GT>
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}
          <GoldButton label="Approve leave" onPress={approve} />
          <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
            {first} is told in the app, their calendar and attendance show the leave, and nobody can book them those days.
          </GT>
        </ScrollView>
      ) : null}
    </GlassSheet>
  );
}

function DeclineSheet({ id, onClose, onDone }: { id: string | null; onClose: () => void; onDone: () => void }) {
  const data = useData();
  const toast = useToast();
  const [chip, setChip] = useState<string | null>(null);
  const [text, setText] = useState("");
  const l = id ? data.leaves.find((x) => x.id === id) : null;
  const name = l ? (data.staff.find((s) => s.id === l.staffId)?.name.split(" ")[0] ?? "") : "";
  const reason = [chip && chip !== "Other" ? chip : null, text.trim() || null].filter(Boolean).join(". ");
  const decline = () => {
    try {
      commit((d) => E.declineLeave(d, { id: id!, reason }));
      setChip(null);
      setText("");
      onDone();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't decline it", "error");
    }
  };
  return (
    <GlassSheet open={!!id} onClose={onClose} label="Decline leave">
      {l ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
          <GT size={21} w="heavy">
            Decline {name}'s leave?
          </GT>
          <GT size={13} c={glass.soft}>
            {range(l)} · {TYPE[l.type]}. {name} will see your reason.
          </GT>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {REASONS.map((r) => (
              <Pressable key={r} onPress={() => setChip((c) => (c === r ? null : r))} accessibilityRole="radio" accessibilityState={{ selected: chip === r }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: chip === r ? glass.gold : glass.card, borderWidth: 1, borderColor: chip === r ? glass.gold : glass.line }}>
                <GT size={13} w="bold" c={chip === r ? glass.ink : glass.soft}>
                  {r}
                </GT>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            maxLength={200}
            placeholder="e.g. Can you take Friday instead?"
            placeholderTextColor={glass.faint}
            accessibilityLabel="Reason"
            style={{ minHeight: 76, fontFamily: urbanist.medium, fontSize: 14.5, color: glass.cream, backgroundColor: "rgba(26,18,16,0.55)", borderWidth: 1, borderColor: glass.line, borderRadius: 14, padding: 12, textAlignVertical: "top" }}
          />
          <GoldButton label={`Decline and tell ${name}`} style={{ backgroundColor: "#F08C6A" }} disabled={!reason} onPress={decline} />
          <GhostButton label="Back" onPress={onClose} />
        </View>
      ) : null}
    </GlassSheet>
  );
}

/** After approving: one WhatsApp per affected customer, ready to send. */
function TellCustomers({ result, onClose }: { result: Result | null; onClose: () => void }) {
  const [sent, setSent] = useState<Set<string>>(new Set());
  const all = result ? [...result.moved, ...result.cancelled] : [];
  return (
    <GlassSheet open={!!result && all.length > 0} onClose={() => (setSent(new Set()), onClose())} label="Tell the customers">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 10 }}>
        <GT size={21} w="heavy">
          Tell the customers
        </GT>
        <GT size={13} c={glass.soft}>
          {result?.moved.length ? `${result.moved.length} moved to another stylist. ` : ""}
          {result?.cancelled.length ? `${result.cancelled.length} need to rebook. ` : ""}Send each one their message.
        </GT>
        {all.map((a) => (
          <GlassCard key={a.appointmentId} style={{ padding: 12, gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <GT size={14.5} w="bold">
                  {a.customerName}
                </GT>
                <GT size={12} c={glass.soft}>
                  {C.shortDay(a.day)} · {C.clock(a.time).time} {C.clock(a.time).ampm} · {a.toStylist ? `now with ${a.toStylist.split(" ")[0]}` : "to rebook"}
                </GT>
              </View>
              {sent.has(a.appointmentId) ? (
                <GT size={12.5} w="heavy" c={glass.ok}>
                  Sent ✓
                </GT>
              ) : (
                <Pressable
                  onPress={() => {
                    Linking.openURL(E.whatsappLink(a.phone, a.message)).catch(() => {});
                    setSent((s) => new Set(s).add(a.appointmentId));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Send WhatsApp to ${a.customerName}`}
                  style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 }}
                >
                  <GT size={13} w="heavy" c={glass.ink}>
                    WhatsApp
                  </GT>
                </Pressable>
              )}
            </View>
            <GT size={12} c={glass.faint}>
              {a.message}
            </GT>
          </GlassCard>
        ))}
        <GhostButton label="Done" onPress={() => (setSent(new Set()), onClose())} />
      </ScrollView>
    </GlassSheet>
  );
}
