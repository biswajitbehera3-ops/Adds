/**
 * Refer & earn (BUILD-SPEC 4.14), brown glass. Opened from a customer's profile (Refer is in
 * the profile, not the bar). Shows their code to copy or share, and who joined with it.
 */
import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { Pressable, Share, TextInput, View } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { GhostButton, GlassCard, GlassScreen, GoldButton, GT, SectionLabel } from "../components/glass";
import { Icon } from "../components/Icon";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import { formatPhone, inr, shortDate } from "../format";
import { useNav } from "../nav/Navigator";
import { glass, urbanist } from "../theme/tokens";

export function Refer({ id }: { id?: string }) {
  const data = useData();
  const nav = useNav();
  const reduced = useReducedMotion();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(id ?? null);
  const results = useMemo(() => (q.trim() ? E.searchCustomers(data, q, 6) : []), [data, q]);
  const p = useMemo(() => (picked ? safeProfile(data, picked) : null), [data, picked]);
  const { referrerReward, newCustomerReward } = config.referral;

  return (
    <GlassScreen title="Refer & earn" back={id ? "Customer" : "Back"} onBack={nav.pop}>
      <GT size={13.5} c={glass.soft}>
        Every customer gets a code on their thank-you WhatsApp. A friend tells the counter that code, or the customer's mobile number. On the friend's first paid visit, the friend gets {inr(newCustomerReward)} and the customer gets {inr(referrerReward)}, added to their wallets automatically.
      </GT>
      {!p ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line }}>
            <Icon name="search" color={glass.soft} size={19} />
            <TextInput value={q} onChangeText={setQ} autoFocus placeholder="Find the customer by name or number" placeholderTextColor={glass.faint} accessibilityLabel="Find customer" style={{ flex: 1, minHeight: 48, fontFamily: urbanist.medium, fontSize: 15.5, color: glass.cream }} />
          </View>
          {results.length ? (
            <GlassCard style={{ overflow: "hidden" }}>
              {results.map((c, i) => (
                <Pressable key={c.id} onPress={() => setPicked(c.id)} accessibilityRole="button" accessibilityLabel={`Show code for ${c.name}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
                  <View style={{ flex: 1 }}>
                    <GT size={15} w="bold">
                      {c.name}
                    </GT>
                    <GT size={12} c={glass.soft}>
                      {formatPhone(c.phone)}
                    </GT>
                  </View>
                  <GT size={15} c={glass.soft}>
                    ›
                  </GT>
                </Pressable>
              ))}
            </GlassCard>
          ) : q.trim() ? (
            <GT size={14} c={glass.soft}>
              No customer matches “{q}”.
            </GT>
          ) : null}
        </>
      ) : (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(240)} style={{ gap: 12 }}>
          <CodeCard name={p.name} code={p.referralCode} link={p.referralLink} />
          {!id ? (
            <Pressable onPress={() => (setPicked(null), setQ(""))} accessibilityRole="button" style={{ alignSelf: "center" }} hitSlop={8}>
              <GT size={13.5} w="bold" c={glass.gold2}>
                Choose another customer
              </GT>
            </Pressable>
          ) : null}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <SectionLabel>Their referrals</SectionLabel>
            <GT size={12} c={glass.soft}>
              {p.referrals.filter((r) => r.referralRewardedAt).length} rewarded
            </GT>
          </View>
          <GlassCard style={{ overflow: "hidden" }}>
            {p.referrals.length ? (
              p.referrals.map((r, i) => (
                <View key={r.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderColor: "rgba(255,244,236,0.08)" }}>
                  <View style={{ flex: 1 }}>
                    <GT size={15} w="bold">
                      {r.name}
                    </GT>
                    <GT size={12} c={glass.soft}>
                      Joined {shortDate(r.createdAt)}
                    </GT>
                  </View>
                  <GT size={12.5} w="bold" c={r.referralRewardedAt ? glass.ok : glass.gold2}>
                    {r.referralRewardedAt ? `+${inr(referrerReward)} paid` : "Waiting for first visit"}
                  </GT>
                </View>
              ))
            ) : (
              <GT size={14} c={glass.soft} style={{ padding: 14 }}>
                No one has joined with this code yet.
              </GT>
            )}
          </GlassCard>
        </Animated.View>
      )}
    </GlassScreen>
  );
}

function safeProfile(data: ReturnType<typeof useData>, id: string) {
  try {
    return E.getProfile(data, id);
  } catch {
    return null;
  }
}

function CodeCard({ name, code, link }: { name: string; code: string; link: string }) {
  const toast = useToast();
  const message = `Join me at ${config.displayName}! Use my code ${code} on your first visit and we both get wallet credit. ${link}`;
  return (
    <View style={{ padding: 20, borderRadius: 24, alignItems: "center", gap: 10, backgroundColor: "rgba(228,166,123,0.18)", borderWidth: 1, borderColor: "rgba(228,166,123,0.5)" }}>
      <GT size={13} c={glass.soft}>
        {name.split(" ")[0]}'s code
      </GT>
      <GT size={38} w="heavy" selectable style={{ letterSpacing: 5, lineHeight: 46 }}>
        {code}
      </GT>
      <GT size={12} c={glass.soft} selectable numberOfLines={1}>
        {link}
      </GT>
      <View style={{ flexDirection: "row", gap: 8, alignSelf: "stretch", marginTop: 4 }}>
        <GhostButton
          label="Copy"
          style={{ flex: 1 }}
          onPress={async () => {
            await Clipboard.setStringAsync(message).catch(() => {});
            toast("Invite copied");
          }}
        />
        <GoldButton
          label="Share"
          style={{ flex: 1, paddingVertical: 12 }}
          onPress={async () => {
            try {
              await Share.share({ message });
            } catch {
              await Clipboard.setStringAsync(message).catch(() => {});
              toast("Sharing isn't available here, so the invite was copied");
            }
          }}
        />
      </View>
    </View>
  );
}
