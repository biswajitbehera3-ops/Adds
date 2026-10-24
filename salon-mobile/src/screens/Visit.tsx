/**
 * The bill and the receipt (BUILD-SPEC 4.6, 4.7), brown glass, as approved.
 * Bill: who is in the chair since when, the services (anything added after the start is
 * marked "added"), pay from wallet, Cash / UPI / Card, Collect. "Customer left without a
 * service" cancels the visit (two taps).
 * Receipt: the bill with the PAID stamp landing (motion P5), the WhatsApp thank-you, Next
 * customer, and Undo for the first 2 minutes.
 */
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, useReducedMotion } from "react-native-reanimated";
import { GhostButton, GlassCard, GlassScreen, GlassSheet, GlassSwitch, GoldButton, GT, WalletBadge } from "../components/glass";
import { OwnerApproval, WhatsAppCode } from "../components/Guards";
import { Icon } from "../components/Icon";
import { ServicePicker } from "../components/ServicePicker";
import { Stamp } from "../components/Stamp";
import { useToast } from "../components/Toast";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { commit, useData, useSession } from "../domain/store";
import type { PaymentMethod } from "../domain/types";
import { inr } from "../format";
import { useNav } from "../nav/Navigator";
import { glass, urbanist } from "../theme/tokens";
import { istTime, useCurrentStaff } from "./Attendance";

const itemsOf = (serviceIds: string[], addOnIds: string[]) => [
  ...serviceIds.map((id) => config.services.find((s) => s.id === id)).filter(Boolean).map((s) => ({ id: s!.id, name: s!.name, price: s!.price })),
  ...addOnIds.map((id) => config.addOns.find((a) => a.id === id)).filter(Boolean).map((a) => ({ id: a!.id, name: a!.name, price: a!.price })),
];

export function VisitScreen({ id }: { id: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const visit = data.visits.find((v) => v.id === id);
  const customer = visit && data.customers.find((c) => c.id === visit.customerId);
  const [pick, setPick] = useState(() => ({ serviceIds: visit?.serviceIds ?? [], addOnIds: visit?.addOnIds ?? [], staffId: visit?.staffId ?? null }));
  const [editing, setEditing] = useState(false);
  const [useWallet, setUseWallet] = useState<boolean | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [walletOk, setWalletOk] = useState(false);
  const isOwner = useSession()?.role === "owner";
  const me = useCurrentStaff();

  if (!visit || !customer || visit.status !== "OPEN") {
    return (
      <GlassScreen title="Visit" back="Home" onBack={nav.pop}>
        <GT size={15} c={glass.soft}>
          This visit is already closed.
        </GT>
      </GlassScreen>
    );
  }
  const items = itemsOf(pick.serviceIds, pick.addOnIds);
  const extras = visit.extras ?? [];
  const waiting = extras.filter((x) => !x.approvedAt);
  const startIds = new Set([...visit.serviceIds, ...visit.addOnIds]);
  let total = 0;
  try {
    total = E.visitTotal(pick.serviceIds, pick.addOnIds, extras).total;
  } catch {
    total = 0;
  }
  const walletOn = useWallet ?? (customer.walletBalance > 0 && customer.walletBalance >= total && total > 0);
  const walletAmount = walletOn ? Math.min(customer.walletBalance, total) : 0;
  const due = total - walletAmount;
  const methodText = method === "UPI" ? "UPI" : method.toLowerCase();
  const needsCode = walletAmount > E.checkSettings(data).walletCodeAbove;
  const canCollect = (pick.serviceIds.length > 0 || extras.length > 0) && !!pick.staffId && !waiting.length && (!needsCode || walletOk);

  const collect = () => {
    try {
      commit((d) => E.updateOpenVisit(d, { visitId: visit.id, serviceIds: pick.serviceIds, addOnIds: pick.addOnIds, staffId: pick.staffId! }));
      commit((d) => E.checkoutVisit(d, { visitId: visit.id, walletAmount, paymentMethod: method, walletCodeOk: needsCode && walletOk }));
      nav.replace({ name: "receipt", visitId: visit.id });
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't take the payment. Try again.", "error");
    }
  };
  const cancel = () => {
    commit((d) => E.cancelOpenVisit(d, visit.id, isOwner ? "owner" : (me?.id ?? null)));
    toast(`Recorded: ${customer.name.split(" ")[0]} left without service`);
    nav.pop();
  };

  return (
    <GlassScreen title={customer.name.split(" ")[0]} back="Home" onBack={nav.pop} after={<TopUpSheet customer={customer} visible={topUpOpen} onClose={() => setTopUpOpen(false)} onDone={() => setUseWallet(null)} />}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: -6 }}>
        <GT size={13} c={glass.soft} style={{ flex: 1 }}>
          In the chair since {istTime(visit.createdAt)} · {customer.name}
        </GT>
        <WalletBadge amount={customer.walletBalance} size={70} />
      </View>

      <GlassCard style={{ padding: 16, gap: 8 }}>
        {items.map((it) => (
          <View key={it.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <GT size={14.5} c={glass.soft}>
              {it.name}
              {!startIds.has(it.id) ? <GT size={13} c={glass.gold2}> · added</GT> : null}
            </GT>
            <GT size={14.5} w="bold" style={{ fontVariant: ["tabular-nums"] }}>
              {inr(it.price)}
            </GT>
          </View>
        ))}
        {extras.map((x, i) => (
          <View key={`x${i}`} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <GT size={14.5} c={glass.soft}>
                {x.name} <GT size={12} c={x.approvedAt ? glass.ok : glass.late}>· {x.approvedAt ? "owner approved" : "waiting for owner"}</GT>
              </GT>
            </View>
            <GT size={14.5} w="bold" style={{ fontVariant: ["tabular-nums"] }}>
              {inr(x.price)}
            </GT>
            {!x.approvedAt ? (
              <Pressable onPress={() => run(() => commit((d) => E.removeVisitExtra(d, { visitId: visit.id, index: i })))} accessibilityRole="button" accessibilityLabel={`Remove ${x.name}`} hitSlop={8}>
                <Icon name="close" color={glass.soft} size={16} />
              </Pressable>
            ) : null}
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: glass.line, marginVertical: 4 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <GT size={16} w="heavy">
            Total
          </GT>
          <GT size={22} w="heavy" style={{ fontVariant: ["tabular-nums"] }}>
            {inr(total)}
          </GT>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Pressable onPress={() => setEditing((x) => !x)} accessibilityRole="button" accessibilityState={{ expanded: editing }} hitSlop={6}>
            <GT size={13} w="bold" c={glass.gold2}>
              {editing ? "Done adding" : "+ Add or change services"}
            </GT>
          </Pressable>
          <Pressable onPress={() => setOtherOpen(true)} accessibilityRole="button" hitSlop={6}>
            <GT size={13} w="bold" c={glass.soft}>
              Not in the list?
            </GT>
          </Pressable>
        </View>
      </GlassCard>
      {waiting.length ? (
        <View style={{ gap: 8, padding: 12, borderRadius: 16, backgroundColor: "rgba(240,160,138,0.12)", borderWidth: 1, borderColor: "rgba(240,160,138,0.45)" }}>
          <GT size={13} c={glass.cream}>
            {waiting.map((x) => x.name).join(", ")} isn't in the salon's list, so the owner must approve it before payment.
          </GT>
          {isOwner ? <GoldButton label="Approve" onPress={() => run(() => commit((d) => E.approveVisitExtras(d, visit.id)))} /> : <GhostButton label="Owner approves here" tone={glass.gold2} onPress={() => setApproveOpen(true)} />}
        </View>
      ) : null}
      {editing ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <ServicePicker {...pick} staff={data.staff} onChange={(n) => (setPick(n), setUseWallet(null))} />
        </Animated.View>
      ) : null}

      {customer.walletBalance > 0 ? (
        <Pressable onPress={() => setUseWallet(!walletOn)} accessibilityRole="switch" accessibilityState={{ checked: walletOn }} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: glass.card, borderWidth: 1, borderColor: walletOn ? glass.gold : glass.line }}>
          <View style={{ flex: 1 }}>
            <GT size={15} w="bold">
              Pay from wallet
            </GT>
            <GT size={12.5} c={glass.soft}>
              {walletOn && total ? `${inr(walletAmount)} of ${inr(customer.walletBalance)}` : `${inr(customer.walletBalance)} available`}
            </GT>
          </View>
          <View style={{ width: 46, height: 28, borderRadius: 14, padding: 3, backgroundColor: walletOn ? glass.gold : "rgba(255,244,236,0.18)", alignItems: walletOn ? "flex-end" : "flex-start" }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: glass.cream }} />
          </View>
        </Pressable>
      ) : null}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", display: isOwner ? "flex" : "none" }}>
        <Pressable onPress={() => setTopUpOpen(true)} accessibilityRole="button" accessibilityLabel="Top up wallet" hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="wallet" color={glass.gold2} size={17} />
          <GT size={13} w="bold" c={glass.gold2}>
            Top up wallet
          </GT>
        </Pressable>
      </View>
      {due > 0 ? (
        <GlassSwitch
          options={[
            { key: "CASH", label: "Cash" },
            { key: "UPI", label: "UPI" },
            { key: "CARD", label: "Card" },
          ]}
          value={method}
          onChange={setMethod}
        />
      ) : null}

      <GT size={12.5} c={glass.soft} style={{ textAlign: "center", marginTop: 6 }}>
        {walletAmount > 0 ? `${inr(walletAmount)} from wallet${due > 0 ? ` · ${inr(due)} by ${methodText}` : ""}` : `${inr(due)} by ${methodText}`}
      </GT>
      {needsCode ? <WhatsAppCode phone={customer.phone} purpose={`pay ${inr(walletAmount)} from your wallet`} verified={walletOk} onVerified={setWalletOk} /> : null}
      <GoldButton label={!pick.serviceIds.length && !extras.length ? "Pick a service" : waiting.length ? "Waiting for owner's approval" : needsCode && !walletOk ? "Confirm the wallet code first" : `Collect ${inr(total)}`} disabled={!canCollect} onPress={collect} />
      {confirmCancel ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <GhostButton label="Keep visit" style={{ flex: 1 }} onPress={() => setConfirmCancel(false)} />
          <GhostButton label="They left" tone="#F08C6A" style={{ flex: 1 }} onPress={cancel} />
        </View>
      ) : (
        <Pressable onPress={() => setConfirmCancel(true)} accessibilityRole="button" style={{ alignItems: "center", paddingVertical: 8 }}>
          <GT size={13.5} c={glass.soft}>
            Customer left without a service
          </GT>
        </Pressable>
      )}
      {confirmCancel ? (
        <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
          This is recorded with your name and the time, and the owner sees it.
        </GT>
      ) : null}
      <OtherSheet open={otherOpen} onClose={() => setOtherOpen(false)} onAdd={(name, price) => run(() => (commit((d) => E.addVisitExtra(d, { visitId: visit.id, name, price })), setOtherOpen(false)))} />
      <OwnerApproval
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Owner approval"
        detail={`${waiting.map((x) => `${x.name} ${inr(x.price)}`).join(", ")} on ${customer.name.split(" ")[0]}'s bill. The owner types the owner password to approve.`}
        onApproved={() => run(() => commit((d) => E.approveVisitExtras(d, visit.id)))}
      />
    </GlassScreen>
  );

  function run(fn: () => void) {
    try {
      fn();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Something went wrong", "error");
    }
  }
}

/** A service that isn't in the salon's list: name and price, then the owner approves it. */
function OtherSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (name: string, price: number) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  useEffect(() => {
    if (open) (setName(""), setPrice(""));
  }, [open]);
  const input = { minHeight: 50, borderRadius: 16, paddingHorizontal: 16, fontFamily: urbanist.medium, fontSize: 16, color: glass.cream, backgroundColor: "rgba(26,18,16,0.5)", borderWidth: 1, borderColor: glass.line } as const;
  return (
    <GlassSheet open={open} onClose={onClose} label="Service not in the list">
      <View style={{ gap: 12, paddingHorizontal: 20, paddingBottom: 20 }}>
        <GT size={20} w="heavy">
          Not in the list
        </GT>
        <GT size={13} c={glass.soft}>
          Type what was done and its price. The owner must approve it before the customer pays.
        </GT>
        <TextInput value={name} onChangeText={setName} placeholder="e.g. Keratin touch-up" placeholderTextColor={glass.faint} accessibilityLabel="Service name" style={input} />
        <TextInput value={price} onChangeText={(t) => setPrice(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="Price in ₹" placeholderTextColor={glass.faint} accessibilityLabel="Price in rupees" style={input} />
        <GoldButton label="Add to the bill" disabled={!name.trim() || !price} onPress={() => onAdd(name, parseInt(price, 10))} />
      </View>
    </GlassSheet>
  );
}

export function Receipt({ visitId }: { visitId: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const reduced = useReducedMotion();
  const visit = data.visits.find((v) => v.id === visitId);
  const customer = visit && data.customers.find((c) => c.id === visit.customerId);
  const staff = visit && data.staff.find((s) => s.id === visit.staffId);
  const referral = useMemo(() => (visit ? data.walletTxs.filter((t) => t.visitId === visit.id && t.type === "REFERRAL_REWARD") : []), [data.walletTxs, visit]);
  const me = useCurrentStaff();
  const [undoOpen, setUndoOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!visit || !customer) {
    return (
      <GlassScreen title="Receipt" back="Home" onBack={nav.popToRoot}>
        <GT size={15} c={glass.soft}>
          Visit not found.
        </GT>
      </GlassScreen>
    );
  }
  const voided = visit.status === "VOID";
  const undoLeft = visit.paidAt ? Math.max(0, config.undoWindowMinutes * 60 - Math.floor((now.getTime() - new Date(visit.paidAt).getTime()) / 1000)) : 0;
  const items = E.billLines(visit).map((l, i) => ({ id: `${i}`, ...l }));
  const referrerPaid = referral.find((t) => t.customerId !== customer.id)?.amount ?? 0;
  const sendThanks = async () => {
    try {
      const { phone, message } = E.receiptMessage(data, visit.id);
      await Linking.openURL(E.whatsappLink(phone, message));
    } catch {
      toast("Couldn't open WhatsApp on this phone.", "error");
    }
  };
  const undo = (reason: string) => {
    try {
      commit((d) => E.voidVisit(d, { visitId: visit.id, by: "staff", reason, staffId: me?.id ?? null }));
      toast("Visit undone. Any wallet money was returned.");
      nav.pop();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't undo.", "error");
    }
  };
  const line = (label: string, value: string, opts: { strong?: boolean; tone?: string } = {}) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
      <GT size={opts.strong ? 16 : 14.5} w={opts.strong ? "heavy" : "medium"} c={opts.strong ? glass.cream : glass.soft}>
        {label}
      </GT>
      <GT size={opts.strong ? 22 : 14.5} w={opts.strong ? "heavy" : "bold"} c={opts.tone ?? glass.cream} style={{ fontVariant: ["tabular-nums"] }}>
        {value}
      </GT>
    </View>
  );
  return (
    <GlassScreen title={voided ? "Visit undone" : customer.name} back="Home" onBack={nav.popToRoot}>
      <GT size={13} c={glass.soft} style={{ marginTop: -8 }}>
        {voided ? "Money returned to the wallet" : `Paid · ${istTime(visit.paidAt ?? visit.createdAt)}`} · {staff?.name.split(" ")[0] ?? ""} · {staff?.chair ?? ""}
      </GT>
      <Animated.View entering={reduced ? undefined : FadeInDown.duration(500)}>
        <GlassCard style={{ padding: 18, gap: 8, overflow: "hidden" }}>
          {items.map((it) => (
            <View key={it.id}>{line(it.name, inr(it.price))}</View>
          ))}
          <View style={{ height: 1, backgroundColor: glass.line, marginVertical: 4 }} />
          {line("Total", inr(visit.total), { strong: true })}
          {visit.walletPaid ? line("From wallet", inr(visit.walletPaid)) : null}
          {visit.directPaid ? line(`By ${visit.paymentMethod === "UPI" ? "UPI" : (visit.paymentMethod ?? "cash").toLowerCase()}`, inr(visit.directPaid)) : null}
          {line("Wallet now", inr(customer.walletBalance), { tone: glass.gold2 })}
          {voided ? null : (
            <View style={{ alignItems: "flex-end", marginTop: -8, marginRight: -6 }}>
              <Stamp />
            </View>
          )}
        </GlassCard>
      </Animated.View>
      {referral.length && !voided ? (
        <View style={{ padding: 14, borderRadius: 18, backgroundColor: "rgba(228,166,123,0.16)", borderWidth: 1, borderColor: "rgba(228,166,123,0.45)" }}>
          <GT size={13.5} c={glass.cream}>
            {referrerPaid
              ? `Referral reward paid: ${inr(config.referral.newCustomerReward)} to ${customer.name.split(" ")[0]} and ${inr(referrerPaid)} to their friend. Tell them!`
              : `Welcome reward paid: ${inr(config.referral.newCustomerReward)} to ${customer.name.split(" ")[0]}. Their friend has had this month's referral rewards already.`}
          </GT>
        </View>
      ) : null}
      {voided ? null : <GoldButton label="Send thank-you on WhatsApp" onPress={sendThanks} />}
      <GhostButton label="Next customer" onPress={() => nav.replace({ name: "counter" })} />
      {!voided && undoLeft > 0 ? (
        <Pressable onPress={() => setUndoOpen(true)} accessibilityRole="button" style={{ alignItems: "center", paddingVertical: 8 }}>
          <GT size={13.5} c={glass.soft}>
            Undo this visit · {Math.floor(undoLeft / 60)}:{String(undoLeft % 60).padStart(2, "0")}
          </GT>
        </Pressable>
      ) : null}
      <UndoSheet open={undoOpen} onClose={() => setUndoOpen(false)} onUndo={(r) => (setUndoOpen(false), undo(r))} />
    </GlassScreen>
  );
}

const UNDO_REASONS = ["Wrong customer", "Wrong service", "Entered twice", "Wrong payment type"];

/** Undo asks why; the reason and the stylist's name go on the record the owner sees. */
function UndoSheet({ open, onClose, onUndo }: { open: boolean; onClose: () => void; onUndo: (reason: string) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const [other, setOther] = useState("");
  useEffect(() => {
    if (open) (setPick(null), setOther(""));
  }, [open]);
  const reason = pick === "Other" ? other.trim() : (pick ?? "");
  return (
    <GlassSheet open={open} onClose={onClose} label="Undo this bill">
      <View style={{ gap: 12, paddingHorizontal: 20, paddingBottom: 20 }}>
        <GT size={20} w="heavy">
          Why undo this bill?
        </GT>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[...UNDO_REASONS, "Other"].map((r) => (
            <Pressable key={r} onPress={() => setPick(r)} accessibilityRole="radio" accessibilityState={{ checked: pick === r }} style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: pick === r ? glass.gold : glass.card, borderWidth: 1, borderColor: pick === r ? glass.gold : glass.line }}>
              <GT size={13.5} w="bold" c={pick === r ? glass.ink : glass.soft}>
                {r}
              </GT>
            </Pressable>
          ))}
        </View>
        {pick === "Other" ? (
          <TextInput value={other} onChangeText={setOther} placeholder="What happened?" placeholderTextColor={glass.faint} accessibilityLabel="Reason" style={{ minHeight: 50, borderRadius: 16, paddingHorizontal: 16, fontFamily: urbanist.medium, fontSize: 16, color: glass.cream, backgroundColor: "rgba(26,18,16,0.5)", borderWidth: 1, borderColor: glass.line }} />
        ) : null}
        <GT size={12.5} c={glass.soft}>
          The bill stays on record as cancelled, with your name and this reason. The owner sees it.
        </GT>
        <GoldButton label="Undo the bill" disabled={!reason} onPress={() => onUndo(reason)} />
      </View>
    </GlassSheet>
  );
}
