/**
 * Reminders, inside Customers (BUILD-SPEC 4.12), brown glass. The ladder for each customer who
 * is due back: WhatsApp message 1 → message 2 a month later → a call from the stylist who
 * served them last → then nothing until they visit. Each step is done once for the whole
 * salon; a done step waits in "Waiting" until the next one opens. Tapping a row shows the
 * message, which can be edited before it opens in WhatsApp.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, LinearTransition, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard, GoldButton, GT } from "../components/glass";
import { useToast } from "../components/Toast";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { commit, useData } from "../domain/store";
import { formatPhone, relativeDays, shortDate } from "../format";
import { useNav } from "../nav/Navigator";
import { glass, urbanist } from "../theme/tokens";
import { useCurrentStaff } from "./Attendance";

type R = ReturnType<typeof E.overdueReminders>[number];
const AVATAR = ["#E4A67B", "#F3E6D8", "#B98E78", "#D9B79E", "#C99A7E"];

export function Reminders() {
  const data = useData();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const me = useCurrentStaff();
  const all = useMemo(() => E.overdueReminders(data), [data]);
  const [filter, setFilter] = useState<"todo" | "wait">("todo");
  const [open, setOpen] = useState<string | null>(null);
  const mine = (r: R) => E.reminderIsMine(r, me?.id ?? null);
  const list = all.filter((r) => (filter === "todo" ? mine(r) : !mine(r)));
  const todo = all.filter(mine).length;

  return (
    <View style={{ flex: 1, backgroundColor: glass.deep }}>
      <LinearGradient colors={[glass.glow, glass.mid, glass.deep]} locations={[0, 0.42, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: insets.bottom + 48, gap: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={nav.pop} accessibilityRole="button" accessibilityLabel="Back to customers" hitSlop={10}>
          <GT size={13.5} w="bold" c={glass.gold2}>
            ‹ Customers
          </GT>
        </Pressable>
        <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34 }}>
          Reminders
        </GT>
        <View style={{ flexDirection: "row", gap: 8 }} accessibilityRole="tablist">
          {(
            [
              ["todo", `To do · ${todo}`],
              ["wait", `Waiting · ${all.length - todo}`],
            ] as const
          ).map(([k, label]) => {
            const on = k === filter;
            return (
              <Pressable key={k} onPress={() => (setFilter(k), setOpen(null))} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? glass.gold : glass.card, borderWidth: 1, borderColor: on ? glass.gold : glass.line }}>
                <GT size={13.5} w="bold" c={on ? glass.ink : glass.soft}>
                  {label}
                </GT>
              </Pressable>
            );
          })}
        </View>

        {list.length ? (
          <GlassCard style={{ overflow: "hidden" }}>
            {list.map((r, i) => (
              <Animated.View key={r.key} layout={reduced ? undefined : LinearTransition.duration(260)} entering={reduced || i > 8 ? undefined : FadeInDown.duration(280).delay(i * 30)}>
                <Row r={r} index={i} meId={me?.id ?? null} meName={me?.name ?? null} open={open === r.key} onToggle={() => setOpen((k) => (k === r.key ? null : r.key))} />
              </Animated.View>
            ))}
          </GlassCard>
        ) : (
          <View style={{ paddingVertical: 28, gap: 6 }}>
            <GT size={18} w="heavy">
              {filter === "todo" ? "Nothing to do" : "Nothing waiting"}
            </GT>
            <GT size={14} c={glass.soft}>
              {filter === "todo" ? "Names appear here as customers pass their service cycle." : "Customers already messaged, and calls for other stylists, wait here for their next step."}
            </GT>
          </View>
        )}

        <GT size={12} c={glass.faint} style={{ textAlign: "center", lineHeight: 17 }}>
          Message 1 when due, message 2 a month later, then a call from whoever served them last. Each step is done once for the whole salon; after the call, no more reminders until they visit. Only customers who said yes to WhatsApp messages are listed.
        </GT>
      </ScrollView>
    </View>
  );
}

function Row({ r, index, meId, meName, open, onToggle }: { r: R; index: number; meId: string | null; meName: string | null; open: boolean; onToggle: () => void }) {
  const toast = useToast();
  const [msg, setMsg] = useState(r.message);
  const who = (name: string | null) => (name && name === meName ? "you" : (name?.split(" ")[0] ?? "their stylist"));
  const isCall = r.step === "call";
  const myCall = isCall && (!meId || !r.callerId || r.callerId === meId);
  const locked = !!r.lockedUntil;
  const first = r.name.split(" ")[0];

  const send = async () => {
    try {
      commit((d) => E.logReminder(d, { customerId: r.customerId, serviceId: r.serviceId, message: msg, status: "OPENED", by: meId }));
      await Linking.openURL(E.whatsappLink(r.phone, msg.trim()));
      toast(`Opened WhatsApp for ${first}`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't open WhatsApp on this device.", "error");
    }
  };
  const call = async () => {
    try {
      commit((d) => E.logReminderCall(d, { customerId: r.customerId, serviceId: r.serviceId, by: meId }));
      await Linking.openURL(`tel:${r.phone}`);
      toast(`Calling ${first}. No more reminders until they visit.`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't start the call on this device.", "error");
    }
  };

  const sub =
    r.step === "message1"
      ? `Message 1 · due ${r.daysOverdue ? `${r.daysOverdue} days ago` : "today"} · last ${shortDate(r.lastVisit)}`
      : r.step === "message2"
        ? locked
          ? `Message 1 sent by ${who(r.remindedBy)} ${relativeDays(r.remindedAt!)}`
          : `Message 2 · 1st sent ${shortDate(r.remindedAt!)}, no visit`
        : myCall
          ? `Call · you served ${first} last · 2 messages, no visit`
          : `Call · ${who(r.callerName)} served them last`;

  const action = locked ? (
    <View style={{ alignItems: "flex-end" }}>
      <GT size={12.5} w="heavy" c={glass.ok}>
        Sent ✓
      </GT>
      <GT size={11} w="semibold" c={glass.faint}>
        {isCall ? "call" : "2nd"} from {shortDate(r.lockedUntil!)}
      </GT>
    </View>
  ) : isCall && !myCall ? (
    <GT size={12.5} w="bold" c={glass.faint} style={{ textAlign: "right" }}>
      {who(r.callerName)}
      {"\n"}calls
    </GT>
  ) : (
    <View style={{ backgroundColor: isCall ? glass.ok : glass.gold, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 }}>
      <GT size={13} w="heavy" c={glass.ink}>
        {isCall ? "Call" : r.step === "message2" ? "Send 2nd" : "Send"}
      </GT>
    </View>
  );

  return (
    <View style={{ borderTopWidth: index ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${r.name}, ${r.serviceName}. ${sub}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: AVATAR[index % AVATAR.length], alignItems: "center", justifyContent: "center" }}>
          <GT size={13.5} w="heavy" c={glass.ink}>
            {r.name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
          </GT>
        </View>
        <View style={{ flex: 1 }}>
          <GT size={15.5} w="bold" numberOfLines={1}>
            {r.name}
          </GT>
          <GT size={12.5} c={glass.soft} numberOfLines={2}>
            {r.serviceName} · {sub}
          </GT>
        </View>
        {action}
      </Pressable>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
          {isCall ? (
            <GT size={13} c={glass.soft}>
              Two WhatsApp messages and no visit, so no more messages. {myCall ? `You served ${first} last: give them a call on ${formatPhone(r.phone)}.` : `${who(r.callerName)} served them last and makes the call.`} After the call they won't be reminded again until they come in.
            </GT>
          ) : (
            <TextInput
              value={msg}
              onChangeText={setMsg}
              multiline
              editable={!locked}
              accessibilityLabel="Reminder message"
              selectionColor={glass.gold}
              style={{ minHeight: 96, padding: 12, borderRadius: 14, backgroundColor: "rgba(26,18,16,0.5)", borderWidth: 1, borderColor: glass.line, fontFamily: urbanist.medium, fontSize: 14.5, lineHeight: 20, color: glass.cream, textAlignVertical: "top" }}
            />
          )}
          {locked ? (
            <GT size={12.5} c={glass.faint}>
              Done by {who(r.remindedBy)} {relativeDays(r.remindedAt!)}. The next step opens on {shortDate(r.lockedUntil!)}.
            </GT>
          ) : isCall ? (
            myCall ? <GoldButton label={`Call ${first}`} onPress={call} style={{ backgroundColor: glass.ok }} /> : null
          ) : (
            <GoldButton label={r.step === "message2" ? "Send message 2 on WhatsApp" : "Send on WhatsApp"} onPress={send} disabled={!msg.trim()} />
          )}
        </Animated.View>
      ) : null}
    </View>
  );
}
