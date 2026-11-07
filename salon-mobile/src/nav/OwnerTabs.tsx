/**
 * The owner's bottom bar (BUILD-SPEC 6.1): Live · Earnings · Staff · Customers.
 * Same mechanics as the staff bar: tabs stay mounted once opened, switches are instant,
 * and each tab screen draws the dock itself so its sheets cover it.
 */
import { createContext, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GT } from "../components/glass";
import { Icon, type IconName } from "../components/Icon";
import { Press } from "../components/Press";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import { Customers } from "../screens/Customers";
import { Earnings } from "../screens/owner/Earnings";
import { Live } from "../screens/owner/Live";
import { StaffTab } from "../screens/owner/Staff";
import { glass } from "../theme/tokens";

export type OwnerTab = "live" | "earnings" | "staff" | "customers";
type Tabs = { tab: OwnerTab; go: (t: OwnerTab) => void };
const Ctx = createContext<Tabs | null>(null);

/** The owner's tab bar, when the screen is one of the owner tabs; null otherwise. */
export const useOwnerTabs = () => useContext(Ctx);

export function OwnerTabs() {
  const [tab, setTab] = useState<OwnerTab>("live");
  const [seen, setSeen] = useState<Set<OwnerTab>>(() => new Set(["live"]));
  const value = useMemo(
    () => ({
      tab,
      go: (t: OwnerTab) => {
        setSeen((s) => (s.has(t) ? s : new Set(s).add(t)));
        setTab(t);
      },
    }),
    [tab],
  );
  const screens: Record<OwnerTab, React.ReactNode> = { live: <Live />, earnings: <Earnings />, staff: <StaffTab />, customers: <Customers /> };
  return (
    <Ctx.Provider value={value}>
      {(Object.keys(screens) as OwnerTab[]).map((k) =>
        seen.has(k) ? (
          <View key={k} style={[StyleSheet.absoluteFill, { display: k === tab ? "flex" : "none" }]} accessibilityElementsHidden={k !== tab} importantForAccessibility={k === tab ? "auto" : "no-hide-descendants"}>
            {screens[k]}
          </View>
        ) : null,
      )}
    </Ctx.Provider>
  );
}

/** The owner's dock. Rendered by each owner tab screen; draws nothing outside the owner tabs. */
export function OwnerDock() {
  const tabs = useOwnerTabs();
  const data = useData();
  const insets = useSafeAreaInsets();
  const waiting = E.leaveRequestsWaiting(data).length;
  if (!tabs) return null;
  const item = (k: OwnerTab, icon: IconName, label: string, badge?: number) => {
    const on = tabs.tab === k;
    return (
      <Press
        key={k}
        onPress={() => tabs.go(k)}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        accessibilityLabel={`${label}${badge ? `, ${badge} waiting` : ""}`}
        scaleTo={0.94}
        style={{ flex: 1, alignItems: "center", gap: 3, paddingVertical: 7, borderRadius: 16, backgroundColor: on ? glass.gold : "transparent" }}
      >
        <View>
          <Icon name={icon} color={on ? glass.ink : glass.soft} size={20} />
          {badge ? (
            <View style={{ position: "absolute", top: -5, right: -11, minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 9, backgroundColor: "#F08C6A", alignItems: "center", justifyContent: "center" }}>
              <GT size={10} w="heavy" c="#2a1210">
                {badge > 99 ? "99+" : badge}
              </GT>
            </View>
          ) : null}
        </View>
        <GT size={10.5} w={on ? "heavy" : "semibold"} c={on ? glass.ink : glass.soft}>
          {label}
        </GT>
      </Press>
    );
  };
  return (
    <View
      accessibilityRole="tablist"
      style={{ position: "absolute", left: 14, right: 14, bottom: insets.bottom + 12, flexDirection: "row", padding: 7, borderRadius: 24, backgroundColor: "rgba(38,22,17,0.94)", borderWidth: 1, borderColor: glass.line, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
    >
      {item("live", "live", "Live")}
      {item("earnings", "rupee", "Earnings")}
      {item("staff", "staff", "Staff", waiting)}
      {item("customers", "customers", "Customers")}
    </View>
  );
}
