/**
 * The stylist's bottom bar (BUILD-SPEC 4.9): Home · Customers · gold + (customer walked in) ·
 * Calendar · Profile. Each tab stays mounted once opened, so switching back keeps its place.
 * Tab switches are instant on purpose: staff switch tabs all day (MOTION.md, frequency rule).
 * Each tab screen draws the dock itself, under its own sheets, so a sheet always covers it.
 */
import { createContext, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GT } from "../components/glass";
import { Icon, type IconName } from "../components/Icon";
import { Press } from "../components/Press";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import { Calendar } from "../screens/Calendar";
import { useCurrentStaff } from "../screens/Attendance";
import { Customers } from "../screens/Customers";
import { Home } from "../screens/Home";
import { MyProfile } from "../screens/Me";
import { glass } from "../theme/tokens";
import { useNav } from "./Navigator";

export type StaffTab = "home" | "customers" | "calendar" | "me";
type Tabs = { tab: StaffTab; go: (t: StaffTab) => void };
const Ctx = createContext<Tabs | null>(null);

/** The tab bar, when the screen is one of the staff tabs; null when it was pushed on its own. */
export const useStaffTabs = () => useContext(Ctx);

/** Height the dock covers at the bottom of a tab screen, for its scroll padding. */
export const DOCK_SPACE = 96;

export function StaffTabs() {
  const [tab, setTab] = useState<StaffTab>("home");
  const [seen, setSeen] = useState<Set<StaffTab>>(() => new Set(["home"]));
  const value = useMemo(
    () => ({
      tab,
      go: (t: StaffTab) => {
        setSeen((s) => (s.has(t) ? s : new Set(s).add(t)));
        setTab(t);
      },
    }),
    [tab],
  );
  const screens: Record<StaffTab, React.ReactNode> = { home: <Home />, customers: <Customers />, calendar: <Calendar />, me: <MyProfile /> };
  return (
    <Ctx.Provider value={value}>
      {(Object.keys(screens) as StaffTab[]).map((k) =>
        seen.has(k) ? (
          <View key={k} style={[StyleSheet.absoluteFill, { display: k === tab ? "flex" : "none" }]} accessibilityElementsHidden={k !== tab} importantForAccessibility={k === tab ? "auto" : "no-hide-descendants"}>
            {screens[k]}
          </View>
        ) : null,
      )}
    </Ctx.Provider>
  );
}

/** The dock. Rendered by each tab screen; draws nothing outside the tabs. */
export function StaffDock() {
  const tabs = useStaffTabs();
  const nav = useNav();
  const data = useData();
  const me = useCurrentStaff();
  const insets = useSafeAreaInsets();
  const toRemind = useMemo(() => E.overdueReminders(data).filter((r) => E.reminderIsMine(r, me?.id ?? null)).length, [data, me]);
  const updates = me ? E.leaveUpdates(data, me.id).length : 0;
  if (!tabs) return null;
  const item = (k: StaffTab, icon: IconName, label: string, badge?: number) => {
    const on = tabs.tab === k;
    return (
      <Press
        key={k}
        onPress={() => tabs.go(k)}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        accessibilityLabel={`${label}${badge ? `, ${badge} new` : ""}`}
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
      style={{ position: "absolute", left: 14, right: 14, bottom: insets.bottom + 12, flexDirection: "row", alignItems: "flex-end", padding: 7, borderRadius: 24, backgroundColor: "rgba(38,22,17,0.94)", borderWidth: 1, borderColor: glass.line, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
    >
      {item("home", "home", "Home")}
      {item("customers", "customers", "Customers", toRemind)}
      <View style={{ flex: 1, alignItems: "center" }}>
        <Press
          onPress={() => nav.push({ name: "counter" })}
          accessibilityLabel="Customer walked in: enter their mobile number"
          scaleTo={0.92}
          style={{ width: 54, height: 54, marginTop: -28, borderRadius: 27, backgroundColor: glass.gold, alignItems: "center", justifyContent: "center", borderWidth: 6, borderColor: "rgba(38,22,17,0.94)" }}
        >
          <Icon name="plus" color={glass.ink} size={24} strokeWidth={2.6} />
        </Press>
      </View>
      {item("calendar", "calendar", "Calendar")}
      {item("me", "person", "Profile", updates)}
    </View>
  );
}
