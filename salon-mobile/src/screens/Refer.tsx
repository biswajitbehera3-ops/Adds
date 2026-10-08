import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { Share, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Ellipse } from "react-native-svg";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { LabelFrame } from "../components/LabelFrame";
import { Press } from "../components/Press";
import { Rule, Screen, SectionTitle } from "../components/Screen";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import { formatPhone, inr, shortDate } from "../format";
import { color, font, radius, space } from "../theme/tokens";
import { Monogram } from "./Customers";

export function Refer({ id }: { id?: string }) {
  const data = useData();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(id ?? null);
  const results = useMemo(() => (q.trim() ? E.searchCustomers(data, q, 6) : []), [data, q]);
  const p = useMemo(() => (picked ? safeProfile(data, picked) : null), [data, picked]);
  const { referrerReward, newCustomerReward } = config.referral;

  return (
    <Screen title="Refer & Earn">
      <T v="body" c={color.inkMuted}>
        A friend joins with a customer's code. On the friend's first paid visit, the friend gets {inr(newCustomerReward)} and the customer gets {inr(referrerReward)} — added to their wallets automatically.
      </T>

      {!p ? (
        <View style={{ marginTop: space.xl, gap: space.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, borderWidth: 1.25, borderColor: color.choc, borderRadius: radius.control, paddingHorizontal: space.md, backgroundColor: color.paperLight }}>
            <Icon name="search" color={color.inkMuted} size={20} />
            <TextInput
              selectionColor={color.seal}
              cursorColor={color.seal}
              value={q}
              onChangeText={setQ}
              autoFocus
              placeholder="Find the customer by name or number"
              placeholderTextColor="#9C806C"
              accessibilityLabel="Find customer"
              style={{ flex: 1, minHeight: 52, fontFamily: font.medium, fontSize: 16.5, color: color.ink }}
            />
          </View>
          {results.map((c, i) => (
            <View key={c.id}>
              {i > 0 ? <Rule /> : null}
              <Press onPress={() => setPicked(c.id)} scaleTo={0.985} accessibilityLabel={`Show code for ${c.name}`} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md }}>
                <Monogram name={c.name} />
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">{c.name}</T>
                  <T v="small" c={color.inkMuted}>
                    {formatPhone(c.phone)}
                  </T>
                </View>
                <Icon name="chevron" color={color.inkMuted} size={20} />
              </Press>
            </View>
          ))}
          {q.trim() && !results.length ? (
            <T v="body" c={color.inkMuted}>
              No customer matches “{q}”.
            </T>
          ) : null}
        </View>
      ) : (
        <Animated.View entering={FadeIn.duration(240)}>
          <CodeCard name={p.name} code={p.referralCode} link={p.referralLink} />
          <Press onPress={() => (setPicked(null), setQ(""))} style={{ alignSelf: "center", minHeight: 48, justifyContent: "center", marginTop: space.sm }}>
            <T v="bodyStrong" c={color.seal}>
              Choose another customer
            </T>
          </Press>

          <SectionTitle aside={<T v="small" c={color.inkMuted}>{`${p.referrals.filter((r) => r.referralRewardedAt).length} rewarded`}</T>}>Their referrals</SectionTitle>
          {p.referrals.length ? (
            p.referrals.map((r, i) => (
              <View key={r.id}>
                {i > 0 ? <Rule /> : null}
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: space.md, gap: space.md }}>
                  <View style={{ flex: 1 }}>
                    <T v="bodyStrong">{r.name}</T>
                    <T v="small" c={color.inkMuted}>
                      Joined {shortDate(r.createdAt)}
                    </T>
                  </View>
                  <T v="small" c={r.referralRewardedAt ? color.positive : color.seal}>
                    {r.referralRewardedAt ? `+${inr(referrerReward)} paid` : "Waiting for first visit"}
                  </T>
                </View>
              </View>
            ))
          ) : (
            <T v="body" c={color.inkMuted}>
              No one has joined with this code yet.
            </T>
          )}
        </Animated.View>
      )}
    </Screen>
  );
}

function safeProfile(data: ReturnType<typeof useData>, id: string) {
  try {
    return E.getProfile(data, id);
  } catch {
    return null;
  }
}

/** The referral code as a printed coupon: chocolate label, the code set large between two seals. */
function CodeCard({ name, code, link }: { name: string; code: string; link: string }) {
  const toast = useToast();
  const message = `Join me at ${config.displayName}! Use my code ${code} on your first visit and we both get wallet credit. ${link}`;
  return (
    <LabelFrame ground={color.choc} ink={color.creamMuted} style={{ marginTop: space.xl }} innerStyle={{ padding: space.xl, alignItems: "center", gap: space.md }}>
      <T v="body" c={color.creamMuted}>
        {name.split(" ")[0]}'s code
      </T>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <Dot />
        <T selectable style={{ fontFamily: font.display, fontSize: 40, lineHeight: 50, letterSpacing: 4 }} c={color.cream}>
          {code}
        </T>
        <Dot />
      </View>
      <T v="small" c={color.creamMuted} selectable numberOfLines={1}>
        {link}
      </T>
      <View style={{ flexDirection: "row", gap: space.sm, alignSelf: "stretch", marginTop: space.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            kind="outlineCream"
            label="Copy"
            icon="copy"
            onPress={async () => {
              await Clipboard.setStringAsync(message).catch(() => {});
              toast("Invite copied");
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Share"
            icon="share"
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
    </LabelFrame>
  );
}

function Dot() {
  return (
    <Svg width={14} height={10}>
      <Ellipse cx={7} cy={5} rx={6.5} ry={4.5} fill={color.seal} />
    </Svg>
  );
}
