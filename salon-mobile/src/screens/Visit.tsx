/**
 * An open visit, after the service: add any extra services, then take payment.
 * The receipt follows, with the thank-you WhatsApp and a short undo window.
 */
import { useEffect, useMemo, useState } from "react";
import { Linking, View } from "react-native";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { LabelFrame } from "../components/LabelFrame";
import { Press } from "../components/Press";
import { PrintReveal } from "../components/PrintReveal";
import { Screen, SectionTitle } from "../components/Screen";
import { Seal } from "../components/Seal";
import { Segmented } from "../components/Segmented";
import { ServicePicker } from "../components/ServicePicker";
import { Stamp } from "../components/Stamp";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { priceItems } from "../domain/rules";
import { commit, useData } from "../domain/store";
import type { PaymentMethod } from "../domain/types";
import { inr } from "../format";
import { useNav } from "../nav/Navigator";
import { color, radius, space } from "../theme/tokens";
import { istTime } from "./Attendance";

export function VisitScreen({ id }: { id: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const visit = data.visits.find((v) => v.id === id);
  const customer = visit && data.customers.find((c) => c.id === visit.customerId);
  const [pick, setPick] = useState(() => ({ serviceIds: visit?.serviceIds ?? [], addOnIds: visit?.addOnIds ?? [], staffId: visit?.staffId ?? null }));
  const [useWallet, setUseWallet] = useState<boolean | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  if (!visit || !customer || visit.status !== "OPEN") {
    return (
      <Screen title="Visit">
        <T v="body">This visit is already closed.</T>
      </Screen>
    );
  }

  const total = pick.serviceIds.length ? priceItems(pick.serviceIds, pick.addOnIds).total : 0;
  const walletOn = useWallet ?? (customer.walletBalance > 0 && customer.walletBalance >= total && total > 0);
  const walletAmount = walletOn ? Math.min(customer.walletBalance, total) : 0;
  const due = total - walletAmount;

  const collect = () => {
    try {
      commit((d) => E.updateOpenVisit(d, { visitId: visit.id, serviceIds: pick.serviceIds, addOnIds: pick.addOnIds, staffId: pick.staffId! }));
      commit((d) => E.checkoutVisit(d, { visitId: visit.id, walletAmount, paymentMethod: method }));
      nav.replace({ name: "receipt", visitId: visit.id });
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't take the payment. Try again.", "error");
    }
  };

  const cancel = () => {
    commit((d) => E.cancelOpenVisit(d, visit.id));
    toast(`${customer.name.split(" ")[0]}'s visit cancelled`);
    nav.pop();
  };

  return (
    <Screen title={customer.name.split(" ")[0]}>
      <LabelFrame innerStyle={{ flexDirection: "row", alignItems: "center", padding: space.md, paddingLeft: space.lg, gap: space.md }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="small" c={color.inkMuted}>
            In the chair since {istTime(visit.createdAt)}
          </T>
          <T v="heading" numberOfLines={1}>
            {customer.name}
          </T>
        </View>
        <Seal amount={customer.walletBalance} width={104} />
      </LabelFrame>

      <ServicePicker {...pick} staff={data.staff} onChange={(n) => (setPick(n), setUseWallet(null))} />

      <SectionTitle aside={<Press onPress={() => setTopUpOpen(true)} accessibilityLabel="Top up wallet" style={{ minHeight: 48, justifyContent: "center" }}><T v="bodyStrong" c={color.seal}>Top up</T></Press>}>Payment</SectionTitle>
      {customer.walletBalance > 0 ? (
        <Press
          onPress={() => setUseWallet(!walletOn)}
          accessibilityRole="switch"
          accessibilityState={{ checked: walletOn }}
          scaleTo={0.99}
          style={{ flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md, borderRadius: radius.control, borderWidth: 1.25, borderColor: walletOn ? color.seal : color.ruleSoft, backgroundColor: color.paperLight, marginBottom: space.sm }}
        >
          <Icon name="wallet" color={color.seal} />
          <View style={{ flex: 1 }}>
            <T v="bodyStrong">Pay from wallet</T>
            <T v="small" c={color.inkMuted}>
              {walletOn && total ? `${inr(walletAmount)} of ${inr(customer.walletBalance)}` : `${inr(customer.walletBalance)} available`}
            </T>
          </View>
          <View style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: walletOn ? color.seal : color.ruleSoft, padding: 3, alignItems: walletOn ? "flex-end" : "flex-start" }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color.paperLight }} />
          </View>
        </Press>
      ) : null}
      {due > 0 ? <Segmented label="Paid by" value={method} onChange={setMethod} options={[{ key: "CASH", label: "Cash" }, { key: "UPI", label: "UPI" }, { key: "CARD", label: "Card" }]} /> : null}

      <View style={{ marginTop: space.xl, gap: space.sm }}>
        <T v="small" c={color.inkMuted} style={{ textAlign: "center" }}>
          {walletAmount > 0 ? `${inr(walletAmount)} from wallet${due > 0 ? ` · ${inr(due)} by ${method === "UPI" ? "UPI" : method.toLowerCase()}` : ""}` : `${inr(due)} by ${method === "UPI" ? "UPI" : method.toLowerCase()}`}
        </T>
        <Button big label={!pick.serviceIds.length ? "Pick a service" : `Collect ${inr(total)}`} disabled={!pick.serviceIds.length || !pick.staffId} onPress={collect} />
        {confirmCancel ? (
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Button kind="outline" label="Keep visit" onPress={() => setConfirmCancel(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button kind="ink" label="Cancel visit" onPress={cancel} />
            </View>
          </View>
        ) : (
          <Button kind="ghost" label="Customer left without a service" onPress={() => setConfirmCancel(true)} />
        )}
      </View>
      <TopUpSheet customer={customer} visible={topUpOpen} onClose={() => setTopUpOpen(false)} onDone={() => setUseWallet(null)} />
    </Screen>
  );
}

export function Receipt({ visitId }: { visitId: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const visit = data.visits.find((v) => v.id === visitId);
  const customer = visit && data.customers.find((c) => c.id === visit.customerId);
  const staff = visit && data.staff.find((s) => s.id === visit.staffId);
  const referral = useMemo(() => (visit ? data.walletTxs.filter((t) => t.visitId === visit.id && t.type === "REFERRAL_REWARD") : []), [data.walletTxs, visit]);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!visit || !customer) return <Screen title="Receipt"><T v="body">Visit not found.</T></Screen>;

  const voided = visit.status === "VOID";
  const undoLeft = visit.paidAt ? Math.max(0, config.undoWindowMinutes * 60 - Math.floor((now.getTime() - new Date(visit.paidAt).getTime()) / 1000)) : 0;

  const sendThanks = async () => {
    try {
      const { phone, message } = E.receiptMessage(data, visit.id);
      await Linking.openURL(E.whatsappLink(phone, message));
    } catch {
      toast("Couldn't open WhatsApp on this phone.", "error");
    }
  };

  const undo = () => {
    try {
      commit((d) => E.voidVisit(d, { visitId: visit.id, by: "staff", reason: "" }));
      toast("Visit undone. Any wallet money was returned.");
      nav.pop();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't undo.", "error");
    }
  };

  const items = [
    ...visit.serviceIds.map((id) => config.services.find((s) => s.id === id)!).map((s) => ({ name: s.name, price: s.price })),
    ...visit.addOnIds.map((id) => config.addOns.find((a) => a.id === id)!).map((a) => ({ name: a.name, price: a.price })),
  ];

  return (
    <Screen title={voided ? "Visit undone" : "Paid"}>
      <PrintReveal>
        <LabelFrame innerStyle={{ padding: space.xl, gap: space.md }}>
          <View>
            <T v="title">{customer.name}</T>
            <T v="small" c={color.inkMuted}>
              {staff?.name ?? "Stylist"} · {staff?.chair ?? ""}
            </T>
          </View>
          <View style={{ gap: space.xs, borderTopWidth: 1, borderTopColor: color.ruleSoft, paddingTop: space.md }}>
            {items.map((it, i) => (
              <Line key={i} label={it.name} value={inr(it.price)} />
            ))}
          </View>
          <View style={{ gap: space.xs, borderTopWidth: 1, borderTopColor: color.rule, paddingTop: space.md }}>
            <Line label="Total" value={inr(visit.total)} strong />
            {visit.walletPaid ? <Line label="From wallet" value={inr(visit.walletPaid)} /> : null}
            {visit.directPaid ? <Line label={`By ${visit.paymentMethod === "UPI" ? "UPI" : (visit.paymentMethod ?? "cash").toLowerCase()}`} value={inr(visit.directPaid)} /> : null}
            <Line label="Wallet balance now" value={inr(customer.walletBalance)} />
          </View>
          {voided ? null : (
            <View style={{ alignItems: "flex-end", marginTop: -space.md }}>
              <Stamp amount={visit.total} />
            </View>
          )}
        </LabelFrame>
      </PrintReveal>

      {referral.length && !voided ? (
        <View style={{ marginTop: space.lg, flexDirection: "row", gap: space.md, alignItems: "center", padding: space.lg, borderRadius: radius.control, backgroundColor: color.choc }}>
          <Icon name="refer" color={color.sealBright} size={26} />
          <T v="body" c={color.cream} style={{ flex: 1 }}>
            Referral reward paid: {inr(config.referral.newCustomerReward)} to {customer.name.split(" ")[0]} and {inr(config.referral.referrerReward)} to their friend. Tell them!
          </T>
        </View>
      ) : null}

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        {voided ? null : <Button big label="Send thank-you on WhatsApp" icon="chat" onPress={sendThanks} />}
        <Button kind={voided ? "seal" : "outline"} label="Back to home" onPress={() => nav.popToRoot()} />
        {!voided && undoLeft > 0 ? (
          <Button kind="ghost" label={`Undo this visit (${Math.floor(undoLeft / 60)}:${String(undoLeft % 60).padStart(2, "0")})`} onPress={undo} />
        ) : null}
      </View>
    </Screen>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
      <T v={strong ? "bodyStrong" : "body"} c={strong ? color.ink : color.inkMuted}>
        {label}
      </T>
      <T v={strong ? "amount" : "bodyStrong"} style={strong ? { fontSize: 22 } : { fontVariant: ["tabular-nums"] }}>
        {value}
      </T>
    </View>
  );
}
