import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { Button } from "../components/Button";
import { LabelFrame } from "../components/LabelFrame";
import { NumberRoll } from "../components/NumberRoll";
import { Rule, Screen, SectionTitle } from "../components/Screen";
import { Segmented } from "../components/Segmented";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import * as E from "../domain/engine";
import { clearAll, resetToDemo, useData } from "../domain/store";
import { inr } from "../format";
import { color, font, radius, space } from "../theme/tokens";
import { CustomerRow } from "./Customers";

const SPLIT = [
  { key: "cash", label: "Cash", color: color.choc },
  { key: "upi", label: "UPI", color: color.choc600 },
  { key: "card", label: "Card", color: "#9A7B63" },
  { key: "wallet", label: "Wallet", color: color.seal },
] as const;

export function Dashboard() {
  const data = useData();
  const [range, setRange] = useState<E.Range>("today");
  const d = useMemo(() => E.ownerDashboard(data, range), [data, range]);
  const maxStaff = Math.max(1, ...d.byStaff.map((s) => s.revenue));
  const splitTotal = d.today.cash + d.today.upi + d.today.card + d.today.wallet;

  return (
    <Screen title="Dashboard">
      <LabelFrame innerStyle={{ padding: space.xl, gap: space.md }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View>
            <T v="small" c={color.inkMuted}>
              Today's takings
            </T>
            <NumberRoll value={d.today.total} style={{ fontSize: 40, lineHeight: 50 }} duration={900} />
          </View>
          <T v="small" c={color.inkMuted} style={{ marginBottom: 8 }}>
            {d.today.visits} {d.today.visits === 1 ? "visit" : "visits"}
          </T>
        </View>
        {splitTotal > 0 ? (
          <>
            <GrowBar>
              <View style={{ flexDirection: "row", height: 14, borderRadius: 3, overflow: "hidden", gap: 2 }}>
                {SPLIT.map((s) => (d.today[s.key] > 0 ? <View key={s.key} style={{ flex: d.today[s.key], backgroundColor: s.color }} /> : null))}
              </View>
            </GrowBar>
            <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: space.sm }}>
              {SPLIT.map((s) => (
                <View key={s.key} style={{ width: "50%", flexDirection: "row", alignItems: "center", gap: space.sm }}>
                  <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: s.color }} />
                  <T v="small" c={color.inkMuted}>
                    {s.label}
                  </T>
                  <T v="bodyStrong" style={{ fontVariant: ["tabular-nums"] }}>
                    {inr(d.today[s.key])}
                  </T>
                </View>
              ))}
            </View>
          </>
        ) : (
          <T v="body" c={color.inkMuted}>
            No visits logged yet today.
          </T>
        )}
      </LabelFrame>

      <SectionTitle>By stylist</SectionTitle>
      <Segmented
        label="Period"
        value={range}
        onChange={setRange}
        options={[
          { key: "today", label: "Today" },
          { key: "7d", label: "7 days" },
          { key: "30d", label: "30 days" },
        ]}
      />
      <View style={{ gap: space.lg, marginTop: space.lg }}>
        {d.byStaff.map((s, i) => (
          <View key={s.staffId} style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
              <T v="bodyStrong">
                {s.name} <T v="small" c={color.inkMuted}>{`· ${s.chair}`}</T>
              </T>
              <T style={{ fontFamily: font.display, fontSize: 18, fontVariant: ["tabular-nums"] }}>{inr(s.revenue)}</T>
            </View>
            <View style={{ height: 10, borderRadius: 2, backgroundColor: color.paperPressed, overflow: "hidden" }}>
              <GrowBar key={`${range}-${s.revenue}`} delay={i * 70}>
                <View style={{ height: 10, width: `${(s.revenue / maxStaff) * 100}%`, backgroundColor: i === 0 && s.revenue ? color.seal : color.choc }} />
              </GrowBar>
            </View>
            <T v="small" c={color.inkMuted}>
              {s.visits} {s.visits === 1 ? "visit" : "visits"}
            </T>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: space.md, marginTop: space.xl }}>
        <View style={{ flex: 1, padding: space.lg, borderRadius: radius.label, backgroundColor: color.choc, gap: 2 }}>
          <T v="small" c={color.creamMuted}>
            Wallet money held
          </T>
          <NumberRoll value={d.walletLiability} c={color.cream} style={{ fontSize: 24 }} />
          <T v="small" c={color.creamMuted}>
            owed as future visits
          </T>
        </View>
        <View style={{ flex: 1, padding: space.lg, borderRadius: radius.label, borderWidth: 1.25, borderColor: color.choc, gap: 2 }}>
          <T v="small" c={color.inkMuted}>
            Customers
          </T>
          <NumberRoll value={d.customerCount} rupees={false} style={{ fontSize: 24 }} />
          <T v="small" c={color.inkMuted}>
            on file
          </T>
        </View>
      </View>

      <SectionTitle aside={<T v="small" c={color.inkMuted}>lifetime spend</T>}>Top 20 customers</SectionTitle>
      {d.topCustomers.map((c, i) => (
        <View key={c.id}>
          {i > 0 ? <Rule /> : null}
          <CustomerRow c={c} aside={`#${i + 1} · ${inr(c.lifetimeSpend)} over ${c.visits} visits`} />
        </View>
      ))}

      <DataControls demo={data.demo} />
    </Screen>
  );
}

/** Grows its child from the left edge once (ease-out-expo, 700ms). */
function GrowBar({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) p.value = withDelay(180 + delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) }));
  }, [p, reduced, delay]);
  const s = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, p.value) }] }));
  return <Animated.View style={[{ transformOrigin: "left" }, s]}>{children}</Animated.View>;
}

function DataControls({ demo }: { demo: boolean }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState<"clear" | "demo" | null>(null);
  return (
    <View style={{ marginTop: space.xxl, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: color.ruleSoft, gap: space.sm }}>
      <T v="heading">Data on this phone</T>
      <T v="small" c={color.inkMuted}>
        {demo ? "You're looking at demo data. Clear it before the salon starts using the app." : "All customer data lives only on this phone."}
      </T>
      {confirm ? (
        <View style={{ gap: space.sm }}>
          <T v="bodyStrong" c={color.danger}>
            {confirm === "clear" ? "Delete every customer, visit and wallet on this phone? This can't be undone." : "Replace everything with demo data? Real data will be lost."}
          </T>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Button kind="outline" label="Keep data" onPress={() => setConfirm(null)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                kind="ink"
                label={confirm === "clear" ? "Delete all" : "Load demo"}
                onPress={() => {
                  if (confirm === "clear") clearAll();
                  else resetToDemo();
                  toast(confirm === "clear" ? "All data cleared" : "Demo data loaded");
                  setConfirm(null);
                }}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: space.sm }}>
          <View style={{ flex: 1 }}>
            <Button kind="outline" label="Clear all data" onPress={() => setConfirm("clear")} />
          </View>
          <View style={{ flex: 1 }}>
            <Button kind="ghost" label="Load demo" onPress={() => setConfirm("demo")} />
          </View>
        </View>
      )}
    </View>
  );
}
