/**
 * The owner's guard rails (MISUSE-CHECKS.md), brown glass:
 * - TodayChecks: the card on the Live tab listing what needs a look today (staff undos,
 *   customers who left without service, bookings nobody closed, unusual bills, "Other"
 *   items, referral bursts, a cash difference), with Count the cash.
 * - ServicesScreen: services and add-ons with prices, editable; stop offering keeps old bills.
 * - CheckRules: the wallet-code amount and the monthly referral limit.
 * - backUp / restoreFrom: the whole salon as a file the owner keeps.
 */
import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { GlassCard, GlassScreen, GlassSheet, GoldButton, GT, SectionLabel, easeOut } from "../../components/glass";
import { useToast } from "../../components/Toast";
import * as K from "../../domain/checks";
import { UserError } from "../../domain/errors";
import * as E from "../../domain/engine";
import { commit, getData, restoreBackup, useData } from "../../domain/store";
import { inr } from "../../format";
import { useNav } from "../../nav/Navigator";
import { pickTextFile, shareTextFile } from "../../platform/share";
import { glass, urbanist } from "../../theme/tokens";

const KIND_TONE: Record<K.CheckItem["kind"], string> = { undo: glass.late, left: glass.late, cash: glass.late, clock: glass.late, attendance: glass.late, booking: glass.gold2, unusual: glass.gold2, other: glass.gold2, referral: glass.gold2 };
const input = { minHeight: 50, borderRadius: 16, paddingHorizontal: 16, fontFamily: urbanist.medium, fontSize: 16, color: glass.cream, backgroundColor: "rgba(26,18,16,0.5)", borderWidth: 1, borderColor: glass.line } as const;

export function TodayChecks({ onCount }: { onCount: (expected: number) => void }) {
  const data = useData();
  const toast = useToast();
  const nav = useNav();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const checks = useMemo(() => K.ownerChecks(data, now), [data, now]);
  return (
    <GlassCard style={{ marginHorizontal: 12, marginTop: 8, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <SectionLabel>Today's checks</SectionLabel>
        <GT size={12.5} w="bold" c={checks.items.length ? glass.late : glass.ok}>
          {checks.items.length ? `${checks.items.length} to look at` : "All clear"}
        </GT>
      </View>
      {checks.items.map((it) => (
        <Pressable
          key={it.id}
          disabled={!it.visitId && it.id !== "k-hold"}
          onPress={() => {
            if (it.visitId) nav.push({ name: "bill", visitId: it.visitId });
            // The owner confirms the phone's date; automatic clean-up runs again (SECURITY-LESSONS 1).
            else if (it.id === "k-hold") (commit((d) => E.confirmClock(d)), toast(`Date confirmed: ${checks.day}. Clean-up runs at the next start.`));
          }}
          accessibilityRole={it.visitId || it.id === "k-hold" ? "button" : "text"}
          style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: KIND_TONE[it.kind] }} />
          <View style={{ flex: 1 }}>
            <GT size={14} w="bold">
              {it.title}
            </GT>
            <GT size={12.5} c={glass.soft}>
              {it.detail}
            </GT>
          </View>
          {it.visitId ? (
            <GT size={14} c={glass.soft}>
              ›
            </GT>
          ) : null}
        </Pressable>
      ))}
      <View style={{ height: 1, backgroundColor: glass.line }} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <GT size={13.5} w="bold">
            Cash in the drawer should be {inr(checks.cash.total)}
          </GT>
          <GT size={12} c={glass.soft}>
            {checks.cash.bills} cash bill{checks.cash.bills === 1 ? "" : "s"} {inr(checks.cash.fromBills)}
            {checks.cash.topUps ? ` + ${checks.cash.topUps} cash top-up${checks.cash.topUps === 1 ? "" : "s"} ${inr(checks.cash.fromTopUps)}` : ""}
            {checks.cash.refunds ? ` − ${checks.cash.refunds} wallet refund${checks.cash.refunds === 1 ? "" : "s"} ${inr(checks.cash.refunded)}` : ""}
            {checks.closing ? ` · counted ${inr(checks.closing.counted)}` : ""}
          </GT>
        </View>
        <Pressable onPress={() => onCount(checks.cash.total)} accessibilityRole="button" style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
          <GT size={13.5} w="heavy" c={glass.ink}>
            {checks.closing ? "Count again" : "Count the cash"}
          </GT>
        </Pressable>
      </View>
    </GlassCard>
  );
}

export function CashCountSheet({ open, onClose, expected }: { open: boolean; onClose: () => void; expected: number }) {
  const toast = useToast();
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) (setCounted(""), setNote(""));
  }, [open]);
  const n = counted ? parseInt(counted, 10) : NaN;
  const diff = Number.isNaN(n) ? 0 : n - expected;
  const save = () => {
    try {
      commit((d) => K.closeDay(d, { counted: n, note }));
      toast(diff === 0 ? "Cash matches. Day closed." : `Saved: ${diff < 0 ? "short" : "over"} by ${inr(Math.abs(diff))}`);
      onClose();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save the count", "error");
    }
  };
  return (
    <GlassSheet open={open} onClose={onClose} label="Count the cash">
      <View style={{ gap: 12, paddingHorizontal: 20, paddingBottom: 20 }}>
        <GT size={20} w="heavy">
          Count the cash
        </GT>
        <GT size={13.5} c={glass.soft}>
          The app expects {inr(expected)} in the drawer from today's cash bills and cash top-ups. Count it and type what's there.
        </GT>
        <TextInput value={counted} onChangeText={(t) => setCounted(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="Cash counted, ₹" placeholderTextColor={glass.faint} accessibilityLabel="Cash counted in rupees" style={input} />
        {counted ? (
          <GT size={14} w="bold" c={diff === 0 ? glass.ok : glass.late}>
            {diff === 0 ? "✓ Matches" : `${diff < 0 ? "Short" : "Over"} by ${inr(Math.abs(diff))}`}
          </GT>
        ) : null}
        {counted && diff !== 0 ? <TextInput value={note} onChangeText={setNote} placeholder="Why? e.g. change given from the drawer" placeholderTextColor={glass.faint} accessibilityLabel="Note" style={input} /> : null}
        <GoldButton label="Save the count" disabled={!counted || (diff !== 0 && !note.trim())} onPress={save} />
      </View>
    </GlassSheet>
  );
}

// ── Services and prices ─────────────────────────────────────────────────────

type Editing = { kind: "service" | "addon"; id?: string; name: string; price: string; minutes: string; cycleDays: string; suggestWith: string[] };

export function ServicesScreen() {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const reduced = useReducedMotion();
  const catalog = K.catalogOf(data);
  const [edit, setEdit] = useState<Editing | null>(null);
  const run = (fn: () => void, ok: string) => {
    try {
      fn();
      toast(ok);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save", "error");
    }
  };
  const row = (x: { id: string; name: string; price: number; active?: boolean }, sub: string, open: () => void, i: number) => (
    <Animated.View key={x.id} entering={reduced ? undefined : FadeInDown.duration(300).delay(i * 30).easing(easeOut)}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)", opacity: x.active === false ? 0.5 : 1 }}>
        <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Edit ${x.name}`} style={{ flex: 1 }}>
          <GT size={15} w="bold">
            {x.name}
          </GT>
          <GT size={12} c={glass.soft}>
            {x.active === false ? "Not offered · old bills keep it" : sub}
          </GT>
        </Pressable>
        <GT size={15} w="heavy" c={glass.gold}>
          {inr(x.price)}
        </GT>
        <Pressable onPress={() => run(() => commit((d) => K.setOffered(d, { id: x.id, offered: x.active === false })), x.active === false ? `${x.name} offered again` : `${x.name} no longer offered`)} accessibilityRole="switch" accessibilityState={{ checked: x.active !== false }} accessibilityLabel={`${x.name} offered`} hitSlop={6}>
          <View style={{ width: 42, height: 26, borderRadius: 13, padding: 3, backgroundColor: x.active !== false ? glass.gold : "rgba(255,244,236,0.18)", alignItems: x.active !== false ? "flex-end" : "flex-start" }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: glass.cream }} />
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
  return (
    <GlassScreen title="Services & prices" back="Live" onBack={nav.pop} after={<EditSheet edit={edit} onClose={() => setEdit(null)} services={catalog.services} />}>
      <GT size={13.5} c={glass.soft}>
        Staff can only bill what's here, at these prices. A new price applies to bills from now on; paid bills keep theirs. Switch a service off to stop offering it.
      </GT>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <SectionLabel>Services</SectionLabel>
        <Pressable onPress={() => setEdit({ kind: "service", name: "", price: "", minutes: "30", cycleDays: "30", suggestWith: [] })} accessibilityRole="button" hitSlop={8}>
          <GT size={13.5} w="bold" c={glass.gold2}>
            + Add service
          </GT>
        </Pressable>
      </View>
      <GlassCard style={{ paddingHorizontal: 14, paddingVertical: 2 }}>
        {catalog.services.map((s, i) => row(s, `${s.minutes} min · due back after ${s.cycleDays} days`, () => setEdit({ kind: "service", id: s.id, name: s.name, price: String(s.price), minutes: String(s.minutes), cycleDays: String(s.cycleDays), suggestWith: [] }), i))}
      </GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <SectionLabel>Add-ons</SectionLabel>
        <Pressable onPress={() => setEdit({ kind: "addon", name: "", price: "", minutes: "", cycleDays: "", suggestWith: [] })} accessibilityRole="button" hitSlop={8}>
          <GT size={13.5} w="bold" c={glass.gold2}>
            + Add add-on
          </GT>
        </Pressable>
      </View>
      <GlassCard style={{ paddingHorizontal: 14, paddingVertical: 2 }}>
        {catalog.addOns.map((a, i) =>
          row(
            a,
            a.suggestWith.length ? `Suggested with ${a.suggestWith.map((id) => catalog.services.find((s) => s.id === id)?.name ?? id).join(", ")}` : "Not suggested automatically",
            () => setEdit({ kind: "addon", id: a.id, name: a.name, price: String(a.price), minutes: "", cycleDays: "", suggestWith: a.suggestWith }),
            i,
          ),
        )}
      </GlassCard>
    </GlassScreen>
  );
}

function EditSheet({ edit, onClose, services }: { edit: Editing | null; onClose: () => void; services: { id: string; name: string }[] }) {
  const toast = useToast();
  const [f, setF] = useState<Editing | null>(edit);
  useEffect(() => {
    if (edit) setF(edit);
  }, [edit]);
  const save = () => {
    if (!f) return;
    try {
      if (f.kind === "service") commit((d) => K.saveService(d, { id: f.id, name: f.name, price: parseInt(f.price, 10), minutes: parseInt(f.minutes, 10), cycleDays: parseInt(f.cycleDays, 10) }));
      else commit((d) => K.saveAddOn(d, { id: f.id, name: f.name, price: parseInt(f.price, 10), suggestWith: f.suggestWith }));
      toast(`${f.name.trim()} saved`);
      onClose();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save", "error");
    }
  };
  const field = (label: string, key: "name" | "price" | "minutes" | "cycleDays", numeric = false) =>
    f ? (
      <View style={{ gap: 5, flex: numeric ? 1 : undefined }}>
        <GT size={12.5} w="semibold" c={glass.soft}>
          {label}
        </GT>
        <TextInput value={f[key]} onChangeText={(t) => setF({ ...f, [key]: numeric ? t.replace(/\D/g, "") : t })} keyboardType={numeric ? "number-pad" : "default"} accessibilityLabel={label} style={input} />
      </View>
    ) : null;
  return (
    <GlassSheet open={!!edit} onClose={onClose} label="Edit">
      {f ? (
        <View style={{ gap: 12, paddingHorizontal: 20, paddingBottom: 20 }}>
          <GT size={20} w="heavy">
            {f.id ? `Edit ${f.kind === "service" ? "service" : "add-on"}` : f.kind === "service" ? "New service" : "New add-on"}
          </GT>
          {field("Name", "name")}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {field("Price, ₹", "price", true)}
            {f.kind === "service" ? field("Minutes", "minutes", true) : null}
            {f.kind === "service" ? field("Due back, days", "cycleDays", true) : null}
          </View>
          {f.kind === "addon" ? (
            <View style={{ gap: 6 }}>
              <GT size={12.5} w="semibold" c={glass.soft}>
                Suggest with
              </GT>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {services.map((s) => {
                  const on = f.suggestWith.includes(s.id);
                  return (
                    <Pressable key={s.id} onPress={() => setF({ ...f, suggestWith: on ? f.suggestWith.filter((x) => x !== s.id) : [...f.suggestWith, s.id] })} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? glass.gold : glass.card, borderWidth: 1, borderColor: on ? glass.gold : glass.line }}>
                      <GT size={13} w="bold" c={on ? glass.ink : glass.soft}>
                        {s.name}
                      </GT>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
          <GoldButton label="Save" disabled={!f.name.trim() || !f.price || (f.kind === "service" && (!f.minutes || !f.cycleDays))} onPress={save} />
        </View>
      ) : null}
    </GlassSheet>
  );
}

// ── Check limits ────────────────────────────────────────────────────────────

export function CheckRules() {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const now = K.ownerChecks(data).settings;
  const [wallet, setWallet] = useState(String(now.walletCodeAbove));
  const [refs, setRefs] = useState(String(now.referralMonthlyLimit));
  const save = () => {
    try {
      commit((d) => K.saveCheckSettings(d, { walletCodeAbove: parseInt(wallet || "0", 10), referralMonthlyLimit: parseInt(refs || "0", 10) }));
      toast("Saved");
      nav.pop();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save", "error");
    }
  };
  return (
    <GlassScreen title="Check limits" back="Live" onBack={nav.pop}>
      <GlassCard style={{ padding: 16, gap: 8 }}>
        <GT size={15} w="bold">
          Wallet code above
        </GT>
        <GT size={12.5} c={glass.soft}>
          Paying more than this from a customer's wallet needs the code sent to their WhatsApp. ₹0 asks every time.
        </GT>
        <TextInput value={wallet} onChangeText={(t) => setWallet(t.replace(/\D/g, ""))} keyboardType="number-pad" accessibilityLabel="Wallet code above, rupees" style={input} />
      </GlassCard>
      <GlassCard style={{ padding: 16, gap: 8 }}>
        <GT size={15} w="bold">
          Referral rewards a month
        </GT>
        <GT size={12.5} c={glass.soft}>
          The most referral rewards one customer can earn in a month. New customers still get their welcome reward.
        </GT>
        <TextInput value={refs} onChangeText={(t) => setRefs(t.replace(/\D/g, ""))} keyboardType="number-pad" accessibilityLabel="Referral rewards a month" style={input} />
      </GlassCard>
      <GoldButton label="Save" onPress={save} />
    </GlassScreen>
  );
}

// ── Backup ──────────────────────────────────────────────────────────────────

export async function backUp(toast: (m: string, tone?: "error") => void) {
  try {
    const { fileName, text } = K.exportBackup(getData());
    await shareTextFile(fileName, text);
  } catch (e) {
    toast(e instanceof Error ? e.message : "Couldn't make the backup", "error");
  }
}

/** Reads a backup file; the caller confirms before calling `apply`. */
export async function readBackupFile(toast: (m: string, tone?: "error") => void) {
  try {
    const text = await pickTextFile();
    if (!text) return null;
    const data = K.readBackup(text);
    // The phone's owner password and its deletions survive the restore (SECURITY-LESSONS R1-2, 7).
    return { data, customers: data.customers.filter((c) => !c.deletedAt).length, visits: data.visits.length, apply: () => restoreBackup(K.prepareRestore(getData(), data)) };
  } catch (e) {
    toast(e instanceof UserError ? e.message : "Couldn't read that file", "error");
    return null;
  }
}
