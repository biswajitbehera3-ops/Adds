/**
 * Owner Customers tab extras (BUILD-SPEC 6.7): the ⭐ Top spenders ranking, and a single bill
 * with the owner's Cancel bill (6.6 moved here). Staff can open a bill but only read it; their
 * own 2-minute undo stays on the receipt.
 */
import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { easeOut, GlassCard, GlassScreen, GlassSheet, GlassSwitch, GT, SectionLabel } from "../../components/glass";
import { Press } from "../../components/Press";
import { useToast } from "../../components/Toast";
import * as C from "../../domain/calendar";
import { billOf, topSpenders, type SpendPeriod } from "../../domain/customers";
import * as E from "../../domain/engine";
import { UserError } from "../../domain/errors";
import { istDate } from "../../domain/rules";
import { commit, useData, useSession } from "../../domain/store";
import { inr } from "../../format";
import { useNav } from "../../nav/Navigator";
import { glass, urbanist } from "../../theme/tokens";
import { istTime } from "../Attendance";

const PERIODS: { key: SpendPeriod; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "year", label: "This year" },
  { key: "3m", label: "Last 3 months" },
];
const AVATAR = ["#E4A67B", "#F3E6D8", "#B98E78", "#D9B79E", "#C99A7E"];
const MEDAL = ["#F5C9A0", "#E8E2DA", "#C9946E"];
const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function TopSpenders() {
  const nav = useNav();
  const data = useData();
  const reduced = useReducedMotion();
  const [take, setTake] = useState<"20" | "30">("20");
  const [period, setPeriod] = useState<SpendPeriod>("all");
  const t = useMemo(() => topSpenders(data, { take: Number(take), period }), [data, take, period]);
  const max = t.rows[0]?.spent ?? 1;

  return (
    <GlassScreen title="⭐ Top spenders" back="Customers" onBack={nav.pop}>
      <GlassSwitch
        options={[
          { key: "20", label: "Top 20" },
          { key: "30", label: "Top 30" },
        ]}
        value={take}
        onChange={setTake}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {PERIODS.map((p) => {
          const on = p.key === period;
          return (
            <Pressable key={p.key} onPress={() => setPeriod(p.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: on ? "rgba(228,166,123,0.18)" : glass.card, borderWidth: 1, borderColor: on ? "rgba(228,166,123,0.7)" : glass.line }}>
              <GT size={12.5} w="bold" c={on ? glass.cream : glass.soft}>
                {p.label}
              </GT>
            </Pressable>
          );
        })}
      </View>
      <View style={{ padding: 16, borderRadius: 22, gap: 8, backgroundColor: "rgba(228,166,123,0.18)", borderWidth: 1, borderColor: "rgba(228,166,123,0.5)" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <GT size={11.5} w="heavy" c={glass.gold2} style={{ letterSpacing: 1.2, textTransform: "uppercase" }}>
            Top {take} spent
          </GT>
          <GT size={12.5} c={glass.soft}>
            {Math.round(t.share * 100)}% of all earnings
          </GT>
        </View>
        <GT size={26} w="heavy" style={{ fontVariant: ["tabular-nums"], lineHeight: 32 }}>
          {inr(t.total)}
        </GT>
        <Bar value={t.share} height={8} track="rgba(255,244,236,0.12)" />
      </View>
      {t.rows.length ? (
        <GlassCard style={{ overflow: "hidden" }}>
          {t.rows.map((r, i) => (
            <Animated.View key={`${period}-${take}-${r.id}`} entering={reduced ? undefined : FadeInDown.duration(320).delay(Math.min(i, 12) * 35).easing(easeOut)}>
              <Press
                onPress={() => nav.push({ name: "profile", id: r.id })}
                accessibilityLabel={`Number ${i + 1}, ${r.name}, spent ${inr(r.spent)}, ${r.visits} visits. Open profile`}
                scaleTo={0.985}
                style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}
              >
                <GT size={14.5} w="heavy" c={MEDAL[i] ?? glass.soft} style={{ width: 24, textAlign: "center", fontVariant: ["tabular-nums"] }}>
                  {i + 1}
                </GT>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: AVATAR[i % AVATAR.length], alignItems: "center", justifyContent: "center" }}>
                  <GT size={12} w="heavy" c={glass.ink}>
                    {initialsOf(r.name)}
                  </GT>
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <GT size={14.5} w="bold" numberOfLines={1}>
                    {r.name}
                  </GT>
                  <GT size={11.5} c={glass.soft} numberOfLines={1}>
                    {r.visits} visit{r.visits === 1 ? "" : "s"}
                    {r.mainStylist ? ` · mostly ${r.mainStylist.split(" ")[0]}` : ""}
                  </GT>
                  <Bar value={r.spent / max} height={4} track="rgba(255,244,236,0.08)" delay={Math.min(i, 12) * 35} />
                </View>
                <GT size={14.5} w="heavy" style={{ fontVariant: ["tabular-nums"] }}>
                  {inr(r.spent)}
                </GT>
              </Press>
            </Animated.View>
          ))}
        </GlassCard>
      ) : (
        <GT size={14} c={glass.soft}>
          No paid visits in this period yet.
        </GT>
      )}
    </GlassScreen>
  );
}

/** A thin gold bar that grows to its value. */
function Bar({ value, height, track, delay = 0 }: { value: number; height: number; track: string; delay?: number }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? value : 0);
  useEffect(() => {
    p.value = reduced ? value : withDelay(120 + delay, withTiming(value, { duration: 600, easing: easeOut }));
  }, [value, reduced, delay, p]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, p.value)) * 100}%` }));
  return (
    <View style={{ height, borderRadius: 999, backgroundColor: track, overflow: "hidden", marginTop: 3 }}>
      <Animated.View style={[{ height: "100%", borderRadius: 999, backgroundColor: glass.gold }, fill]} />
    </View>
  );
}

// ── A bill ───────────────────────────────────────────────────────────────────

const METHOD: Record<string, string> = { CASH: "cash", UPI: "UPI", CARD: "card" };
const REASONS = ["Wrong customer", "Wrong service", "Entered twice", "Customer didn't pay", "Other"];
const PAPER = { bg: "#F6EFE6", ink: "#2A1A12", soft: "#6B5448", rule: "#B9A596" };
const RED = "#F08C6A";

export function Bill({ visitId }: { visitId: string }) {
  const nav = useNav();
  const data = useData();
  const session = useSession();
  const reduced = useReducedMotion();
  const [asking, setAsking] = useState(false);
  const b = useMemo(() => billOf(data, visitId), [data, visitId]);
  const owner = session?.role === "owner";
  if (!b) {
    return (
      <GlassScreen title="Bill" back="Back" onBack={nav.pop}>
        <GT size={14} c={glass.soft}>
          This bill isn't on this phone any more.
        </GT>
      </GlassScreen>
    );
  }
  const v = b.visit;
  const voided = v.status === "VOID";
  const open = v.status === "OPEN";
  const when = v.paidAt ?? v.createdAt;
  const strike = voided ? ({ textDecorationLine: "line-through" } as const) : null;
  const payLine = open
    ? `In the chair since ${istTime(v.createdAt)} · not paid yet`
    : [v.walletPaid ? `${inr(v.walletPaid)} from wallet` : null, v.directPaid ? `${inr(v.directPaid)} ${METHOD[v.paymentMethod ?? "CASH"]}` : null].filter(Boolean).join(" + ") || "Paid";

  return (
    <GlassScreen
      title={`Bill #${b.number}`}
      back={b.customer?.name ?? "Back"}
      onBack={nav.pop}
      after={owner && v.status === "PAID" ? <CancelSheet open={asking} onClose={() => setAsking(false)} visitId={v.id} total={v.total} stylist={b.stylist?.name.split(" ")[0] ?? "the stylist"} /> : null}
    >
      <Animated.View entering={reduced ? undefined : FadeInDown.duration(380).easing(easeOut)} style={{ backgroundColor: PAPER.bg, borderRadius: 22, padding: 18, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <GT size={12.5} c={PAPER.soft}>
            {C.shortDay(istDate(when))} · {istTime(when)}
          </GT>
          {voided ? (
            <View style={{ borderWidth: 2, borderColor: "#C0533A", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1, transform: [{ rotate: "-6deg" }] }}>
              <GT size={12.5} w="heavy" c="#C0533A" style={{ letterSpacing: 1.5 }}>
                CANCELLED
              </GT>
            </View>
          ) : (
            <GT size={12.5} c={PAPER.soft}>
              {b.stylist?.name.split(" ")[0] ?? ""}
            </GT>
          )}
        </View>
        {b.customer ? (
          <GT size={15} w="heavy" c={PAPER.ink}>
            {b.customer.name}
          </GT>
        ) : (
          <GT size={13} c={PAPER.soft}>
            Customer deleted
          </GT>
        )}
        {b.items.map((it, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <GT size={14} c={PAPER.ink} style={strike}>
              {it.name}
              {it.addOn ? " (add-on)" : ""}
            </GT>
            <GT size={14} c={PAPER.ink} style={[{ fontVariant: ["tabular-nums"] }, strike]}>
              {inr(it.price)}
            </GT>
          </View>
        ))}
        <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderStyle: "dashed", borderColor: PAPER.rule, paddingTop: 9, marginTop: 4 }}>
          <GT size={17} w="heavy" c={PAPER.ink}>
            Total
          </GT>
          <GT size={17} w="heavy" c={PAPER.ink} style={[{ fontVariant: ["tabular-nums"] }, strike]}>
            {inr(v.total)}
          </GT>
        </View>
        <GT size={12} c={PAPER.soft}>
          {payLine}
          {!open && b.stylist ? ` · entered by ${b.stylist.name.split(" ")[0]} at ${istTime(when)}` : ""}
        </GT>
        {b.reward ? (
          <GT size={12} c={PAPER.soft}>
            Referral reward {inr(b.reward)} paid to {b.rewardTo ?? "the referrer"}
            {voided ? " (taken back)" : ""}
          </GT>
        ) : null}
      </Animated.View>

      {voided ? (
        <GlassCard style={{ padding: 14, gap: 4 }}>
          <GT size={11.5} w="heavy" c={RED} style={{ letterSpacing: 1.2, textTransform: "uppercase" }}>
            Cancelled{v.voidedAt ? ` · ${C.shortDay(istDate(v.voidedAt))}, ${istTime(v.voidedAt)}` : ""}
          </GT>
          <GT size={14}>{v.voidReason ?? ""}</GT>
          {v.voidedBy ? (
            <GT size={12.5} c={glass.soft}>
              {v.voidedBy === "owner" ? "Cancelled by the owner" : `Undone by ${data.staff.find((x) => x.id === v.voidedBy)?.name ?? "staff"}`}
            </GT>
          ) : null}
          <GT size={12.5} c={glass.soft}>
            Not counted in earnings. Any wallet money used went back to the wallet.
          </GT>
        </GlassCard>
      ) : null}

      {v.status === "PAID" ? (
        owner ? (
          <Press onPress={() => setAsking(true)} accessibilityLabel="Cancel this bill" scaleTo={0.98} style={{ paddingVertical: 13, borderRadius: 999, alignItems: "center", borderWidth: 1.3, borderColor: RED, backgroundColor: "rgba(240,140,106,0.1)" }}>
            <GT size={15} w="heavy" c={RED}>
              Cancel bill
            </GT>
          </Press>
        ) : (
          <GT size={12.5} c={glass.soft}>
            Wrong bill? Ask the owner: only the owner can cancel a bill after the 2-minute undo.
          </GT>
        )
      ) : null}
    </GlassScreen>
  );
}

function CancelSheet({ open, onClose, visitId, total, stylist }: { open: boolean; onClose: () => void; visitId: string; total: number; stylist: string }) {
  const toast = useToast();
  const [reason, setReason] = useState(REASONS[0]);
  const [other, setOther] = useState("");
  const text = reason === "Other" ? other.trim() : reason;
  const cancel = () => {
    try {
      commit((d) => E.voidVisit(d, { visitId, by: "owner", reason: text }));
      toast("Bill cancelled");
      onClose();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't cancel the bill.", "error");
    }
  };
  const effects = [
    `${inr(total)} is taken out of today's earnings and ${stylist}'s earnings`,
    "Any wallet money used on this bill goes back to the wallet",
    "A referral reward from this visit is taken back",
    "The bill stays in the history, marked cancelled with the reason",
  ];
  return (
    <GlassSheet open={open} onClose={onClose} label="Cancel this bill">
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}>
        <GT size={22} w="heavy">
          Cancel this bill?
        </GT>
        <SectionLabel>Reason</SectionLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {REASONS.map((r) => {
            const on = r === reason;
            return (
              <Pressable key={r} onPress={() => setReason(r)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: on ? glass.gold : "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: on ? glass.gold : glass.line }}>
                <GT size={13} w="bold" c={on ? glass.ink : glass.cream}>
                  {r}
                </GT>
              </Pressable>
            );
          })}
        </View>
        {reason === "Other" ? (
          <TextInput
            value={other}
            onChangeText={setOther}
            placeholder="What went wrong?"
            placeholderTextColor={glass.faint}
            accessibilityLabel="Reason"
            selectionColor={glass.gold}
            style={{ minHeight: 46, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line, fontFamily: urbanist.medium, fontSize: 15, color: glass.cream }}
          />
        ) : null}
        <SectionLabel>What happens</SectionLabel>
        <View style={{ gap: 6 }}>
          {effects.map((e) => (
            <View key={e} style={{ flexDirection: "row", gap: 8 }}>
              <GT size={12} c={glass.gold2}>
                ●
              </GT>
              <GT size={13} c={glass.soft} style={{ flex: 1 }}>
                {e}
              </GT>
            </View>
          ))}
        </View>
        <Press onPress={cancel} disabled={!text} accessibilityState={{ disabled: !text }} accessibilityLabel="Cancel bill" scaleTo={0.97} style={{ marginTop: 6, paddingVertical: 14, borderRadius: 999, alignItems: "center", backgroundColor: RED, opacity: text ? 1 : 0.4 }}>
          <GT size={16} w="heavy" c="#2a1210">
            Cancel bill
          </GT>
        </Press>
      </View>
    </GlassSheet>
  );
}
