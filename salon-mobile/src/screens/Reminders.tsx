import { useMemo, useState } from "react";
import { Linking, TextInput, View } from "react-native";
import Animated, { FadeIn, LinearTransition, useReducedMotion } from "react-native-reanimated";
import { Button } from "../components/Button";
import { LabelFrame } from "../components/LabelFrame";
import { Press } from "../components/Press";
import { Screen } from "../components/Screen";
import { Segmented } from "../components/Segmented";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { commit, useData } from "../domain/store";
import { formatPhone, relativeDays, shortDate } from "../format";
import { useCurrentStaff } from "./Attendance";
import { color, font, radius, space } from "../theme/tokens";

type R = ReturnType<typeof E.overdueReminders>[number];

/**
 * Customers overdue per service. One tap opens WhatsApp with the message
 * already written — staff press send there. Each hand-off is logged.
 */
export function Reminders() {
  const data = useData();
  const all = useMemo(() => E.overdueReminders(data), [data]);
  const [filter, setFilter] = useState<"todo" | "done">("todo");
  const [open, setOpen] = useState<string | null>(null);
  const me = useCurrentStaff();
  // Done steps are locked for everyone until the next one is due; calls belong to the last stylist.
  const mine = (r: R) => E.reminderIsMine(r, me?.id ?? null);
  const list = all.filter((r) => (filter === "todo" ? mine(r) : !mine(r)));
  const reduced = useReducedMotion();

  return (
    <Screen title="Reminders">
      <T v="body" c={color.inkMuted} style={{ marginBottom: space.lg }}>
        Message 1 when they're due, message 2 a month later, then a call from whoever served them last. After the call we stop until they visit.
      </T>
      <Segmented
        label="Show"
        value={filter}
        onChange={(k) => (setFilter(k), setOpen(null))}
        options={[
          { key: "todo", label: `To do (${all.filter(mine).length})` },
          { key: "done", label: `Waiting (${all.filter((r) => !mine(r)).length})` },
        ]}
      />
      <View style={{ gap: space.md, marginTop: space.lg }}>
        {list.map((r) => (
          <Animated.View key={r.key} layout={reduced ? undefined : LinearTransition.duration(280)}>
            <ReminderCard r={r} open={open === r.key} onToggle={() => setOpen((k) => (k === r.key ? null : r.key))} />
          </Animated.View>
        ))}
        {list.length === 0 ? (
          <View style={{ paddingVertical: space.xxl, gap: space.xs }}>
            <T v="heading">{filter === "todo" ? "Nothing to do" : "Nothing waiting"}</T>
            <T v="body" c={color.inkMuted}>
              {filter === "todo" ? "New names appear here as customers pass their service cycle." : "Customers already messaged, and calls for other stylists, wait here for their next step."}
            </T>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function ReminderCard({ r, open, onToggle }: { r: R; open: boolean; onToggle: () => void }) {
  const toast = useToast();
  const me = useCurrentStaff();
  const [msg, setMsg] = useState(r.message);
  const send = async () => {
    try {
      commit((d) => E.logReminder(d, { customerId: r.customerId, serviceId: r.serviceId, message: msg, status: "OPENED", by: me?.id ?? null }));
      await Linking.openURL(E.whatsappLink(r.phone, msg.trim()));
      toast(`Opened WhatsApp for ${r.name.split(" ")[0]}`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't open WhatsApp on this device.", "error");
    }
  };
  const call = async () => {
    try {
      commit((d) => E.logReminderCall(d, { customerId: r.customerId, serviceId: r.serviceId, by: me?.id ?? null }));
      await Linking.openURL(`tel:${r.phone}`);
      toast(`Calling ${r.name.split(" ")[0]}. No more reminders until they visit.`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't start the call on this device.", "error");
    }
  };
  const isCall = r.step === "call";
  const myCall = isCall && (!me || !r.callerId || r.callerId === me.id);
  const who = (name: string | null) => (name === me?.name ? "you" : (name?.split(" ")[0] ?? "their stylist"));
  const stepLabel = r.step === "message1" ? "Message 1" : r.step === "message2" ? "Message 2" : `Call · ${who(r.callerName)} served them last`;
  return (
    <LabelFrame innerStyle={{ padding: space.lg, gap: space.md }}>
      <Press onPress={onToggle} scaleTo={0.99} accessibilityLabel={`${r.name}, ${r.serviceName}, ${r.daysOverdue} days overdue`} accessibilityState={{ expanded: open }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ flex: 1 }}>
            <T v="heading" numberOfLines={1}>
              {r.name}
            </T>
            <T v="small" c={color.inkMuted}>
              {r.serviceName} · last {relativeDays(r.lastVisit)} · {formatPhone(r.phone)}
            </T>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <T style={{ fontFamily: font.display, fontSize: 22, lineHeight: 28 }} c={color.seal}>
              {r.daysOverdue}d
            </T>
            <T v="small" c={color.inkMuted}>
              overdue
            </T>
          </View>
        </View>
      </Press>
      <T v="label" c={isCall ? color.seal : color.inkMuted}>
        Next: {stepLabel}
      </T>
      {r.remindedAt ? (
        <T v="small" c={color.positive}>
          Last message by {who(r.remindedBy)} {relativeDays(r.remindedAt)} ({shortDate(r.remindedAt)})
          {r.lockedUntil ? ` · next step from ${shortDate(r.lockedUntil)}` : ""}
        </T>
      ) : null}
      {open && isCall ? (
        <Animated.View entering={FadeIn.duration(200)} style={{ gap: space.md }}>
          <T v="body" c={color.inkMuted}>
            Two WhatsApp messages and no visit, so no more messages. {myCall ? "You served them last: give them a call." : `${who(r.callerName)} served them last and makes the call.`} After the call they won't be reminded again until they come in.
          </T>
          {myCall ? <Button label={r.lockedUntil ? `Call from ${shortDate(r.lockedUntil)}` : `Call ${r.name.split(" ")[0]}`} icon="chat" onPress={call} disabled={!!r.lockedUntil} /> : null}
        </Animated.View>
      ) : null}
      {open && !isCall ? (
        <Animated.View entering={FadeIn.duration(200)} style={{ gap: space.md }}>
          <TextInput
            selectionColor={color.seal}
            cursorColor={color.seal}
            value={msg}
            onChangeText={setMsg}
            multiline
            accessibilityLabel="Reminder message"
            style={{
              minHeight: 104,
              borderWidth: 1.25,
              borderColor: color.ruleSoft,
              borderRadius: radius.control,
              padding: space.md,
              fontFamily: font.regular,
              fontSize: 16,
              lineHeight: 22,
              color: color.ink,
              backgroundColor: color.paperLight,
              textAlignVertical: "top",
            }}
          />
          <Button
            label={r.lockedUntil ? `Message 2 from ${shortDate(r.lockedUntil)}` : r.step === "message2" ? "Send message 2 on WhatsApp" : "Send on WhatsApp"}
            icon="chat"
            onPress={send}
            disabled={!msg.trim() || !!r.lockedUntil}
          />
        </Animated.View>
      ) : null}
    </LabelFrame>
  );
}
