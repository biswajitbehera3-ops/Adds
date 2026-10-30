/**
 * A customer's profile (BUILD-SPEC 4.11, 4.17), brown glass: Call / WhatsApp / Book, wallet
 * with Top up, what they have spent, visits and bills, next booking, when each service is due,
 * referral code, and their privacy choices. Cancelling a bill and deleting the customer stay
 * with the owner; a stylist sees a note instead.
 */
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookSheet } from "../components/BookSheet";
import { GhostButton, GlassCard, GlassSwitch, GoldButton, GT } from "../components/glass";
import { Icon, type IconName } from "../components/Icon";
import { Press } from "../components/Press";
import { useToast } from "../components/Toast";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate } from "../domain/rules";
import { commit, useData, useSession } from "../domain/store";
import type { PaymentMethod, WalletTx } from "../domain/types";
import { formatPhone, inr, maskPhone, relativeDays, shortDate } from "../format";
import { useNav } from "../nav/Navigator";
import { glass } from "../theme/tokens";

const TX_LABEL: Record<WalletTx["type"], string> = { TOPUP: "Top-up", BONUS: "Top-up bonus", SPEND: "Paid for visit", REFERRAL_REWARD: "Referral reward", REFUND: "Refund (visit voided)", REFERRAL_REVERSAL: "Referral reward reversed", CASHOUT: "Refunded (wallet closed)", WRITE_OFF: "Bonus credit cancelled" };
const METHOD: Record<string, string> = { CASH: "Cash", UPI: "UPI", CARD: "Card" };

export function Profile({ id }: { id: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<"visits" | "wallet">("visits");
  const [topUp, setTopUp] = useState(false);
  const [book, setBook] = useState(false);
  const isOwner = useSession()?.role === "owner";
  const p = useMemo(() => {
    try {
      return E.getProfile(data, id);
    } catch {
      return null;
    }
  }, [data, id]);
  const dir = useMemo(() => E.customerDirectory(data).rows.find((r) => r.id === id) ?? null, [data, id]);
  const now = new Date();
  const next = useMemo(() => {
    const appt = data.appointments.filter((a) => a.customerId === id && a.status === "BOOKED" && Date.parse(a.at) > now.getTime()).sort((a, b) => a.at.localeCompare(b.at))[0];
    return appt ? (E.appointmentsOn(data, istDate(new Date(appt.at))).find((x) => x.id === appt.id) ?? null) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, id]);

  if (!p) {
    return (
      <Backdrop>
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 18, gap: 12 }}>
          <BackLink />
          <GT size={18} w="bold">
            This customer is no longer on this device.
          </GT>
        </View>
      </Backdrop>
    );
  }
  const initials = p.name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const tag = dir?.tag === "regular" ? "Regular" : dir?.tag === "lapsed" ? `Not seen ${dir.daysSinceLast} days` : dir?.tag === "new" ? "New" : null;
  const since = new Date(p.createdAt);
  const nextDue = p.nextDue;
  const overdue = nextDue && nextDue.dueAt <= now;

  return (
    <Backdrop>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: insets.bottom + 48, gap: 14 }} showsVerticalScrollIndicator={false}>
        <BackLink />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: glass.gold, alignItems: "center", justifyContent: "center" }}>
            <GT size={24} w="heavy" c={glass.ink}>
              {initials}
            </GT>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <GT size={25} w="heavy" accessibilityRole="header" style={{ lineHeight: 30 }}>
              {p.name}
            </GT>
            <GT size={13} c={glass.soft}>
              {isOwner ? formatPhone(p.phone) : maskPhone(p.phone)} · since {C.MONTHS[since.getMonth()].slice(0, 3)} {since.getFullYear()}
            </GT>
            {tag ? (
              <View style={{ alignSelf: "flex-start", marginTop: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "rgba(228,166,123,0.18)" }}>
                <GT size={11} w="heavy" c={glass.gold2}>
                  {tag}
                </GT>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Action icon="phone" label="Call" onPress={() => Linking.openURL(`tel:${p.phone}`)} />
          <Action icon="chat" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/91${p.phone}`)} />
          <Action icon="calendar" label="Book" onPress={() => setBook(true)} />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 22, backgroundColor: "rgba(228,166,123,0.18)", borderWidth: 1, borderColor: "rgba(228,166,123,0.45)" }}>
          <View>
            <GT size={11.5} w="heavy" c={glass.gold2} style={{ letterSpacing: 1.2 }}>
              WALLET
            </GT>
            <GT size={30} w="heavy" style={{ lineHeight: 36, fontVariant: ["tabular-nums"] }}>
              {inr(p.walletBalance)}
            </GT>
          </View>
          {isOwner ? (
            <Press onPress={() => setTopUp(true)} accessibilityLabel="Top up wallet" style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 }}>
              <GT size={14} w="heavy" c={glass.ink}>
                Top up
              </GT>
            </Press>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Stat label="Spent" value={inr(p.lifetimeSpend)} />
          <Stat label="Visits" value={String(dir?.visits ?? 0)} />
          <Stat label={overdue ? "Overdue" : "Next due"} value={nextDue ? shortDate(nextDue.dueAt) : "—"} sub={nextDue?.serviceName} tone={overdue ? "#F0A86A" : undefined} />
        </View>

        <GlassCard style={{ padding: 14, gap: 4 }}>
          <GT size={11.5} w="heavy" c={glass.soft} style={{ letterSpacing: 1.2 }}>
            NEXT BOOKING
          </GT>
          {next ? (
            <>
              <GT size={16} w="heavy">
                {C.shortDay(istDate(new Date(next.at)))} · {C.clock(next.time).time} {C.clock(next.time).ampm}
              </GT>
              <GT size={13} c={glass.soft}>
                {next.serviceNames.join(" + ")} · {next.stylistName?.split(" ")[0] ?? "anyone free"}
              </GT>
            </>
          ) : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <GT size={14} c={glass.soft}>
                No booking yet.
              </GT>
              <Pressable onPress={() => setBook(true)} accessibilityRole="button" hitSlop={8}>
                <GT size={13.5} w="heavy" c={glass.gold2}>
                  + Book
                </GT>
              </Pressable>
            </View>
          )}
        </GlassCard>

        {p.serviceDues.length > 1 ? (
          <GlassCard style={{ padding: 14, gap: 6 }}>
            <GT size={11.5} w="heavy" c={glass.soft} style={{ letterSpacing: 1.2 }}>
              DUE BACK
            </GT>
            {p.serviceDues.map((d) => (
              <View key={d.serviceId} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <GT size={14}>{d.serviceName}</GT>
                <GT size={14} w="bold" c={d.dueAt <= now ? "#F0A86A" : glass.cream}>
                  {d.dueAt <= now ? `overdue since ${shortDate(d.dueAt)}` : shortDate(d.dueAt)}
                </GT>
              </View>
            ))}
          </GlassCard>
        ) : null}

        <GlassSwitch
          options={[
            { key: "visits", label: `Visits & bills · ${p.visits.length}` },
            { key: "wallet", label: `Wallet · ${p.walletTxs.length}` },
          ]}
          value={tab}
          onChange={setTab}
        />
        <Animated.View key={tab} entering={reduced ? undefined : FadeIn.duration(200)}>
          <GlassCard style={{ paddingHorizontal: 14, paddingVertical: 4 }}>
            {tab === "visits" ? (
              p.visits.length ? (
                p.visits.map((v, i) => {
                  const names = v.serviceIds.map((sid) => config.services.find((x) => x.id === sid)?.name ?? sid);
                  const extras = v.addOnIds.map((a) => config.addOns.find((x) => x.id === a)?.name).filter(Boolean);
                  const st = data.staff.find((x) => x.id === v.staffId);
                  const voided = v.status === "VOID";
                  const when = new Date(v.paidAt ?? v.createdAt);
                  const method = v.walletPaid === v.total ? "Wallet" : v.walletPaid ? `Wallet + ${METHOD[v.paymentMethod ?? "CASH"]}` : METHOD[v.paymentMethod ?? "CASH"];
                  return (
                    <Press key={v.id} onPress={() => nav.push({ name: "bill", visitId: v.id })} accessibilityLabel={`${voided ? "Cancelled bill" : "Bill"}, ${inr(v.total)}. Open`} scaleTo={0.985} style={{ flexDirection: "row", gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
                      <GT size={12.5} c={glass.soft} style={{ width: 52 }}>
                        {relativeDays(when) === "today" ? "Today" : shortDate(when)}
                      </GT>
                      <View style={{ flex: 1 }}>
                        <GT size={14.5} w="bold" style={voided ? { textDecorationLine: "line-through", color: glass.faint } : undefined}>
                          {[...names, ...extras].join(" + ")}
                        </GT>
                        <GT size={12} c={voided ? "#F08C6A" : glass.soft}>
                          {voided ? `Cancelled · ${v.voidReason ?? ""}` : (st?.name.split(" ")[0] ?? "")}
                        </GT>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <GT size={14.5} w="heavy" style={[{ fontVariant: ["tabular-nums"] }, voided ? { textDecorationLine: "line-through", color: glass.faint } : null]}>
                          {inr(v.total)}
                        </GT>
                        <GT size={11} w="bold" c={glass.faint}>
                          {method.toUpperCase()}
                        </GT>
                      </View>
                    </Press>
                  );
                })
              ) : (
                <GT size={14} c={glass.soft} style={{ paddingVertical: 12 }}>
                  No visits yet.
                </GT>
              )
            ) : p.walletTxs.length ? (
              p.walletTxs.map((t, i) => (
                <View key={t.id} style={{ flexDirection: "row", gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
                  <View style={{ flex: 1 }}>
                    <GT size={14.5} w="bold">
                      {TX_LABEL[t.type]}
                    </GT>
                    <GT size={12} c={glass.soft}>
                      {[relativeDays(t.createdAt), t.note].filter(Boolean).join(" · ")}
                    </GT>
                  </View>
                  <GT size={14.5} w="heavy" c={t.amount > 0 ? glass.ok : glass.cream} style={{ fontVariant: ["tabular-nums"] }}>
                    {t.amount > 0 ? "+" : ""}
                    {inr(t.amount)}
                  </GT>
                </View>
              ))
            ) : (
              <GT size={14} c={glass.soft} style={{ paddingVertical: 12 }}>
                No wallet activity yet.
              </GT>
            )}
          </GlassCard>
        </Animated.View>

        <GlassCard style={{ padding: 14, gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <GT size={11.5} w="heavy" c={glass.soft} style={{ letterSpacing: 1.2 }}>
                REFERRAL CODE
              </GT>
              <GT size={20} w="heavy" style={{ letterSpacing: 2 }}>
                {p.referralCode}
              </GT>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <GhostButton
                label="Copy"
                style={{ paddingHorizontal: 14 }}
                onPress={async () => {
                  await Clipboard.setStringAsync(p.referralCode).catch(() => {});
                  toast("Referral code copied");
                }}
              />
              <GhostButton label="Refer" style={{ paddingHorizontal: 14 }} onPress={() => nav.push({ name: "refer", id: p.id })} />
            </View>
          </View>
          {p.referredBy ? (
            <GT size={12.5} c={glass.soft}>
              Referred by {p.referredBy.name}
              {p.referralRewardedAt ? " · reward paid" : " · reward on first paid visit"}
            </GT>
          ) : null}
        </GlassCard>

        <PrivacyControls customerId={p.id} name={p.name} phone={p.phone} messagesOn={Boolean(p.marketingConsentAt)} guardian={p.guardianConsent} />
      </ScrollView>

      <TopUpSheet customer={p} visible={topUp} onClose={() => setTopUp(false)} />
      <BookSheet
        open={book}
        day={istDate()}
        phone={p.phone}
        top={insets.top + 30}
        onClose={() => setBook(false)}
        onBooked={(appt) => {
          setBook(false);
          const t = C.clock(new Date(Date.parse(appt.at) + 330 * 60000).toISOString().slice(11, 16));
          toast(`Booked · ${p.name.split(" ")[0]}, ${t.time} ${t.ampm} ${C.shortDay(istDate(new Date(appt.at)))}`);
        }}
      />
    </Backdrop>
  );
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: glass.deep }}>
      <LinearGradient colors={[glass.glow, glass.mid, glass.deep]} locations={[0, 0.42, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

function BackLink() {
  const nav = useNav();
  return (
    <Pressable onPress={nav.pop} accessibilityRole="button" accessibilityLabel="Back to customers" hitSlop={10}>
      <GT size={13.5} w="bold" c={glass.gold2}>
        ‹ Customers
      </GT>
    </Pressable>
  );
}

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Press onPress={onPress} accessibilityLabel={label} style={{ flex: 1, alignItems: "center", gap: 5, paddingVertical: 13, borderRadius: 18, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line }}>
      <Icon name={icon} color={glass.gold2} size={21} />
      <GT size={13} w="bold">
        {label}
      </GT>
    </Press>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <GlassCard style={{ flex: 1, padding: 11, borderRadius: 18 }}>
      <GT size={11} w="bold" c={glass.faint}>
        {label}
      </GT>
      <GT size={16} w="heavy" c={tone ?? glass.cream} numberOfLines={1} style={{ fontVariant: ["tabular-nums"] }}>
        {value}
      </GT>
      {sub ? (
        <GT size={11} c={glass.soft} numberOfLines={1}>
          {sub}
        </GT>
      ) : null}
    </GlassCard>
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
    <View style={{ gap: 10 }}>
      <GlassCard style={{ paddingHorizontal: 14, paddingVertical: 4 }}>
        <Pressable
          onPress={() => run(() => commit((d) => E.setMarketingConsent(d, { customerId, on: !messagesOn, by })), messagesOn ? "Messages stopped" : "Messages turned on")}
          accessibilityRole="switch"
          accessibilityState={{ checked: messagesOn }}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}
        >
          <View style={{ flex: 1 }}>
            <GT size={14.5} w="bold">
              WhatsApp reminders & offers
            </GT>
            <GT size={12} c={glass.soft}>
              {messagesOn ? "On. Turn off if they reply STOP or ask to stop" : "Off. Turn on only if the customer asks for them"}
            </GT>
          </View>
          <View style={{ width: 44, height: 26, borderRadius: 13, padding: 3, backgroundColor: messagesOn ? glass.ok : "rgba(255,244,236,0.18)", alignItems: messagesOn ? "flex-end" : "flex-start" }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: glass.cream }} />
          </View>
        </Pressable>
        <Pressable
          onPress={() =>
            run(() => {
              const text = commit((d) => E.customerDataExport(d, customerId));
              Linking.openURL(E.whatsappLink(phone, text)).catch(() => {});
            }, "Opening WhatsApp")
          }
          accessibilityRole="button"
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderTopWidth: 1, borderColor: "rgba(255,244,236,0.08)" }}
        >
          <GT size={14.5} w="bold">
            Send them their data
          </GT>
          <GT size={15} c={glass.soft}>
            ›
          </GT>
        </Pressable>
      </GlassCard>
      {guardian ? (
        <GT size={12} c={glass.faint}>
          Under 18 · kept under a parent's or guardian's number with their consent.
        </GT>
      ) : null}
      {isOwner ? (
        <View style={{ gap: 8 }}>
          {wallet.balance > 0 ? (
            <>
              <GT size={12.5} c={glass.soft}>
                {`Before deleting, close the wallet: refund ${inr(wallet.refundable)}${wallet.promotional ? `; ${inr(wallet.promotional)} bonus credit is cancelled` : ""}.`}
              </GT>
              <GlassSwitch
                options={[
                  { key: "CASH", label: "Cash" },
                  { key: "UPI", label: "UPI" },
                  { key: "CARD", label: "Card" },
                ]}
                value={method}
                onChange={setMethod}
              />
              <GhostButton label={`Close wallet · refund ${inr(wallet.refundable)}`} tone="#F08C6A" onPress={() => run(() => commit((d) => E.closeWallet(d, { customerId, method, by: "owner" })), "Wallet closed")} />
            </>
          ) : armed ? (
            <GoldButton
              label={`Tap again to delete ${name.split(" ")[0]}'s data`}
              style={{ backgroundColor: "#F08C6A" }}
              onPress={() =>
                run(() => {
                  commit((d) => E.deleteCustomer(d, { customerId, by: "owner" }));
                  nav.pop();
                }, "Customer data deleted")
              }
            />
          ) : (
            <GhostButton label="Delete customer data" tone="#F08C6A" onPress={() => setArmed(true)} />
          )}
        </View>
      ) : (
        <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
          Wrong bill or a delete request? Ask the owner: only the owner can cancel bills or delete a customer.
        </GT>
      )}
    </View>
  );
}
