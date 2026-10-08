import { useMemo, useRef, useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { Press } from "../components/Press";
import { Rule, Screen } from "../components/Screen";
import { T } from "../components/T";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import type { Customer } from "../domain/types";
import { formatPhone, inr } from "../format";
import { useNav } from "../nav/Navigator";
import { color, font, radius, space } from "../theme/tokens";

export function Customers() {
  const data = useData();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const list = useMemo(() => E.searchCustomers(data, q, 200), [data, q]);
  return (
    <Screen title="Customers" scroll={false}>
      <View style={{ padding: space.lg, paddingBottom: space.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, borderWidth: 1.25, borderColor: color.choc, borderRadius: radius.control, paddingHorizontal: space.md, backgroundColor: color.paperLight }}>
          <Icon name="search" color={color.inkMuted} size={20} />
          <TextInput
            selectionColor={color.seal}
            cursorColor={color.seal}
            value={q}
            onChangeText={setQ}
            placeholder="Name, number or referral code"
            placeholderTextColor="#9C806C"
            accessibilityLabel="Search customers"
            autoCorrect={false}
            style={{ flex: 1, minHeight: 52, fontFamily: font.medium, fontSize: 16.5, color: color.ink }}
          />
        </View>
        <T v="small" c={color.inkMuted} style={{ marginTop: space.sm }}>
          {q ? `${list.length} ${list.length === 1 ? "match" : "matches"}` : `${data.customers.length} customers, newest first`}
        </T>
      </View>
      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xxxl }}
        ItemSeparatorComponent={Rule}
        renderItem={({ item }) => <CustomerRow c={item} />}
        ListEmptyComponent={
          <View style={{ paddingVertical: space.xxl, gap: space.xs }}>
            <T v="heading">No one matches “{q}”</T>
            <T v="body" c={color.inkMuted}>
              Check the spelling, or add them at the Counter when they visit.
            </T>
          </View>
        }
      />
    </Screen>
  );
}

export function CustomerRow({ c, aside }: { c: Pick<Customer, "id" | "name" | "phone" | "walletBalance">; aside?: string }) {
  const nav = useNav();
  const ref = useRef<View>(null);
  return (
    <Press onPress={() => nav.push({ name: "profile", id: c.id }, { from: ref, fromColor: color.paperPressed })} accessibilityLabel={`${c.name}, wallet ${inr(c.walletBalance)}`} scaleTo={0.985}>
      <View ref={ref} collapsable={false} style={{ flexDirection: "row", alignItems: "center", paddingVertical: space.md, gap: space.md, minHeight: 64 }}>
        <Monogram name={c.name} />
        <View style={{ flex: 1 }}>
          <T v="bodyStrong" numberOfLines={1}>
            {c.name}
          </T>
          <T v="small" c={color.inkMuted}>
            {aside ?? formatPhone(c.phone)}
          </T>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <T style={{ fontFamily: font.display, fontSize: 17, fontVariant: ["tabular-nums"] }} c={c.walletBalance ? color.seal : color.inkMuted}>
            {inr(c.walletBalance)}
          </T>
          <T v="small" c={color.inkMuted}>
            wallet
          </T>
        </View>
      </View>
    </Press>
  );
}

export function Monogram({ name, size = 40, dark }: { name: string; size?: number; dark?: boolean }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size * 0.78,
        borderRadius: size,
        borderWidth: 1.25,
        borderColor: dark ? color.creamMuted : color.choc,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <T style={{ fontFamily: font.display, fontSize: size * 0.38, lineHeight: size * 0.5 }} c={dark ? color.cream : color.ink}>
        {initials}
      </T>
    </View>
  );
}
