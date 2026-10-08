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
  const list = all.filter((r) => (filter === "todo" ? !r.remindedAt : !!r.remindedAt));
  const reduced = useReducedMotion();

  return (
    <Screen title="Reminders">
      <T v="body" c={color.inkMuted} style={{ marginBottom: space.lg }}>
        Each service has its own cycle — a beard trim is due sooner than a colour. These customers are past theirs.
      </T>
      <Segmented
        label="Show"
        value={filter}
        onChange={(k) => (setFilter(k), setOpen(null))}
        options={[
          { key: "todo", label: `To remind (${all.filter((r) => !r.remindedAt).length})` },
          { key: "done", label: `Reminded (${all.filter((r) => r.remindedAt).length})` },
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
            <T v="heading">{filter === "todo" ? "Everyone's been reminded" : "No reminders sent yet"}</T>
            <T v="body" c={color.inkMuted}>
              {filter === "todo" ? "New names appear here as customers pass their service cycle." : "Reminders you send from the other tab show up here."}
            </T>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function ReminderCard({ r, open, onToggle }: { r: R; open: boolean; onToggle: () => void }) {
  const toast = useToast();
  const [msg, setMsg] = useState(r.message);
  const send = async () => {
    try {
      commit((d) => E.logReminder(d, { customerId: r.customerId, serviceId: r.serviceId, message: msg, status: "OPENED" }));
      await Linking.openURL(E.whatsappLink(r.phone, msg.trim()));
      toast(`Opened WhatsApp for ${r.name.split(" ")[0]}`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't open WhatsApp on this device.", "error");
    }
  };
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
      {r.remindedAt ? (
        <T v="small" c={color.positive}>
          Reminded {relativeDays(r.remindedAt)} ({shortDate(r.remindedAt)})
        </T>
      ) : null}
      {open ? (
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
          <Button label={r.remindedAt ? "Send again on WhatsApp" : "Send on WhatsApp"} icon="chat" onPress={send} disabled={!msg.trim()} />
        </Animated.View>
      ) : null}
    </LabelFrame>
  );
}
