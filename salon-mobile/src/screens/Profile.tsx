import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Press } from "../components/Press";
import { Rule, Screen, SectionTitle } from "../components/Screen";
import { Seal } from "../components/Seal";
import { Segmented } from "../components/Segmented";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import type { WalletTx } from "../domain/types";
import { formatPhone, inr, relativeDays, shortDate } from "../format";
import { useNav } from "../nav/Navigator";
import { color, font, space } from "../theme/tokens";

const TX_LABEL: Record<WalletTx["type"], string> = { TOPUP: "Top-up", BONUS: "Top-up bonus", SPEND: "Paid for visit", REFERRAL_REWARD: "Referral reward" };

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

      <Press
        onPress={async () => {
          await Clipboard.setStringAsync(p.referralCode).catch(() => {});
          toast("Referral code copied");
        }}
        accessibilityLabel={`Referral code ${p.referralCode}. Copy.`}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.lg, paddingVertical: space.sm }}
      >
        <View>
          <T v="small" c={color.inkMuted}>
            Referral code
          </T>
          <T style={{ fontFamily: font.display, fontSize: 22, letterSpacing: 2 }}>{p.referralCode}</T>
        </View>
        <Icon name="copy" color={color.seal} />
      </Press>
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
              const s = config.services.find((x) => x.id === v.serviceId);
              const st = config.staff.find((x) => x.id === v.staffId);
              const extras = v.addOnIds.map((a) => config.addOns.find((x) => x.id === a)?.name).filter(Boolean);
              return (
                <View key={v.id}>
                  {i > 0 ? <Rule /> : null}
                  <View style={{ flexDirection: "row", paddingVertical: space.md, gap: space.md }}>
                    <View style={{ flex: 1 }}>
                      <T v="bodyStrong">{s?.name ?? v.serviceId}</T>
                      <T v="small" c={color.inkMuted}>
                        {[shortDate(v.createdAt), st?.name, ...extras].join(" · ")}
                      </T>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <T v="bodyStrong" style={{ fontVariant: ["tabular-nums"] }}>
                        {inr(v.total)}
                      </T>
                      <T v="small" c={color.inkMuted}>
                        {v.walletPaid === v.total ? "wallet" : v.walletPaid ? "wallet + " + v.paymentMethod.toLowerCase() : v.paymentMethod === "UPI" ? "UPI" : v.paymentMethod.toLowerCase()}
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
