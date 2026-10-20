import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GT } from "../components/glass";
import { Icon } from "../components/Icon";
import { Press } from "../components/Press";
import { T } from "../components/T";
import * as C from "../domain/calendar";
import * as E from "../domain/engine";
import { istDate } from "../domain/rules";
import { useData } from "../domain/store";
import type { Customer } from "../domain/types";
import { formatPhone, inr, shortDate } from "../format";
import { useNav } from "../nav/Navigator";
import { color, font, glass, space, urbanist } from "../theme/tokens";
import { useCurrentStaff } from "./Attendance";

type Row = ReturnType<typeof E.customerDirectory>["rows"][number];
const SORTS: { key: E.CustomerSort; label: string }[] = [
  { key: "spend", label: "Highest spending" },
  { key: "recent", label: "Recent visit" },
  { key: "name", label: "Name A–Z" },
];
const AVATAR = ["#E4A67B", "#F3E6D8", "#B98E78", "#D9B79E", "#C99A7E"];

/**
 * Customers tab (BUILD-SPEC 4.17), brown glass: every customer of the salon with their
 * spending, for staff and owner alike. Reminders to do sit on top; "My customers" narrows
 * it to the ones this stylist has served.
 */
export function Customers() {
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<E.CustomerFilter>("all");
  const [sort, setSort] = useState<E.CustomerSort>("spend");
  const { rows, counts } = useMemo(() => E.customerDirectory(data, { q, filter, sort, staffId: me?.id ?? null }), [data, q, filter, sort, me]);
  const toRemind = useMemo(() => E.overdueReminders(data).filter((r) => E.reminderIsMine(r, me?.id ?? null)).length, [data, me]);
  const today = new Date();
  const filters: { key: E.CustomerFilter; label: string }[] = [
    { key: "all", label: "All" },
    ...(me ? [{ key: "mine" as const, label: `My customers · ${counts.mine}` }] : []),
    { key: "top", label: "⭐ Top spenders" },
    { key: "regular", label: "Regulars" },
    { key: "lapsed", label: "Not seen 30+" },
    { key: "wallet", label: "Wallet balance" },
    { key: "new", label: "New" },
  ];

  const header = (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <Pressable onPress={nav.pop} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}>
        <GT size={13.5} w="semibold" c={glass.soft}>
          ‹ {me ? `${me.name.split(" ")[0]} · ` : ""}
          {C.shortDay(istDate(today))}
        </GT>
      </Pressable>
      <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34 }}>
        Customers
      </GT>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line }}>
        <Icon name="search" color={glass.soft} size={19} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search name or mobile"
          placeholderTextColor={glass.faint}
          accessibilityLabel="Search customers"
          autoCorrect={false}
          selectionColor={glass.gold}
          style={{ flex: 1, minHeight: 48, fontFamily: urbanist.medium, fontSize: 16, color: glass.cream }}
        />
      </View>
      {toRemind ? (
        <Press onPress={() => nav.push({ name: "reminders" })} accessibilityLabel={`${toRemind} reminders to do. Open`} scaleTo={0.985}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 20, backgroundColor: "rgba(228,166,123,0.2)", borderWidth: 1, borderColor: "rgba(228,166,123,0.5)" }}>
            <View>
              <GT size={11.5} w="heavy" c={glass.gold2} style={{ letterSpacing: 1, textTransform: "uppercase" }}>
                Reminders to do
              </GT>
              <GT size={16} w="heavy">
                {toRemind} customer{toRemind === 1 ? "" : "s"} to remind
              </GT>
            </View>
            <View style={{ backgroundColor: glass.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
              <GT size={14} w="heavy" c={glass.ink}>
                Open
              </GT>
            </View>
          </View>
        </Press>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map((f) => {
          const on = f.key === filter;
          return (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? glass.gold : glass.card, borderWidth: 1, borderColor: on ? glass.gold : glass.line }}>
              <GT size={13} w="bold" c={on ? glass.ink : glass.soft}>
                {f.label}
              </GT>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <GT size={12} w="heavy" c={glass.soft} style={{ letterSpacing: 1.2 }}>
          {q || filter !== "all" ? `${rows.length} OF ${counts.all}` : `${counts.all} CUSTOMERS`}
          {filter === "all" && !q ? ` · ${counts.newThisMonth} NEW · ${counts.lapsed} NOT SEEN 30+` : ""}
        </GT>
        {filter !== "top" ? (
          <Pressable
            onPress={() => setSort((s) => SORTS[(SORTS.findIndex((x) => x.key === s) + 1) % SORTS.length].key)}
            accessibilityRole="button"
            accessibilityLabel={`Sort: ${SORTS.find((x) => x.key === sort)!.label}. Change`}
            style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "rgba(228,166,123,0.6)" }}
          >
            <GT size={12.5} w="bold" c={glass.gold2}>
              Sort: {SORTS.find((x) => x.key === sort)!.label} ▾
            </GT>
          </Pressable>
        ) : (
          <GT size={12} c={glass.faint}>
            Top {rows.length} by spending
          </GT>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: glass.deep }}>
      <LinearGradient colors={[glass.glow, glass.mid, glass.deep]} locations={[0, 0.42, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: insets.bottom + 40 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={reduced || q || index > 8 ? undefined : FadeInDown.duration(300).delay(index * 30)}>
            <GlassCustomerRow r={item} first={index === 0} last={index === rows.length - 1} index={index} rank={filter === "top" ? index + 1 : undefined} />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={{ paddingVertical: 32, gap: 6 }}>
            <GT size={18} w="heavy">
              {q ? `No one matches “${q}”` : "No customers here yet"}
            </GT>
            <GT size={14} c={glass.soft}>
              {q ? "Check the spelling, or add them at the counter when they visit." : "Try another filter."}
            </GT>
          </View>
        }
      />
    </View>
  );
}

function lastSeen(r: Row): string {
  if (!r.lastVisitAt) return "No visits yet";
  const d = r.daysSinceLast ?? 0;
  return d <= 0 ? "Today" : d === 1 ? "Yesterday" : shortDate(r.lastVisitAt);
}

function GlassCustomerRow({ r, first, last, index, rank }: { r: Row; first: boolean; last: boolean; index: number; rank?: number }) {
  const nav = useNav();
  const ref = useRef<View>(null);
  const initials = r.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const tag =
    r.tag === "regular"
      ? { text: "Regular", fg: glass.gold2, bg: "rgba(228,166,123,0.16)" }
      : r.tag === "lapsed"
        ? { text: `Not seen ${r.daysSinceLast} days`, fg: "#F0A86A", bg: "rgba(240,168,106,0.16)" }
        : r.tag === "new"
          ? { text: "New", fg: glass.ok, bg: "rgba(143,214,164,0.16)" }
          : null;
  return (
    <Press
      onPress={() => nav.push({ name: "profile", id: r.id }, { from: ref, fromColor: glass.mid, toColor: glass.deep })}
      accessibilityLabel={`${r.name}, spent ${inr(r.spent)}, ${r.visits} visits${r.walletBalance ? `, wallet ${inr(r.walletBalance)}` : ""}`}
      scaleTo={0.985}
    >
      <View
        ref={ref}
        collapsable={false}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: glass.card,
          borderColor: glass.line,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderTopWidth: first ? 1 : 0,
          borderBottomWidth: last ? 1 : 0,
          borderTopLeftRadius: first ? 20 : 0,
          borderTopRightRadius: first ? 20 : 0,
          borderBottomLeftRadius: last ? 20 : 0,
          borderBottomRightRadius: last ? 20 : 0,
        }}
      >
        {!first ? <View style={{ position: "absolute", top: 0, left: 14, right: 14, height: 1, backgroundColor: "rgba(255,244,236,0.08)" }} /> : null}
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: AVATAR[index % AVATAR.length], alignItems: "center", justifyContent: "center" }}>
          <GT size={14} w="heavy" c={glass.ink}>
            {rank ? `#${rank}` : initials}
          </GT>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <GT size={15.5} w="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
              {r.name}
            </GT>
            {tag ? (
              <View style={{ paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, backgroundColor: tag.bg }}>
                <GT size={10.5} w="heavy" c={tag.fg}>
                  {tag.text}
                </GT>
              </View>
            ) : null}
          </View>
          <GT size={12.5} c={glass.soft} numberOfLines={1}>
            {lastSeen(r)}
            {r.lastStylist ? ` · ${r.lastStylist.split(" ")[0]}` : ""} · {r.visits} visit{r.visits === 1 ? "" : "s"}
          </GT>
        </View>
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          <GT size={15.5} w="heavy" style={{ fontVariant: ["tabular-nums"] }}>
            {inr(r.spent)}
          </GT>
          {r.walletBalance ? (
            <GT size={11.5} w="bold" c={glass.gold2}>
              Wallet {inr(r.walletBalance)}
            </GT>
          ) : null}
        </View>
      </View>
    </Press>
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
