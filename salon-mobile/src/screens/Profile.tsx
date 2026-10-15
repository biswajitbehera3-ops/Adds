import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { Linking, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Button } from "../components/Button";
import { Check } from "../components/Check";
import { IconSwap } from "../components/IconSwap";
import { Press } from "../components/Press";
import { Rule, Screen, SectionTitle } from "../components/Screen";
import { Seal } from "../components/Seal";
import { Segmented } from "../components/Segmented";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { commit, useData, useSession } from "../domain/store";
import type { PaymentMethod, WalletTx } from "../domain/types";
import { formatPhone, inr, relativeDays, shortDate } from "../format";
import { useNav } from "../nav/Navigator";
import { color, font, space } from "../theme/tokens";

const TX_LABEL: Record<WalletTx["type"], string> = { TOPUP: "Top-up", BONUS: "Top-up bonus", SPEND: "Paid for visit", REFERRAL_REWARD: "Referral reward", REFUND: "Refund (visit voided)", REFERRAL_REVERSAL: "Referral reward reversed", CASHOUT: "Refunded (wallet closed)", WRITE_OFF: "Bonus credit cancelled" };

export function Profile({ id }: { id: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const [tab, setTab] = useState<"visits" | "wallet">("visits");
  const [topUp, setTopUp] = useState(false);
  const p = useMemo(() => {
    try {
      return E.getProfile(data, id);
    } catch {
      return null;
    }
  }, [data, id]);

  if (!p) {
    return (
      <Screen title="Customer">
        <T v="body">This customer is no longer on this device.</T>
      </Screen>
    );
  }
  const now = new Date();
  const overdue = p.nextDue && p.nextDue.dueAt <= now;

  return (
    <Screen title={p.name.split(" ")[0]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="title">{p.name}</T>
          <T v="body" c={color.inkMuted}>
            +91 {formatPhone(p.phone)}
          </T>
          <T v="small" c={color.inkMuted}>
            Customer since {shortDate(p.createdAt)} {new Date(p.createdAt).getFullYear()}
          </T>
        </View>
        <Seal amount={p.walletBalance} width={128} />
      </View>

      <View style={{ flexDirection: "row", marginTop: space.xl, borderTopWidth: 1, borderBottomWidth: 1, borderColor: color.rule }}>
        <Stat label="Lifetime spend" value={inr(p.lifetimeSpend)} />
        <View style={{ width: 1, backgroundColor: color.ruleSoft }} />
        <Stat label="Visits" value={String(p.visits.length)} />
        <View style={{ width: 1, backgroundColor: color.ruleSoft }} />
        <Stat
          label={p.nextDue ? (overdue ? "Overdue" : "Next due") : "Next due"}
          value={p.nextDue ? shortDate(p.nextDue.dueAt) : "—"}
          sub={p.nextDue?.serviceName}
          tone={overdue ? color.seal : undefined}
        />
      </View>

      <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg }}>
        <View style={{ flex: 1 }}>
          <Button label="Top up" icon="wallet" onPress={() => setTopUp(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button kind="outline" label="Refer" icon="refer" onPress={() => nav.push({ name: "refer", id: p.id })} />
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.lg, paddingVertical: space.sm }}>
        <View>
          <T v="small" c={color.inkMuted}>
            Referral code
          </T>
          <T style={{ fontFamily: font.display, fontSize: 22, letterSpacing: 2 }}>{p.referralCode}</T>
        </View>
        <IconSwap
          from="copy"
          to="check"
          tint={color.seal}
          label={`Referral code ${p.referralCode}. Copy.`}
          onPress={async () => {
            await Clipboard.setStringAsync(p.referralCode).catch(() => {});
            toast("Referral code copied");
          }}
        />
      </View>
      {p.referredBy ? (
        <T v="small" c={color.inkMuted}>
          Referred by {p.referredBy.name}
          {p.referralRewardedAt ? " · reward paid" : " · reward on first paid visit"}
        </T>
      ) : null}

      {p.serviceDues.length > 1 ? (
        <>
          <SectionTitle>Due back</SectionTitle>
          {p.serviceDues.map((d) => (
            <View key={d.serviceId} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
              <T v="body">{d.serviceName}</T>
              <T v="bodyStrong" c={d.dueAt <= now ? color.seal : color.ink}>
                {d.dueAt <= now ? `overdue since ${shortDate(d.dueAt)}` : shortDate(d.dueAt)}
              </T>
            </View>
          ))}
        </>
      ) : null}

      <View style={{ marginTop: space.xl, marginBottom: space.md }}>
        <Segmented label="History" value={tab} onChange={setTab} options={[{ key: "visits", label: `Visits (${p.visits.length})` }, { key: "wallet", label: `Wallet (${p.walletTxs.length})` }]} />
      </View>

      <Animated.View key={tab} entering={FadeIn.duration(180)}>
        {tab === "visits" ? (
          p.visits.length ? (
            p.visits.map((v, i) => {
              const names = v.serviceIds.map((id) => config.services.find((x) => x.id === id)?.name ?? id).join(" + ");
              const st = data.staff.find((x) => x.id === v.staffId);
              const method = (v.paymentMethod ?? "CASH").toLowerCase();
              const voided = v.status === "VOID";
              const extras = v.addOnIds.map((a) => config.addOns.find((x) => x.id === a)?.name).filter(Boolean);
              return (
                <View key={v.id}>
                  {i > 0 ? <Rule /> : null}
                  <View style={{ flexDirection: "row", paddingVertical: space.md, gap: space.md }}>
                    <View style={{ flex: 1 }}>
                      <T v="bodyStrong" style={voided ? { textDecorationLine: "line-through" } : undefined}>
                        {names}
                      </T>
                      <T v="small" c={voided ? color.danger : color.inkMuted}>
                        {voided ? `Voided · ${v.voidReason ?? ""}` : [shortDate(v.paidAt ?? v.createdAt), st?.name, ...extras].filter(Boolean).join(" · ")}
                      </T>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <T v="bodyStrong" style={{ fontVariant: ["tabular-nums"] }}>
                        {inr(v.total)}
                      </T>
                      <T v="small" c={color.inkMuted}>
                        {v.walletPaid === v.total ? "wallet" : v.walletPaid ? "wallet + " + method : method === "upi" ? "UPI" : method}
                      </T>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <T v="body" c={color.inkMuted}>
              No visits yet.
            </T>
          )
        ) : p.walletTxs.length ? (
          p.walletTxs.map((t, i) => (
            <View key={t.id}>
              {i > 0 ? <Rule /> : null}
              <View style={{ flexDirection: "row", paddingVertical: space.md, gap: space.md }}>
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">{TX_LABEL[t.type]}</T>
                  <T v="small" c={color.inkMuted}>
                    {[relativeDays(t.createdAt), t.note].filter(Boolean).join(" · ")}
                  </T>
                </View>
                <T v="bodyStrong" c={t.amount > 0 ? color.positive : color.ink} style={{ fontVariant: ["tabular-nums"] }}>
                  {t.amount > 0 ? "+" : ""}
                  {inr(t.amount)}
                </T>
              </View>
            </View>
          ))
        ) : (
          <T v="body" c={color.inkMuted}>
            No wallet activity yet.
          </T>
        )}
      </Animated.View>

      <PrivacyControls customerId={p.id} name={p.name} phone={p.phone} messagesOn={Boolean(p.marketingConsentAt)} guardian={p.guardianConsent} />

      <TopUpSheet customer={p} visible={topUp} onClose={() => setTopUp(false)} />
    </Screen>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <View style={{ flex: 1, paddingVertical: space.md, paddingHorizontal: space.sm, gap: 2 }}>
      <T v="small" c={color.inkMuted}>
        {label}
      </T>
      <T style={{ fontFamily: font.display, fontSize: 19, lineHeight: 25, fontVariant: ["tabular-nums"] }} c={tone ?? color.ink} numberOfLines={1}>
        {value}
      </T>
      {sub ? (
        <T v="small" c={color.inkMuted} numberOfLines={1}>
          {sub}
        </T>
      ) : null}
    </View>
  );
}

/**
 * DPDP requests at the counter: stop messages, send the customer their data, and
 * (owner only) close the wallet and erase the customer. Deleting takes two taps.
 */
function PrivacyControls({ customerId, name, phone, messagesOn, guardian }: { customerId: string; name: string; phone: string; messagesOn: boolean; guardian: boolean }) {
  const data = useData();
  const session = useSession();
  const nav = useNav();
  const toast = useToast();
  const by = session?.role === "staff" ? session.staffId : "owner";
  const isOwner = session?.role === "owner";
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [armed, setArmed] = useState(false);
  const wallet = E.refundableBalance(data, customerId);
  const run = (fn: () => void, ok: string) => {
    try {
      fn();
      toast(ok);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't do that. Try again.", "error");
    }
  };
  return (
    <View style={{ marginTop: space.xl, gap: space.sm }}>
      <SectionTitle>Privacy</SectionTitle>
      {guardian ? (
        <T v="small" c={color.inkMuted}>
          Under 18 · kept under a parent's or guardian's number with their consent.
        </T>
      ) : null}
      <Check
        checked={messagesOn}
        onChange={(on) => run(() => commit((d) => E.setMarketingConsent(d, { customerId, on, by })), on ? "Messages turned on" : "Messages stopped")}
        label="WhatsApp reminders and offers"
        hint={messagesOn ? "On. Untick if they reply STOP or ask to stop" : "Off. Tick only if the customer asks for them"}
      />
      <Button
        kind="outline"
        label="Send them their data on WhatsApp"
        icon="refer"
        onPress={() =>
          run(() => {
            const text = commit((d) => E.customerDataExport(d, customerId));
            Linking.openURL(E.whatsappLink(phone, text)).catch(() => {});
          }, "Opening WhatsApp")
        }
      />
      {isOwner ? (
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {wallet.balance > 0 ? (
            <>
              <T v="small" c={color.inkMuted}>
                {`Before deleting, close the wallet: refund ₹${wallet.refundable.toLocaleString("en-IN")}${wallet.promotional ? `; ₹${wallet.promotional.toLocaleString("en-IN")} bonus credit is cancelled` : ""}.`}
              </T>
              <Segmented label="Refund by" value={method} onChange={setMethod} options={[{ key: "CASH", label: "Cash" }, { key: "UPI", label: "UPI" }, { key: "CARD", label: "Card" }]} />
              <Button kind="outline" label={`Close wallet · refund ₹${wallet.refundable.toLocaleString("en-IN")}`} onPress={() => run(() => commit((d) => E.closeWallet(d, { customerId, method, by: "owner" })), "Wallet closed")} />
            </>
          ) : (
            <Button
              kind="outline"
              label={armed ? `Tap again to delete ${name.split(" ")[0]}'s data` : "Delete customer data"}
              onPress={() => {
                if (!armed) return setArmed(true);
                run(() => {
                  commit((d) => E.deleteCustomer(d, { customerId, by: "owner" }));
                  nav.pop();
                }, "Customer data deleted");
              }}
            />
          )}
        </View>
      ) : (
        <T v="small" c={color.inkMuted}>
          To delete a customer's data, ask the owner. It's in the owner's sign-in.
        </T>
      )}
    </View>
  );
}
